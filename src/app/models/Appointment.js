import Sequelize, { Model } from 'sequelize';
import { isBefore, subDays, isAfter } from 'date-fns';

class Appointment extends Model {
  static init(sequelize) {
    super.init(
      {
        date: Sequelize.DATE,
        user_id: Sequelize.INTEGER,
        animal_id: Sequelize.INTEGER,
        clinic_id: Sequelize.INTEGER,
        canceled_at: Sequelize.DATE,
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.date, new Date());
          },
        },
        cancelable: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(new Date(), subDays(this.date, 2));
          },
        },
        situation: {
          type: Sequelize.VIRTUAL,
          get() {
            return isAfter(this.date, new Date()) ? 'Agendado' : null;
          },
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id' });
    this.belongsTo(models.Clinic, { foreignKey: 'clinic_id' });
    this.belongsTo(models.Animal, { foreignKey: 'animal_id' });
  }
}

export default Appointment;
