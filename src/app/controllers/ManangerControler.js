import Operator from '../models/Operator';
import File from '../models/File';

class ManangerController {
  async index(req, res) {
    const manangers = await Operator.findAll({
      where: { mananger: true },
      attributes: ['id', 'name', 'email', 'functionalNumber', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(manangers);
  }
}

export default new ManangerController();
