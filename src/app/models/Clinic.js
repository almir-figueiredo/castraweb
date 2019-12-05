import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class Clinic extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        cnpj: Sequelize.STRING,
        technical_legal: Sequelize.STRING,
        email: Sequelize.STRING,
        phone: Sequelize.STRING,
        phone_24h: Sequelize.STRING,
        address: Sequelize.STRING,
        zipcode: Sequelize.STRING,
        district: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );

    this.addHook('beforeSave', async clinic => {
      if (clinic.password) {
        clinic.password_hash = await bcrypt.hash(clinic.password, 8);
      }
    });

    return this;
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default Clinic;
