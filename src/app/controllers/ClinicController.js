import * as Yup from 'yup';
import Clinic from '../models/Clinic';

// import Cache from '../../lib/Cache';

class ClinicController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      cnpj: Yup.string().required(),
      technical_legal: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      phone: Yup.string().required(),
      phone_24h: Yup.string().required(),
      address: Yup.string().required(),
      zipcode: Yup.string().required(),
      district: Yup.string().required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const cnpjExists = await Clinic.findOne({ where: { cnpj: req.body.cnpj } });

    if (cnpjExists) {
      return res.status(400).json({ error: 'clinic already exists.' });
    }
    const clinicExists = await Clinic.findOne({
      where: { email: req.body.email },
    });

    if (clinicExists) {
      return res.status(400).json({ error: 'clinic already exists.' });
    }

    const {
      id,
      name,
      cnpj,
      technical_legal,
      email,
      phone,
      phone_24h,
      address,
      zipCode,
      district,
    } = await Clinic.create(req.body);

    /* if (clinic) {
      await Cache.invalidate('clinics');
    } */

    return res.json({
      id,
      name,
      cnpj,
      technical_legal,
      email,
      phone,
      phone_24h,
      address,
      zipCode,
      district,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      cnpj: Yup.string(),
      technical_legal: Yup.date(),
      email: Yup.string().email(),
      phone: Yup.string(),
      address: Yup.string(),
      district: Yup.string(),
      zipCode: Yup.string(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }
    const { email, oldPassword, cnpj } = req.body;

    const clinic = await Clinic.findByPk(req.clinicId);

    if (cnpj !== clinic.cnpj) {
      const cnpjExists = await Clinic.findOne({ where: { cnpj } });

      if (cnpjExists) {
        return res.status(400).json({ error: 'clinic already exists.' });
      }
    }

    if (email !== clinic.email) {
      const clinicExists = await Clinic.findOne({ where: { email } });

      if (clinicExists) {
        return res.status(400).json({ error: 'clinic already exists.' });
      }
    }
    if (oldPassword && !(await clinic.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match.' });
    }

    await clinic.update(req.body);

    const { id } = await Clinic.findByPk(req.clinicId);

    const {
      name,
      technical_legal,
      phone,
      address,
      district,
      zipCode,
    } = req.body;

    return res.json({
      id,
      name,
      cnpj,
      technical_legal,
      email,
      phone,
      address,
      district,
      zipCode,
    });
  }
}

export default new ClinicController();
