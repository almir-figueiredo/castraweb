import Sequelize, { Model } from 'sequelize';

class Animal extends Model {
  static init(sequelize) {
    super.init(
      {
        user_id: Sequelize.INTEGER,
        auth_number: Sequelize.STRING,
        name: Sequelize.STRING,
        specie: Sequelize.STRING,
        gender: Sequelize.STRING,
        race: Sequelize.STRING,
        size: Sequelize.STRING,
        age: Sequelize.INTEGER,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id' });
  }
}

export default Animal;
