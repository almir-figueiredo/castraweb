import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class ClinicMember extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        cpf: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );

    this.addHook('beforeSave', async clinicMember => {
      if (clinicMember.password) {
        clinicMember.password_hash = await bcrypt.hash(
          clinicMember.password,
          8
        );
      }
    });

    return this;
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }

  static associate(models) {
    this.belongsTo(models.Clinic, { foreignKey: 'clinic_id', as: 'clinic' });
  }
}

export default ClinicMember;
