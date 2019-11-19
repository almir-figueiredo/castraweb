import User from '../models/User';
import Cache from '../../lib/Cache';

class ProviderController {
  async index(req, res) {
    const cached = await Cache.get('clinics');

    if (cached) {
      return res.jason(cached);
    }

    const clinics = await User.findAll({
      where: { clinic: true },
      attributes: ['id', 'name', 'email'],
    });

    await Cache.set('clinics', clinics);

    return res.json(clinics);
  }
}

export default new ProviderController();
