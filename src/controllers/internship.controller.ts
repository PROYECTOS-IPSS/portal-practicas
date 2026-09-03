import type { Request, RequestHandler, Response } from 'express';
import { internshipService, type Actor } from '../services/internship.service.js';
import type {
  CreateInternshipInput,
  IdParam,
  ListInternshipsQuery,
  UpdateInternshipInput,
} from '../schemas/internship.schema.js';

// El actor sale de la sesión (requireAuth ya garantizó userId/role en las rutas).
const actorFrom = (req: Request): Actor => ({
  id: req.session.userId!,
  role: req.session.role!,
});

export const internshipController = {
  create: (async (req: Request, res: Response) => {
    // req.body ya fue validado y saneado por el middleware `validate` (Zod).
    const input = req.validated!.body as CreateInternshipInput;
    const record = await internshipService.create(actorFrom(req), input);
    res.status(201).json(record);
  }) as RequestHandler,

  getById: (async (req: Request, res: Response) => {
    const { id } = req.validated!.params as IdParam;
    const record = await internshipService.getById(actorFrom(req), id);
    res.status(200).json(record);
  }) as RequestHandler,

  list: (async (req: Request, res: Response) => {
    const query = req.validated!.query as ListInternshipsQuery;
    const result = await internshipService.list(actorFrom(req), query);
    res.status(200).json(result);
  }) as RequestHandler,

  update: (async (req: Request, res: Response) => {
    const { id } = req.validated!.params as IdParam;
    const input = req.validated!.body as UpdateInternshipInput;
    const record = await internshipService.update(actorFrom(req), id, input);
    res.status(200).json(record);
  }) as RequestHandler,

  remove: (async (req: Request, res: Response) => {
    const { id } = req.validated!.params as IdParam;
    const record = await internshipService.softDelete(actorFrom(req), id);
    res.status(200).json(record);
  }) as RequestHandler,
};
