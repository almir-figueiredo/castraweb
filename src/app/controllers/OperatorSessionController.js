import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import Operator from '../models/Operator';

import authConfig from '../../config/auth';

class OperatorSessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { email, password } = req.body;
    const operator = await Operator.findOne({
      where: { email },
    });

    if (!operator) {
      return res.status(401).json({ error: 'Operator not found.' });
    }
    if (!(await operator.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match.' });
    }

    const { id, name, cpf, registration, analyst, mananger } = operator;

    return res.json({
      user: {
        id,
        name,
        cpf,
        email,
        registration,
        analyst,
        mananger,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        // entrar no md5 online e gerar uma palavra
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new OperatorSessionController();
