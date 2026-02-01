import { Request, Response } from 'express';
import { ProductsService } from './products.service';

export class ProductsController {
  static async list(req: Request, res: Response) {
    const data = await ProductsService.list(
      req.context!.environmentId
    );
    res.json(data);
  }

  static async getById(req: Request, res: Response) {
    const product = await ProductsService.getById(
      req.context!.environmentId,
      req.params.id
    );
    res.json(product);
  }

  static async create(req: Request, res: Response) {
    const product = await ProductsService.create(
      req.context!.environmentId,
      req.body,
      req.user!.userId
    );
    res.status(201).json(product);
  }

  static async update(req: Request, res: Response) {
    const product = await ProductsService.update(
      req.context!.environmentId,
      req.params.id,
      req.body,
      req.user!.userId
    );
    res.json(product);
  }

  static async createMovement(req: Request, res: Response) {
    const result = await ProductsService.createMovement(
      req.context!.environmentId,
      req.params.id,
      req.body,
      req.user!.userId
    );
    res.status(201).json(result);
  }

  static async listMovements(req: Request, res: Response) {
    const data = await ProductsService.listMovements(
      req.context!.environmentId,
      req.params.id
    );
    res.json(data);
  }
  static async disable(req: Request, res: Response) {
  const product = await ProductsService.disable(
    req.context!.environmentId,
    req.params.id,
    req.user!.userId
  );
  res.json(product);
}

static async enable(req: Request, res: Response) {
  const product = await ProductsService.enable(
    req.context!.environmentId,
    req.params.id,
    req.user!.userId
  );
  res.json(product);
}

static async adjustStock(req: Request, res: Response) {
  const result = await ProductsService.adjustStock(
    req.context!.environmentId,
    req.params.id,
    req.body,
    req.user!.userId
  );
  res.status(201).json(result);
}

static async changePrice(req: Request, res: Response) {
  const product = await ProductsService.changePrice(
    req.context!.environmentId,
    req.params.id,
    req.body.precioUnitario,
    req.user!.userId
  );
  res.json(product);
}


}

