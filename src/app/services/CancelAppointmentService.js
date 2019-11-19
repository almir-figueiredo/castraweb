import { isBefore, subDays } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';
import Animal from '../models/Animal';
import Cache from '../../lib/Cache';

class CancelAppointmentService {
  async run({ clinic_id, citizen_id }) {
    const appointment = await Appointment.findByPk(clinic_id, {
      include: [
        {
          model: User,
          as: 'clinic',
          attributes: ['name'],
        },
        {
          model: User,
          as: 'operator',
          attributes: ['name'],
        },
        {
          model: Animal,
          as: 'animal',
          attributes: ['name', 'specie', 'gender'],
        },
      ],
    });

    if (appointment.citizen_id !== citizen_id) {
      throw new Error('Você não tem permissão para cancelar este agendamento.');
    }

    const dateWithSub = subDays(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      throw new Error(
        'Só é possível cancelar um agendamento com 2 dias de antecedência.'
      );
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    await Cache.invalidatePrefix(`user:${clinic_id}:appointments`);

    return appointment;
  }
}

export default new CancelAppointmentService();
