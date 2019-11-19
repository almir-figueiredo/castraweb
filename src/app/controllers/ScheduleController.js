import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';
import User from '../models/User';
import Animal from '../models/Animal';

class ScheduleController {
  async index(req, res) {
    const checkUserClinic = await User.findOne({
      where: { id: req.userId, clinic: true },
    });

    if (!checkUserClinic) {
      return res.status(400).json({ error: 'Uma clínica deve ser escolhida.' });
    }

    const { date } = req.query;
    const parsedDate = parseISO(date);

    const appointments = await Appointment.findAll({
      where: {
        clinic_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      include: [
        {
          model: User,
          as: 'citizen',
          attributes: ['name'],
        },
        {
          model: Animal,
          as: 'animal',
          attributes: ['name', 'specie', 'gender', 'size'],
        },
      ],
      order: ['date'],
    });

    return res.json(appointments);
  }
}

export default new ScheduleController();
