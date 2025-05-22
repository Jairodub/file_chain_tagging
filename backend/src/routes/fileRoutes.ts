import express, { Router, Request, Response } from 'express';
import { FileController } from '../controllers/fileController';

const router: Router = express.Router();
const fileController = new FileController();

// File registration route
router.post('/register', async (req: Request, res: Response) => {
  await fileController.registerFile(req, res);
});

// File verification route
router.get('/verify/:hash', async (req: Request, res: Response) => {
  await fileController.verifyFile(req, res);
});

// File history route
router.get('/history/:hash', async (req: Request, res: Response) => {
  await fileController.getFileHistory(req, res);
});

export const fileRouter = router;