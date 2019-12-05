import {
  startOfMonth,
  endOfMonth,
  startOfDay,
  format,
  eachDayOfInterval,
  isAfter,
  isSaturday,
  isSunday,
} from 'date-fns';
import Appointment from '../models/Appointment';
import Animal from '../models/Animal';

class AvailableService {
  async run({ clinic_id, year, month, user_id }) {
    const schedule = eachDayOfInterval({
      start: startOfMonth(new Date(year, month, 0)),
      end: endOfMonth(new Date(year, month, 0)),
    });

    const promisses = schedule.map(async day => {
      const value = format(startOfDay(day), 'dd/MM/yyyy');
      const largeFemaleDog = await Appointment.findAndCountAll({
        where: {
          clinic_id,
          canceled_at: null,
          date: day,
        },
        include: [
          {
            model: Animal,
            where: { specie: 'canina', gender: 'F', size: 'G' },
          },
        ],
        distinct: true,
      });
      const smallFemaleDog = await Appointment.findAndCountAll({
        where: {
          clinic_id,
          canceled_at: null,
          date: day,
        },
        include: [
          {
            model: Animal,
            where: { specie: 'canina', gender: 'F', size: 'P' },
          },
        ],
        distinct: true,
      });
      const maleDog = await Appointment.findAndCountAll({
        where: {
          clinic_id,
          canceled_at: null,
          date: day,
        },
        include: [
          {
            model: Animal,
            where: { specie: 'canina', gender: 'M' },
          },
        ],
        distinct: true,
      });
      const femaleCat = await Appointment.findAndCountAll({
        where: {
          clinic_id,
          canceled_at: null,
          date: day,
        },
        include: [
          {
            model: Animal,
            where: { specie: 'felina', gender: 'F' },
          },
        ],
        distinct: true,
      });
      const maleCat = await Appointment.findAndCountAll({
        where: {
          clinic_id,
          canceled_at: null,
          date: day,
        },
        include: [
          {
            model: Animal,
            where: { specie: 'felina', gender: 'M' },
          },
        ],
        distinct: true,
      });

      const user_largeFemaleDog = await Animal.findAndCountAll({
        where: {
          user_id,
          specie: 'canina',
          gender: 'F',
          size: 'G',
        },
      });
      const user_smallFemaleDog = await Animal.findAndCountAll({
        where: {
          user_id,
          specie: 'canina',
          gender: 'F',
          size: 'P',
        },
      });
      const user_maleDog = await Animal.findAndCountAll({
        where: {
          user_id,
          specie: 'canina',
          gender: 'M',
        },
      });
      const user_femaleCat = await Animal.findAndCountAll({
        where: {
          user_id,
          specie: 'felina',
          gender: 'F',
        },
      });
      const user_maleCat = await Animal.findAndCountAll({
        where: {
          user_id,
          specie: 'felina',
          gender: 'M',
        },
      });

      return {
        day,
        value,
        largeFemaleDog,
        smallFemaleDog,
        maleDog,
        femaleCat,
        maleCat,
        user_largeFemaleDog,
        user_smallFemaleDog,
        user_maleDog,
        user_femaleCat,
        user_maleCat,
      };
    });

    const results = await Promise.all(promisses);

    const listDate = results.map(i => {
      const { day } = i;
      const { value } = i;
      const appointments_made = {
        n_largeFemaleDog: i.largeFemaleDog.count,
        n_smallFemaleDog: i.smallFemaleDog.count,
        n_maleDog: i.maleDog.count,
        n_femaleCat: i.femaleCat.count,
        n_maleCat: i.maleCat.count,
      };

      const available =
        isAfter(i.day, new Date()) &&
        !isSaturday(i.day) &&
        !isSunday(i.day) &&
        i.largeFemaleDog.count + i.user_largeFemaleDog.count <= 3 &&
        i.smallFemaleDog.count + i.user_smallFemaleDog.count <= 7 &&
        i.maleDog.count + i.user_maleDog.count <= 10 &&
        i.femaleCat.count + i.user_femaleCat.count <= 10 &&
        i.maleCat.count + i.user_maleCat.count <= 10;
      return {
        day,
        value,
        appointments_made,
        available,
      };
    });
    return listDate;
  }
}

export default new AvailableService();
