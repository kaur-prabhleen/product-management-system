import express from 'express';
import {
  createCategory,
  listCategories,
  getCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', listCategories);             
router.get('/:uuid', getCategory);          
router.post('/', authenticate, createCategory);   
router.put('/:uuid', authenticate, updateCategory); 
router.delete('/:uuid', authenticate, deleteCategory);

export default router;
