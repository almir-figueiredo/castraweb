import { Router } from 'express';
import Brute from 'express-brute';
import BruteRedis from 'express-brute-redis';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import OperatorController from './app/controllers/OperatorController';
import AnimalController from './app/controllers/AnimalController';
import SessionController from './app/controllers/SessionController';
import OperatorSessionController from './app/controllers/OperatorSessionController';
import FileController from './app/controllers/FileController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import ClinicController from './app/controllers/ClinicController';
import ClinicMemberController from './app/controllers/ClinicMemberController';
import ClinicSessionController from './app/controllers/ClinicSessionController';
import AvailableController from './app/controllers/AvailableController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

const bruteStore = new BruteRedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

const bruteForce = new Brute(bruteStore);

routes.post('/users', UserController.store);
routes.post('/operators', OperatorController.store);
routes.post('/sessions', bruteForce.prevent, SessionController.store);
routes.post(
  '/operators/sessions',
  bruteForce.prevent,
  OperatorSessionController.store
);
routes.post(
  '/clinics/sessions',
  bruteForce.prevent,
  ClinicSessionController.store
);

routes.use(authMiddleware);
routes.post('/users/:userId/animals', AnimalController.store);
routes.get('/users/:userId/animals/availabilities', AvailableController.index);
routes.get('/users/:userId/animals', AnimalController.index);
routes.post(
  '/users/:userId/animals/:animalId/appointments',
  AppointmentController.store
);
routes.get('/users/:userId/appointments', AppointmentController.index);

routes.put('/users', UserController.update);
routes.put('/operators', OperatorController.update);

// routes.put('/animals', AnimalController.update);

routes.post('/files', upload.single('file'), FileController.store);
routes.post('/clinics', ClinicController.store);
routes.get('/clinics/:clinicId/schedules', ScheduleController.index);
routes.post('/clinics/members', ClinicMemberController.store);
// routes.get('/clinics/:clinicId/available', AvailableController.index);

routes.delete('/appointments/:id', AppointmentController.delete);

export default routes;
