import fs from 'fs';
import path from 'path';

export const getJobStatus = async (req, res) => {
  const id = req.params.id;
  const f = path.join(process.cwd(), 'jobs', `${id}.json`);
  if (!fs.existsSync(f)) return res.status(404).json({ message: 'Job not found' });
  const data = JSON.parse(fs.readFileSync(f, 'utf8'));
  return res.json(data);
};
