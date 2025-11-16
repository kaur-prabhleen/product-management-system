import express from 'express';
import { uploadCSVMiddleware, enqueueBulkUpload } from '../controllers/bulk.controller.js';
import { getJobStatus } from '../controllers/job.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/upload', authenticate, uploadCSVMiddleware, enqueueBulkUpload);
router.get('/status/:id', authenticate, getJobStatus);

export default router;
