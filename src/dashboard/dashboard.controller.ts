import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';

export class DashboardController {

  static async overview(req: Request, res: Response) {
    const environmentId = req.context!.environmentId;
    const role = req.context!.role;

    const data = await DashboardService.overview(environmentId, role);
    res.json(data);
  }

}
