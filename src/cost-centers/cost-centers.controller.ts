import { Request, Response } from 'express';
import { CostCentersService } from './cost-centers.service';

export class CostCentersController {

  static async list(req: Request, res: Response) {
    const environmentId = req.context!.environmentId;

    const data =
      await CostCentersService.list(environmentId);

    res.json(data);
  }

  static async create(req: Request, res: Response) {
    const { name, code } = req.body;
    const environmentId = req.context!.environmentId;

    if (!name) {
      return res.status(400).json({ message: 'Nombre requerido' });
    }

    const created =
      await CostCentersService.create(environmentId, name, code);

    res.status(201).json(created);
  }

  static async toggle(req: Request, res: Response) {
    await CostCentersService.toggle(req.params.id);
    res.json({ message: 'Estado actualizado' });
  }

}
