import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.resolve(process.cwd(), 'backend/data/products-test.csv');

export const exportProducts = (req, res) => {
  try {
    if (!fs.existsSync(FILE)) {
      console.error('exportProducts: CSV not found at', FILE);
      return res.status(500).json({ message: 'CSV file missing on server' });
    }
    console.log('exportProducts: sending file', FILE);
    return res.download(FILE, 'products.csv', (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) res.status(500).json({ message: 'CSV download failed', error: err.message });
      }
    });
  } catch (err) {
    console.error('exportProducts error:', err);
    return res.status(500).json({ message: 'Export failed', error: err.message });
  }
};