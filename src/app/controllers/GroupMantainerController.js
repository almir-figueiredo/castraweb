import User from '../models/User';
import File from '../models/File';

class GroupMantainerController {
  async index(req, res) {
    const groupMantainers = await User.findAll({
      where: { group_mantainer: true },
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(groupMantainers);
  }
}

export default new GroupMantainerController();
