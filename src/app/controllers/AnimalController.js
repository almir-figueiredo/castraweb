import * as Yup from 'yup';
import Animal from '../models/Animal';

class AnimalController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      specie: Yup.string().required(),
      gender: Yup.string().required(),
      race: Yup.string().required(),
      size: Yup.string().required(),
      age: Yup.integer().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const animalExists = await Animal.findOne({
      where: {
        name: req.body.name,
        specie: req.body.specie,
        gender: req.body.gender,
      },
    });

    if (animalExists) {
      return res.status(400).json({
        error: 'Animal já cadastrado, verifique os dados informados.',
      });
    }
    const { id, name, specie, gender, race, size, age } = await Animal.create(
      req.body
    );

    return res.json({
      id,
      name,
      specie,
      gender,
      race,
      size,
      age,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      specie: Yup.string().required(),
      gender: Yup.string().required(),
      race: Yup.string().required(),
      size: Yup.string().required(),
      age: Yup.integer().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const animal = await Animal.findByPk(req.animalId);

    await animal.update(req.body);

    const { id, name, specie, gender, race, size, age } = await Animal.findByPk(
      req.animalId
    );

    return res.json({
      id,
      name,
      specie,
      gender,
      race,
      size,
      age,
    });
  }
}

export default new AnimalController();
