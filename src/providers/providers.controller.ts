import { Request, Response } from 'express';
import { ProvidersService } from './providers.service';

export class ProvidersController {

  static async list(req: Request, res: Response) {
    const environmentId = req.context!.environmentId;
    const data = await ProvidersService.list(environmentId);
    res.json(data);
  }

  static async getById(req: Request, res: Response) {
    const provider = await ProvidersService.getById(
      req.context!.environmentId,
      req.params.id
    );
    res.json(provider);
  }

  static async create(req: Request, res: Response) {
    const { nombre, contacto, telefono, email, direccion } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: 'Nombre es requerido' });
    }

    const created = await ProvidersService.create(
      req.context!.environmentId,
      { nombre, contacto, telefono, email, direccion }
    );

    res.status(201).json(created);
  }

  static async update(req: Request, res: Response) {
    const updated = await ProvidersService.update(
      req.context!.environmentId,
      req.params.id,
      req.body
    );

    res.json(updated);
  }

  static async toggle(req: Request, res: Response) {
    const updated = await ProvidersService.toggle(
      req.context!.environmentId,
      req.params.id
    );

    res.json(updated);
  }

}
