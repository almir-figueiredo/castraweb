import * as Yup from 'yup';
import Appointment from '../models/Appointment';
import User from '../models/User';
import CreateAppointmentService from '../services/CreateAppointmentService';
import CancelAppointmentService from '../services/CancelAppointmentService';

import Cache from '../../lib/Cache';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const cacheKey = `user:${req.userId}:appointments:${page}`;

    const cached = await Cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const appointments = await Appointment.findAll({
      where: { clinic_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable', 'situation'],
      limit: 50,
      offset: (page - 1) * 50,
      include: [
        {
          model: User,
          as: 'clinic',
          attributes: ['id', 'name'],
        },
      ],
    });

    await Cache.set(cacheKey, appointments);

    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      clinic_id: Yup.number().required(),
      animal_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { clinic_id, animal_id, date } = req.body;

    const appointment = await CreateAppointmentService.run({
      citizen_id: req.userId,
      clinic_id,
      animal_id,
      date,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await CancelAppointmentService.run({
      operator_id: req.userId,
      clinic_id: req.params.id,
    });
    return res.json(appointment);
  }
}

export default new AppointmentController();
