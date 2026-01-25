import { Request, Response } from 'express';
import { CatalogService } from './catalog.service';

export class CatalogController {

  // Product Types
  static async listProductTypes(req: Request, res: Response) {
    const data = await CatalogService.listProductTypes(
      req.context!.environmentId
    );
    res.json(data);
  }

  static async createProductType(req: Request, res: Response) {
    const { name, description } = req.body;
    const environmentId = req.context!.environmentId;

    if (!name) {
      return res.status(400).json({ message: 'Nombre requerido' });
    }

    const data =
      await CatalogService.createProductType(environmentId, name, description);

    res.status(201).json(data);
  }

  static async toggleProductType(req: Request, res: Response) {
    await CatalogService.toggle('productType', req.params.id);
    res.json({ message: 'Estado actualizado' });
  }

  // Product Status
  static async listProductStatus(req: Request, res: Response) {
    const data = await CatalogService.listProductStatus(
      req.context!.environmentId
    );
    res.json(data);
  }

  static async createProductStatus(req: Request, res: Response) {
    const { name } = req.body;
    const environmentId = req.context!.environmentId;

    if (!name) {
      return res.status(400).json({ message: 'Nombre requerido' });
    }

    res.status(201).json(
      await CatalogService.createProductStatus(environmentId, name)
    );
  }

  static async toggleProductStatus(req: Request, res: Response) {
    await CatalogService.toggle('productStatus', req.params.id);
    res.json({ message: 'Estado actualizado' });
  }

  // Movement Types
  static async listMovementTypes(req: Request, res: Response) {
    const data = await CatalogService.listMovementTypes(
      req.context!.environmentId
    );
    res.json(data);
  }

  static async createMovementType(req: Request, res: Response) {
    const { name, direction } = req.body;
    const environmentId = req.context!.environmentId;

    if (!name || !direction) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }

    res.status(201).json(
      await CatalogService.createMovementType(
        environmentId,
        name,
        direction
      )
    );
  }

  static async toggleMovementType(req: Request, res: Response) {
    await CatalogService.toggle('movementType', req.params.id);
    res.json({ message: 'Estado actualizado' });
  }

  // Asset Categories
  static async listAssetCategories(req: Request, res: Response) {
    const data = await CatalogService.listAssetCategories(
      req.context!.environmentId
    );
    res.json(data);
  }

  static async createAssetCategory(req: Request, res: Response) {
    const { name } = req.body;
    const environmentId = req.context!.environmentId;

    if (!name) {
      return res.status(400).json({ message: 'Nombre requerido' });
    }

    res.status(201).json(
      await CatalogService.createAssetCategory(environmentId, name)
    );
  }

  static async toggleAssetCategory(req: Request, res: Response) {
    await CatalogService.toggle('assetCategory', req.params.id);
    res.json({ message: 'Estado actualizado' });
  }

  // Providers
  static async listProviders(req: Request, res: Response) {
    const data = await CatalogService.listProviders(
      req.context!.environmentId
    );
    res.json(data);
  }

  static async createProvider(req: Request, res: Response) {
    const environmentId = req.context!.environmentId;

    res.status(201).json(
      await CatalogService.createProvider(environmentId, req.body)
    );
  }

  static async toggleProvider(req: Request, res: Response) {
    await CatalogService.toggle('provider', req.params.id);
    res.json({ message: 'Estado actualizado' });
  }

}
