import Operator from '../models/Operator';
import File from '../models/File';

class AnalystController {
  async index(req, res) {
    const analysts = await Operator.findAll({
      where: { analyst: true },
      attributes: ['id', 'name', 'email', 'functionalNumber', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(analysts);
  }
}

export default new AnalystController();
