import { Request, Response } from 'express';
import { AssetsService } from './assets.service';

export class AssetsController {

  static async list(req: Request, res: Response) {
    const data = await AssetsService.list(
      req.context!.environmentId
    );
    res.json(data);
  }

  static async create(req: Request, res: Response) {
    const asset = await AssetsService.create(
      req.context!.environmentId,
      req.body,
      req.user!.userId
    );
    res.status(201).json(asset);
  }

  static async update(req: Request, res: Response) {
    const asset = await AssetsService.update(
      req.context!.environmentId,
      req.params.id,
      req.body,
      req.user!.userId
    );
    res.json(asset);
  }

  static async assign(req: Request, res: Response) {
    const asset = await AssetsService.assign(
      req.params.id,
      req.body.responsableId,
      req.user!.userId
    );
    res.json(asset);
  }

  static async changeStatus(req: Request, res: Response) {
    const asset = await AssetsService.changeStatus(
      req.params.id,
      req.body.statusId,
      req.user!.userId
    );
    res.json(asset);
  }

  static async getById(req: Request, res: Response) {
  const asset = await AssetsService.getById(
    req.context!.environmentId,
    req.params.id
  );
  res.json(asset);
}

static async transfer(req: Request, res: Response) {
  const asset = await AssetsService.transfer(
    req.context!.environmentId,
    req.params.id,
    req.body,
    req.user!.userId
  );
  res.json(asset);
}

static async history(req: Request, res: Response) {
  const history = await AssetsService.history(req.params.id);
  res.json(history);
}

}
