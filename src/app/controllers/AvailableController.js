import AvailableService from '../services/AvailableService';

class AvailableController {
  async index(req, res) {
    const { year, month, clinic_id } = req.body;

    const availability = await AvailableService.run({
      year,
      month,
      clinic_id,
      user_id: req.params.userId,
    });

    return res.json(availability);
  }
}
export default new AvailableController();
