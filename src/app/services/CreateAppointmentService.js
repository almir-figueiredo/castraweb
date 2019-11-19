import { startOfHour, parseISO, isBefore } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';

import Cache from '../../lib/Cache';

class CreateAppointmentService {
  async run({ clinic_id, animal_id, citizen_id, date }) {
    // Check if provider_id is a provider

    const isClinic = await User.findOne({
      where: { id: clinic_id, clinic: true },
    });

    if (!isClinic) {
      throw new Error('Selecione uma clínica para agendamento');
    }

    // check for past dates.
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      throw new Error('Não é possível agendar em datas passadas');
    }

    // check date availability (para as clínicas usar findAndCountAll)
    const checkAvailability = await Appointment.findOne({
      where: {
        clinic_id,
        animal_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      throw new Error('Appointment date is not available');
    }

    const appointment = await Appointment.create({
      citizen_id,
      clinic_id,
      animal_id,
      date: hourStart,
    });

    await Cache.invalidatePrefix(`user:${clinic_id}:appointments`);

    return appointment;
  }
}

export default new CreateAppointmentService();
