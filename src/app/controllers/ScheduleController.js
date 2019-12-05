import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';
import User from '../models/User';
import Animal from '../models/Animal';

class ScheduleController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const { date } = req.body;
    const parsedDate = startOfDay(parseISO(date));

    const appointments = await Appointment.findAll({
      where: {
        clinic_id: req.params.clinicId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      attributes: ['id', 'date', 'cancelable', 'situation'],
      limit: 50,
      offset: (page - 1) * 50,
      include: [
        {
          model: User,
          attributes: ['name', 'cpf', 'email', 'phone', 'district'],
          order: ['name'],
        },
        {
          model: Animal,
          attributes: ['name', 'specie', 'gender', 'race', 'age', 'size'],
        },
      ],
    });

    return res.json(appointments);
  }
}

export default new ScheduleController();
