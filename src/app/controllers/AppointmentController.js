import * as Yup from 'yup';
import { parseISO, startOfDay, isBefore, format } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';
import Clinic from '../models/Clinic';
import Animal from '../models/Animal';
import CancelAppointmentService from '../services/CancelAppointmentService';

// import Cache from '../../lib/Cache';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    // const { clinic_id } = req.params.clinicId;

    // const cacheKey = `user:${req.userId}:appointments:${page}`;

    // const cached = await Cache.get(cacheKey);

    // if (cached) {
    //  return res.json(cached);
    // }

    const appointments = await Appointment.findAll({
      where: { user_id: req.params.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable', 'situation'],
      limit: 50,
      offset: (page - 1) * 50,
      include: [
        {
          model: Clinic,
          attributes: ['id', 'name'],
        },
        {
          model: User,
          attributes: ['id', 'name', 'cpf', 'email', 'phone'],
        },
        {
          model: Animal,
          attributes: ['id', 'name', 'specie', 'gender', 'race', 'size', 'age'],
        },
      ],
    });

    // await Cache.set(cacheKey, appointments);

    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      clinic_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { clinic_id, date } = req.body;

    const dayChoose = format(startOfDay(parseISO(date)), 'dd/MM/yyyy');

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

    const appointmentSave = await Appointment.create({
      user_id: req.params.userId,
      clinic_id,
      animal_id: req.params.animalId,
      date: dayChoose,
    });

    const appointment = await Appointment.findByPk(appointmentSave.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'cpf', 'email', 'phone', 'district'],
        },
        {
          model: Animal,
          attributes: ['id', 'name', 'specie', 'gender', 'race', 'size', 'age'],
        },
      ],
    });

    const animalExists = await Appointment.findOne({
      where: { animal_id: req.params.animalId },
    });

    if (animalExists) {
      return res
        .status(400)
        .json({ error: 'Não é possível agendar duas vezes o mesmo animal.' });
    }

    if (
      checkAvailability_LargeFemaleDog.count === 1 &&
      appointment.Animal.specie === 'canina' &&
      appointment.Animal.gender === 'F' &&
      appointment.Animal.size === 'G'
    ) {
      return res.status(400).json({
        error: 'Não há vagas para cadelas de grande porte neste dia.',
      });
    }
    if (
      checkAvailability_SmallFemaleDog.count === 3 &&
      appointment.Animal.specie === 'canina' &&
      appointment.Animal.gender === 'F' &&
      appointment.Animal.size === 'P'
    ) {
      return res.status(400).json({
        error: 'Não há vagas para cadelas de pequeno porte neste dia.',
      });
    }
    if (
      checkAvailability_MaleDog.count === 5 &&
      appointment.Animal.specie === 'canina' &&
      appointment.Animal.gender === 'M'
    ) {
      return res.status(400).json({
        error: 'Não há vagas para cachorros neste dia.',
      });
    }
    if (
      checkAvailability_FemaleCat.count === 5 &&
      appointment.Animal.specie === 'felina' &&
      appointment.Animal.gender === 'F'
    ) {
      return res.status(400).json({
        error: 'Não há vagas para gatas neste dia.',
      });
    }
    if (
      checkAvailability_MaleCat.count === 1 &&
      appointment.Animal.specie === 'felina' &&
      appointment.Animal.gender === 'M'
    ) {
      return res.status(400).json({
        error: 'Não há vagas para gatos neste dia.',
      });
    }
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
