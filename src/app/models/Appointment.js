import Sequelize, { Model } from 'sequelize';
import { isBefore, subDays } from 'date-fns';

class Appointment extends Model {
  static init(sequelize) {
    super.init(
      {
        date: Sequelize.DATE,
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
        situation: Sequelize.VIRTUAL,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'citizen_id', as: 'citizen' });
    this.belongsTo(models.User, { foreignKey: 'clinic_id', as: 'clinic' });
    this.belongsTo(models.User, { foreignKey: 'operator_id', as: 'operator' });
    this.belongsTo(models.Animal, { foreignKey: 'animal_id', as: 'animal' });
  }
}

export default Appointment;
