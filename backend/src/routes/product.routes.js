import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  listProducts
} from '../controllers/product.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.get('/', listProducts);
router.get('/:uuid', getProduct);

router.post('/', authenticate, upload.single('image'), createProduct);
router.put('/:uuid', authenticate, upload.single('image'), updateProduct);
router.delete('/:uuid', authenticate, deleteProduct);

export default router;
