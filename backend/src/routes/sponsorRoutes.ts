import { Router } from 'express';
import { SponsorController } from '../controllers/sponsorController';

const router = Router();
const sponsorController = new SponsorController();

router.post('/sign', sponsorController.signTransaction);
router.post('/init-user', sponsorController.signInitUserTransaction);

export default router;