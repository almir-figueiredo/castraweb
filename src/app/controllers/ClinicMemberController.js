import * as Yup from 'yup';
import ClinicMember from '../models/ClinicMember';
import File from '../models/File';

class ClinicMemberController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      cpf: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const clinicMemberExists = await ClinicMember.findOne({
      where: { email: req.body.email },
    });

    if (clinicMemberExists) {
      return res.status(400).json({ error: 'clinic member already exists.' });
    }
    const { id, name, cpf, email } = await ClinicMember.create(req.body);

    return res.json({
      id,
      name,
      cpf,
      email,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      cpf: Yup.string(),
      email: Yup.string().email(),
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
    const { email, oldPassword } = req.body;

    const clinicMember = await ClinicMember.findByPk(req.clinicMemberId);

    if (email !== clinicMember.email) {
      const clinicMemberExists = await ClinicMember.findOne({
        where: { email },
      });

      if (clinicMemberExists) {
        return res.status(400).json({ error: 'clinic member already exists.' });
      }
    }
    if (oldPassword && !(await clinicMember.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match.' });
    }

    await clinicMember.update(req.body);

    const { id, name, avatar } = await clinicMember.findByPk(
      req.clinicMemberId,
      {
        include: [
          {
            model: File,
            as: 'avatar',
            attributes: ['id', 'path', 'url'],
          },
        ],
      }
    );

    return res.json({
      id,
      name,
      email,
      avatar,
    });
  }
}

export default new ClinicMemberController();
