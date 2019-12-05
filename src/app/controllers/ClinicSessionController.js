import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import Clinic from '../models/Clinic';

import authConfig from '../../config/auth';

class ClinicSessionController {
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
    const clinic = await Clinic.findOne({
      where: { email },
    });

    if (!clinic) {
      return res.status(401).json({ error: 'Clinic not found.' });
    }
    if (!(await clinic.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match.' });
    }

    const {
      id,
      name,
      cnpj,
      technical_legal,
      phone,
      phone_24h,
      address,
      zipcode,
      district,
    } = clinic;

    return res.json({
      clinic: {
        id,
        name,
        cnpj,
        technical_legal,
        email,
        phone,
        phone_24h,
        address,
        zipcode,
        district,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        // entrar no md5 online e gerar uma palavra
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new ClinicSessionController();
