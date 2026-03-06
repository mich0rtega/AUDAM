import { Request, Response } from 'express';
import { CatalogService } from './catalog.service';

export class CatalogController {

  // Product Types
  static async listProductTypes(req: Request, res: Response) {
    try {
      const data = await CatalogService.listProductTypes(req.context!.environmentId);
      res.json(data);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  }

  static async createProductType(req: Request, res: Response) {
    try {
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ message: 'Nombre requerido' });
      const data = await CatalogService.createProductType(req.context!.environmentId, name, description, req.user!.userId);
      res.status(201).json(data);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  }

  static async toggleProductType(req: Request, res: Response) {
    try {
      await CatalogService.toggle('productType', req.params.id, req.user!.userId);
      res.json({ message: 'Estado actualizado' });
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  }

  // Product Status
  static async listProductStatus(req: Request, res: Response) {
    try {
      const data = await CatalogService.listProductStatus(req.context!.environmentId);
      res.json(data);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  }

  static async createProductStatus(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: 'Nombre requerido' });
      const data = await CatalogService.createProductStatus(req.context!.environmentId, name, req.user!.userId);
      res.status(201).json(data);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  }

  static async toggleProductStatus(req: Request, res: Response) {
    try {
      await CatalogService.toggle('productStatus', req.params.id, req.user!.userId);
      res.json({ message: 'Estado actualizado' });
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  }

  // Movement Types
  static async listMovementTypes(req: Request, res: Response) {
    try {
      const data = await CatalogService.listMovementTypes(req.context!.environmentId);
      res.json(data);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  }

  static async createMovementType(req: Request, res: Response) {
    try {
      const { name, direction } = req.body;
      if (!name || !direction) return res.status(400).json({ message: 'Datos incompletos' });
      const data = await CatalogService.createMovementType(req.context!.environmentId, name, direction, req.user!.userId);
      res.status(201).json(data);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  }

  static async toggleMovementType(req: Request, res: Response) {
    try {
      await CatalogService.toggle('movementType', req.params.id, req.user!.userId);
      res.json({ message: 'Estado actualizado' });
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  }

  // Asset Categories
  static async listAssetCategories(req: Request, res: Response) {
    try {
      const data = await CatalogService.listAssetCategories(req.context!.environmentId);
      res.json(data);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  }

  static async createAssetCategory(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: 'Nombre requerido' });
      const data = await CatalogService.createAssetCategory(req.context!.environmentId, name, req.user!.userId);
      res.status(201).json(data);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  }

  static async toggleAssetCategory(req: Request, res: Response) {
    try {
      await CatalogService.toggle('assetCategory', req.params.id, req.user!.userId);
      res.json({ message: 'Estado actualizado' });
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  }

  // Providers
  static async listProviders(req: Request, res: Response) {
    try {
      const data = await CatalogService.listProviders(req.context!.environmentId);
      res.json(data);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  }

  static async createProvider(req: Request, res: Response) {
    try {
      const data = await CatalogService.createProvider(req.context!.environmentId, req.body, req.user!.userId);
      res.status(201).json(data);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  }

  static async toggleProvider(req: Request, res: Response) {
    try {
      await CatalogService.toggle('provider', req.params.id, req.user!.userId);
      res.json({ message: 'Estado actualizado' });
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  }

  // Requisition Statuses
  static async listRequisitionStatuses(req: Request, res: Response) {
    try {
      const data = await CatalogService.listRequisitionStatuses(req.context!.environmentId);
      res.json(data);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  }

  static async createRequisitionStatus(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: 'Nombre requerido' });
      const data = await CatalogService.createRequisitionStatus(req.context!.environmentId, name, req.user!.userId);
      res.status(201).json(data);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  }
}