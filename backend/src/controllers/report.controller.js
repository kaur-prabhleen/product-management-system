import fs from 'fs';
import path from 'path';

const JOBS_DIR = path.join(process.cwd(), 'jobs');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

export const listUploads = async (req, res) => {
  try {
    if (!fs.existsSync(JOBS_DIR)) return res.json([]);
    const files = fs.readdirSync(JOBS_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const raw = fs.readFileSync(path.join(JOBS_DIR, f), 'utf8');
        let data = {};
        try { data = JSON.parse(raw); } catch (e) { data = { error: 'invalid json' }; }
        return {
          jobId: f.replace('.json', ''),
          status: data.status || 'unknown',
          progress: data.progress ?? null,
          createdAt: data.createdAt || data.updatedAt || null,
          originalname: data.originalname || (data.filePath ? path.basename(data.filePath) : null),
          filePath: data.filePath || null,
          meta: data.meta || null
        };
      })
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return res.json(files);
  } catch (err) {
    console.error('listUploads err', err);
    return res.status(500).json({ message: 'Failed to list uploads' });
  }
};

export const downloadUpload = async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobJsonPath = path.join(JOBS_DIR, `${jobId}.json`);
    if (!fs.existsSync(jobJsonPath)) return res.status(404).json({ message: 'Job not found' });

    const job = JSON.parse(fs.readFileSync(jobJsonPath, 'utf8'));

    if (job.filePath && fs.existsSync(job.filePath)) {
      const fname = job.originalname || path.basename(job.filePath);
      res.setHeader('Content-Disposition', `attachment; filename="${fname}"`);
      res.setHeader('Content-Type', 'text/csv');
      return fs.createReadStream(job.filePath).pipe(res);
    }

    if (fs.existsSync(UPLOADS_DIR)) {
      const candidates = fs.readdirSync(UPLOADS_DIR)
        .filter(fn => fn.includes(jobId) || fn.includes(job.originalname || ''))
        .map(fn => ({ fn, full: path.join(UPLOADS_DIR, fn), mtime: fs.statSync(path.join(UPLOADS_DIR, fn)).mtimeMs }));

      if (candidates.length) {
        candidates.sort((a, b) => b.mtime - a.mtime);
        const chosen = candidates[0].full;
        const fname = job.originalname || candidates[0].fn;
        res.setHeader('Content-Disposition', `attachment; filename="${fname}"`);
        res.setHeader('Content-Type', 'text/csv');
        return fs.createReadStream(chosen).pipe(res);
      }
    }

    return res.status(404).json({ message: 'Uploaded file not found. The job JSON did not include a valid filePath.' });
  } catch (err) {
    console.error('downloadUpload err', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};