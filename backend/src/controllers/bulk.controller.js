import multer from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import { publishToQueue } from '../queue/rabbit.js';
import dotenv from 'dotenv';
dotenv.config();

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({ dest: UPLOAD_DIR });
export const uploadCSVMiddleware = upload.single('file');

export const enqueueBulkUpload = async (req, res) => {
  console.log('[bulk] handler called - req.file?', !!req.file, 'user?', req.user?.id ?? null);
  try {
    if (!req.file) {
      console.log('[bulk] no file in request');
      return res.status(400).json({ message: 'CSV file is required' });
    }

    const jobId = uuid();
    const jobFile = path.join(process.cwd(), 'jobs', `${jobId}.json`);
    try {
      fs.writeFileSync(jobFile, JSON.stringify({ status: 'queued', progress: 0, filePath: req.file.path, createdAt: new Date().toISOString() }));
    } catch (e) {
      console.error('[bulk] failed to write job file', e && e.stack ? e.stack : e);
    }

    const payload = {
      jobId,
      filePath: req.file.path,
      originalname: req.file.originalname,
      uploadedBy: req.user?.id || null
    };

    console.log('[bulk] publishing payload ->', payload);

    try {
      const ok = await publishToQueue(payload);
      console.log('[bulk] publishToQueue returned ->', ok);
      if (!ok) {
        fs.writeFileSync(jobFile, JSON.stringify({ status:'failed', error:'publish returned false', createdAt: new Date().toISOString() }));
        return res.status(500).json({ message: 'Failed to queue job (sendToQueue returned false)' });
      }
    } catch (err) {
      console.error('[bulk] publishToQueue error ->', err && err.stack ? err.stack : err);
      try { fs.writeFileSync(jobFile, JSON.stringify({ status:'failed', error: String(err), createdAt: new Date().toISOString() })); } catch(e){}
      return res.status(500).json({ message: 'Failed to queue job', error: String(err) });
    }

    console.log('[bulk] published successfully, jobId=', jobId);
    return res.status(202).json({ message: 'Upload received', jobId });
  } catch (err) {
    console.error('[bulk] enqueueBulkUpload outer err ->', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Internal server error', error: String(err) });
  }
};