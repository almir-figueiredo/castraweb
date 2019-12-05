import { endOfDay, parseISO, isBefore } from 'date-fns';
import Appointment from '../models/Appointment';
import Animal from '../models/Animal';

// import Cache from '../../lib/Cache';

class CreateAppointmentService {
  async run({ clinic_id, animal_id, user_id, date }) {
    // Check if provider_id is a provider

    /* const isClinic = await Clinic.findOne({
      where: { id: clinic_id, clinic: true },
    });

    if (!isClinic) {
      throw new Error('Selecione uma clínica para agendamento');
    } */

    // check for past dates.
    const dayChoose = endOfDay(parseISO(date));

    if (isBefore(dayChoose, new Date())) {
      throw new Error('Não é possível agendar em datas passadas');
    }

    // check date availability (para as clínicas usar findAndCountAll)

    const checkAvailability_LargeFemaleDog = await Appointment.findAndCountAll({
      where: {
        clinic_id,
        canceled_at: null,
        date: dayChoose,
      },
      include: [
        {
          model: Animal,
          where: { specie: 'canina', gender: 'F', size: 'G' },
        },
      ],
      distinct: true,
    });
    const checkAvailability_SmallFemaleDog = await Appointment.findAndCountAll({
      where: {
        clinic_id,
        canceled_at: null,
        date: dayChoose,
      },
      include: [
        {
          model: Animal,

          where: { specie: 'canina', gender: 'F', size: 'P' },
        },
      ],
      distinct: true,
    });
    const checkAvailability_MaleDog = await Appointment.findAndCountAll({
      where: {
        clinic_id,
        canceled_at: null,
        date: dayChoose,
      },
      include: [
        {
          model: Animal,

          where: { specie: 'canina', gender: 'M' },
        },
      ],
      distinct: true,
    });
    const checkAvailability_MaleCat = await Appointment.findAndCountAll({
      where: {
        clinic_id,
        canceled_at: null,
        date: dayChoose,
      },
      include: [
        {
          model: Animal,

          where: { specie: 'felina', gender: 'M' },
        },
      ],
      distinct: true,
    });
    const checkAvailability_FemaleCat = await Appointment.findAndCountAll({
      where: {
        clinic_id,
        canceled_at: null,
        date: dayChoose,
      },
      include: [
        {
          model: Animal,
          where: { specie: 'felina', gender: 'F' },
        },
      ],
      distinct: true,
    });

    if (
      checkAvailability_LargeFemaleDog.count === 1 ||
      checkAvailability_SmallFemaleDog.count === 3 ||
      checkAvailability_MaleDog.count === 3 ||
      checkAvailability_MaleCat.count === 5 ||
      checkAvailability_FemaleCat.count === 5
    ) {
      throw new Error('Não é possível agendar um de seus animais nesta data');
    }

    const appointment = await Appointment.create({
      user_id,
      clinic_id,
      animal_id,
      date: dayChoose,
    });

    // await Cache.invalidatePrefix(`user:${clinic_id}:appointments`);

    return appointment;
  }
}

export default new CreateAppointmentService();
