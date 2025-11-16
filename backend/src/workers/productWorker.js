import fs from 'fs';
import path from 'path';
import csv from 'fast-csv';
import { getChannel } from '../queue/rabbit.js';
import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../models/index.js';
const { Product, Category } = sequelize.models;

const BATCH = 100;

async function startWorker() {
  const ch = await getChannel();

  await ch.consume(
    'product_import',
    async (msg) => {
      if (!msg) return;

      const payload = JSON.parse(msg.content.toString());
      const { jobId, filePath, originalname, uploadedBy, createdAt } = payload;

      const jobFile = path.join(process.cwd(), 'jobs', `${jobId}.json`);

      const writeState = (obj) => {
        try {
          let existing = {};
          if (fs.existsSync(jobFile)) {
            existing = JSON.parse(fs.readFileSync(jobFile, 'utf8'));
          }

          const updated = {
            ...existing, 
            ...obj,     
            updatedAt: new Date().toISOString(),
          };

          fs.writeFileSync(jobFile, JSON.stringify(updated, null, 2));
        } catch (e) {
          console.error('job write error', e);
        }
      };

      writeState({
        status: 'processing',
        progress: 0,
      });

      let buffer = [];
      let processed = 0,
        inserted = 0,
        failed = 0;

      const insertBatch = async (rows) => {
        const toCreate = [];

        for (const r of rows) {
          const name = (r.name || '').trim();
          const priceRaw = (r.price || '').toString().trim();
          const price =
            parseFloat(priceRaw.replace(/[^0-9.\-]/g, '')) || 0;

          const category_uuid = (r.category_uuid || '').trim();
          const image_url = (r.image_url || '').trim() || null;

          processed++;

          if (!name || !category_uuid) {
            failed++;
            continue;
          }

          const category = await Category.findOne({
            where: { uuid: category_uuid },
          });

          if (!category) {
            failed++;
            continue;
          }

          toCreate.push({
            name,
            price,
            image_url,
            categoryId: category.id,
          });
        }

        if (toCreate.length) {
          const created = await Product.bulkCreate(toCreate);
          inserted += created.length;
        }

        const progress = Math.round(
          (processed / Math.max(1, processed + failed)) * 100
        );

        writeState({
          status: 'processing',
          progress: Math.min(99, progress),
          processed,
          inserted,
          failed,
        });
      };

      try {
        await new Promise((resolve, reject) => {
          const stream = fs
            .createReadStream(filePath)
            .pipe(csv.parse({ headers: true, trim: true }))
            .on('error', (err) => {
              console.error('csv err', err);
              reject(err);
            })
            .on('data', async (row) => {
              buffer.push(row);
              if (buffer.length >= BATCH) {
                stream.pause();
                await insertBatch(buffer.splice(0));
                stream.resume();
              }
            })
            .on('end', async () => {
              if (buffer.length) await insertBatch(buffer.splice(0));
              resolve();
            });
        });

        writeState({
          status: 'completed',
          progress: 100,
          processed,
          inserted,
          failed,
          filePath: payload.filePath,
          originalname: payload.originalname,
        });

        ch.ack(msg);
      } catch (err) {
        console.error('worker error', err);

        writeState({
          status: 'failed',
          error: String(err),
          filePath: payload.filePath,
          originalname: payload.originalname,
        });

        ch.ack(msg);
      }
    },
    { noAck: false }
  );

  console.log('RabbitMQ product worker started — listening for product_import queue');
}

startWorker().catch((err) => {
  console.error('startWorker err', err);
  process.exit(1);
});