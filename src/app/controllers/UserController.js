import * as Yup from 'yup';
import User from '../models/User';

// import Cache from '../../lib/Cache';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      cpf: Yup.string().required(),
      birthday: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      phone: Yup.string().required(),
      address: Yup.string().required(),
      district: Yup.string().required(),
      zipcode: Yup.string().required(),
      password: Yup.string()
        .required()
        .min(6),
      group_mantainer: Yup.boolean().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const cpfExists = await User.findOne({ where: { cpf: req.body.cpf } });

    if (cpfExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }
    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const {
      id,
      name,
      cpf,
      birthday,
      email,
      phone,
      address,
      district,
      zipCode,
      group_mantainer,
    } = await User.create(req.body);

    /* if (clinic) {
      await Cache.invalidate('clinics');
    } */

    return res.json({
      id,
      name,
      cpf,
      birthday,
      email,
      phone,
      address,
      district,
      zipCode,
      group_mantainer,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      cpf: Yup.string(),
      birthday: Yup.date(),
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
    const { email, oldPassword, cpf } = req.body;

    const user = await User.findByPk(req.userId);

    if (cpf !== user.cpf) {
      const cpfExists = await User.findOne({ where: { cpf } });

      if (cpfExists) {
        return res.status(400).json({ error: 'User already exists.' });
      }
    }

    if (email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: 'User already exists.' });
      }
    }
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match.' });
    }

    await user.update(req.body);

    const { id } = await User.findByPk(req.userId);

    const { name, birthday, phone, address, district, zipCode } = req.body;

    return res.json({
      id,
      name,
      cpf,
      birthday,
      email,
      phone,
      address,
      district,
      zipCode,
    });
  }
}

export default new UserController();
