import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';

class Availableservice {
  async run({ clinic_id, date }) {
    const appointments = await Appointment.findAll({
      where: {
        clinic_id,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(date), endOfDay(date)],
        },
      },
    });
    const schedule = [
      '23:01',
      '23:02',
      '23:03',
      '23:04',
      '23:05',
      '23:06',
      '23:07',
      '23:08',
      '23:09',
      '23:10',
      '23:11',
      '23:12',
      '23:13',
      '23:14',
      '23:15',
      '23:16',
      '23:17',
      '23:18',
      '23:19',
      '23:20',
      '23:21',
      '23:22',
      '23:23',
      '23:24',
      '23:25',
      '23:26',
      '23:27',
      '23:28',
      '23:29',
      '23:30',
      '23:31',
      '23:32',
      '23:33',
      '23:34',
      '23:35',
      '23:36',
      '23:37',
      '23:38',
      '23:39',
      '23:40',
      '23:41',
      '23:42',
      '23:43',
      '23:44',
      '23:45',
      '23:46',
      '23:47',
      '23:48',
      '23:49',
      '23:50',
    ];

    const available = schedule.map(time => {
      const [hour, minute] = time.split(':');
      const value = setSeconds(setMinutes(setHours(date, hour), minute), 0);

      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        available:
          isAfter(value, new Date()) &&
          !appointments.find(a => format(a.date, 'HH:mm') === time),
      };
    });

    return available;
  }
}

export default new Availableservice();
