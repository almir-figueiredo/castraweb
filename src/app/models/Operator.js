import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class Operator extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        cpf: Sequelize.STRING,
        email: Sequelize.STRING,
        registration: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        analyst: Sequelize.BOOLEAN,
        mananger: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );

    this.addHook('beforeSave', async operator => {
      if (operator.password) {
        operator.password_hash = await bcrypt.hash(operator.password, 8);
      }
    });

    return this;
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default Operator;
