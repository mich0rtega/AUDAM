import { Request, Response } from 'express';
import { MovementsService } from './movements.service';
import { PDFGeneratorService } from '../pdf-generator/pdf-generator.service';
import { MovementWithDetails } from './movements.types';

const service = new MovementsService();

interface RequestWithEnv extends Request {
  environmentId?: string;
}

export class MovementsController {

  async findAll(req: Request, res: Response) {
    const environmentId = (req as RequestWithEnv).environmentId as string;

    const data = await service.findAll(environmentId);
    res.json(data);
  }


  async findById(req: Request, res: Response) {
    const { id } = req.params;
    const environmentId = (req as RequestWithEnv).environmentId as string;

    const data = await service.findById(id, environmentId);
    res.json(data);
  }


  async create(req: Request, res: Response) {
    const environmentId = (req as RequestWithEnv).environmentId as string;

    const movement = await service.create(req.body, environmentId);
    res.status(201).json(movement);
  }


  async update(req: Request, res: Response) {
    const { id } = req.params;
    const environmentId = (req as RequestWithEnv).environmentId as string;

    const movement = await service.update(id, req.body, environmentId);
    res.json(movement);
  }


  async remove(req: Request, res: Response) {
    const { id } = req.params;
    const environmentId = (req as RequestWithEnv).environmentId as string;

    await service.remove(id, environmentId);
    res.status(204).send();
  }

  async downloadPDF(req: Request, res: Response) {
    const { id } = req.params;
    const environmentId = (req as RequestWithEnv).environmentId as string;

    const movement = await service.findById(id, environmentId);
    const environmentName = await service.getEnvironmentName(environmentId);

    const pdfBuffer = await PDFGeneratorService.generateMovementPDF(movement as unknown as MovementWithDetails, environmentName);
    PDFGeneratorService.sendPDFResponse(res, pdfBuffer, `movimiento-${movement.id}.pdf`);
  }
}
