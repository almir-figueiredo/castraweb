import * as Yup from 'yup';

import Operator from '../models/Operator';
import File from '../models/File';

class OperatorController {
  async index(req, res) {
    const operators = await Operator.findAll({
      where: { operator: true },
      attributes: ['id', 'name', 'email', 'registration', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(operators);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      cpf: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      registration: Yup.string().required(),
      password: Yup.string()
        .required()
        .min(6),
      analyst: Yup.boolean().required(),
      mananger: Yup.boolean().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const cpfExists = await Operator.findOne({ where: { cpf: req.body.cpf } });

    if (cpfExists) {
      return res.status(400).json({ error: 'Operator already exists.' });
    }
    const operatorExists = await Operator.findOne({
      where: { email: req.body.email },
    });

    if (operatorExists) {
      return res.status(400).json({ error: 'Operator already exists.' });
    }

    const {
      id,
      name,
      cpf,
      email,
      registration,
      analyst,
      mananger,
    } = await Operator.create(req.body);

    /* if (clinic) {
      await Cache.invalidate('clinics');
    } */

    return res.json({
      id,
      name,
      cpf,
      email,
      registration,
      analyst,
      mananger,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      cpf: Yup.string(),
      email: Yup.string().email(),
      registration: Yup.string(),
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

    const operator = await Operator.findByPk(req.operatorId);

    if (cpf !== operator.cpf) {
      const cpfExists = await Operator.findOne({ where: { cpf } });

      if (cpfExists) {
        return res.status(400).json({ error: 'Operator already exists.' });
      }
    }

    if (email !== operator.email) {
      const operatorExists = await Operator.findOne({ where: { email } });

      if (operatorExists) {
        return res.status(400).json({ error: 'Operator already exists.' });
      }
    }
    if (oldPassword && !(await operator.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match.' });
    }

    await operator.update(req.body);

    const { id } = await operator.findByPk(req.operatorId);

    const { name, registration } = req.body;

    return res.json({
      id,
      name,
      cpf,
      email,
      registration,
    });
  }
}

export default new OperatorController();
