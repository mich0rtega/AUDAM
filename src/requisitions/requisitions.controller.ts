import { Request, Response } from 'express';
import { RequisitionsService } from './requisitions.service';
import {
  CreateRequisitionDto,
  UpdateRequisitionDto,
  AuthorizeRequisitionDto
} from './requisitions.types';
import { PDFGeneratorService } from '../pdf-generator/pdf-generator.service';
import { prisma } from '../config/prisma';
import { Role } from '@prisma/client';

export class RequisitionsController {

  static async create(req: Request, res: Response) {
    try {
      const dto: CreateRequisitionDto = req.body;
      const environmentId = req.context!.environmentId;
      const actorId = req.user!.userId;

      const requisition = await RequisitionsService.createRequisition(dto, environmentId, actorId);
      res.status(201).json(requisition);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const environmentId = req.context!.environmentId;
      const filters = {
        statusId: req.query.statusId as string,
        solicitorId: req.query.solicitorId as string,
        folio: req.query.folio as string,
        costCenterId: req.query.costCenterId as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      };

      const requisitions = await RequisitionsService.getRequisitions(environmentId, filters);
      res.json(requisitions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const environmentId = req.context!.environmentId;

      const requisition = await RequisitionsService.getRequisitionById(id, environmentId);
      if (!requisition) return res.status(404).json({ error: 'Requisición no encontrada' });

      res.json(requisition);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dto: UpdateRequisitionDto = req.body;
      const environmentId = req.context!.environmentId;
      const actorId = req.user!.userId;

      const updated = await RequisitionsService.updateRequisition(id, dto, environmentId, actorId);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async authorize(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dto: AuthorizeRequisitionDto = req.body;
      const environmentId = req.context!.environmentId;
      const actorId = req.user!.userId;
      // Obtener el rol del contexto (seteado por el middleware de entorno)
      const actorRole = req.context!.role as Role;

      const updated = await RequisitionsService.authorizeRequisition(
        id,
        dto,
        environmentId,
        actorId,
        actorRole
      );

      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const environmentId = req.context!.environmentId;
      const actorId = req.user!.userId;

      const updated = await RequisitionsService.removeRequisition(id, environmentId, actorId);
      res.json({ message: 'Requisición cancelada correctamente', requisition: updated });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async restore(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const environmentId = req.context!.environmentId;
      const actorId = req.user!.userId;

      const updated = await RequisitionsService.restoreRequisition(id, environmentId, actorId);
      res.json({ message: 'Requisición restaurada correctamente', requisition: updated });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getNextFolio(req: Request, res: Response) {
    try {
      const environmentId = req.context!.environmentId;
      const nextFolio = await RequisitionsService.getNextFolio(environmentId);
      res.json({ folio: nextFolio });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async downloadPDF(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const environmentId = req.context!.environmentId;

      const requisition = await RequisitionsService.getRequisitionById(id, environmentId);
      if (!requisition) return res.status(404).json({ error: 'Requisición no encontrada' });

      const environment = await prisma.environment.findUnique({ where: { id: environmentId } });
      const environmentName = environment?.name || 'MILPILLAS';

      const pdfBuffer = await PDFGeneratorService.generateRequisitionPDF(requisition, environmentName);
      const filename = `requisicion_${requisition.folio}_${Date.now()}.pdf`;
      PDFGeneratorService.sendPDFResponse(res, pdfBuffer, filename);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}