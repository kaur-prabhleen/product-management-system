import express from 'express';
import { listUploads, downloadUpload } from '../controllers/report.controller.js';
import { exportProducts } from '../controllers/productReport.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/uploads', authenticate, listUploads);

router.get('/uploads/:jobId/download', authenticate, downloadUpload);

router.get('/products', authenticate, exportProducts);

export default router;
