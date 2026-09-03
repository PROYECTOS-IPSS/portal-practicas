import { Router } from 'express';
import { internshipController } from '../controllers/internship.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireTeacher } from '../middleware/rbac.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createInternshipSchema,
  idParamSchema,
  listInternshipsQuerySchema,
  updateInternshipSchema,
} from '../schemas/internship.schema.js';

const router = Router();

// Todo el recurso exige sesión (no hay rutas públicas de prácticas).
router.use(requireAuth);

// STUDENT: GET y POST sobre sus propios registros (la pertenencia la decide el service).
// TEACHER: GET global; PUT y DELETE requieren rol TEACHER.
router.get('/', validate(listInternshipsQuerySchema, 'query'), internshipController.list);
router.post('/', validate(createInternshipSchema), internshipController.create);
router.get(
  '/:id',
  validate(idParamSchema, 'params'),
  internshipController.getById,
);
router.put(
  '/:id',
  requireTeacher,
  validate(idParamSchema, 'params'),
  validate(updateInternshipSchema),
  internshipController.update,
);
router.delete(
  '/:id',
  requireTeacher,
  validate(idParamSchema, 'params'),
  internshipController.remove,
);

export default router;
