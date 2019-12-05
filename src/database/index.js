import Sequelize from 'sequelize';

import User from '../app/models/User';
import Operator from '../app/models/Operator';
import Animal from '../app/models/Animal';
import Clinic from '../app/models/Clinic';
import Appointment from '../app/models/Appointment';
import File from '../app/models/File';

import databaseConfig from '../config/database';

const models = [User, File, Appointment, Animal, Operator, Clinic];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
