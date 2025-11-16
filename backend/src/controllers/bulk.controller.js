import multer from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import { publishToQueue } from '../queue/rabbit.js';
import dotenv from 'dotenv';
dotenv.config();

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const JOBS_DIR = path.join(process.cwd(), 'jobs');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(JOBS_DIR)) fs.mkdirSync(JOBS_DIR, { recursive: true });

const upload = multer({ dest: UPLOAD_DIR });
export const uploadCSVMiddleware = upload.single('file');

export const enqueueBulkUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CSV file is required' });
    }

    const jobId = uuid();
    const jobFile = path.join(JOBS_DIR, `${jobId}.json`);

    /** 🔥 Full metadata MUST be saved here */
    const initial = {
      jobId,
      status: 'queued',
      progress: 0,
      processed: 0,
      inserted: 0,
      failed: 0,
      filePath: req.file.path,          // REQUIRED
      originalname: req.file.originalname, // REQUIRED
      uploadedBy: req.user?.id || null,
      createdAt: new Date().toISOString()
    };

    fs.writeFileSync(jobFile, JSON.stringify(initial, null, 2));

    const published = await publishToQueue({
      jobId,
      filePath: req.file.path,
      originalname: req.file.originalname,
      uploadedBy: req.user?.id || null,
      createdAt: initial.createdAt
    });

    if (!published) {
      const failState = { ...initial, status: 'failed', error: 'Failed to publish to queue' };
      fs.writeFileSync(jobFile, JSON.stringify(failState, null, 2));
      return res.status(500).json({ message: 'Failed to queue upload' });
    }

    return res.status(202).json({ message: 'Upload received', jobId });

  } catch (err) {
    console.error('enqueueBulkUpload err', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};