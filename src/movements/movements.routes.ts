import { Router } from 'express';
import { MovementsController } from './movements.controller';
import { businessRoute } from '../middlewares/business.middleware';

const router = Router();
const controller = new MovementsController();



    

router.get('/', controller.findAll);
router.get('/:id', controller.findById);
router.get('/:id/pdf', controller.downloadPDF);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;
