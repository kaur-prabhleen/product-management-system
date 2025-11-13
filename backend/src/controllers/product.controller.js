import fs from 'fs';
import path from 'path';
import { sequelize } from '../models/index.js';
import { Op, fn, col, where as seqWhere  } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const { Product, Category } = sequelize.models;
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const createProduct = async (req, res) => {
  try {
    const { name, price, category_uuid } = req.body;
    if (!name || !price || !category_uuid) {
      return res.status(400).json({ message: 'name, price and category_uuid are required' });
    }

    const category = await Category.findOne({ where: { uuid: category_uuid } });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    let image_url = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newName = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
      const dest = path.join(UPLOAD_DIR, newName);
      fs.renameSync(req.file.path, dest);
      image_url = `/uploads/${newName}`;
    }

    const product = await Product.create({
      name,
      price,
      image_url,
      categoryId: category.id
    });

    return res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    console.error('createProduct error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { uuid } = req.params;
    const product = await Product.findOne({
      where: { uuid },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'uuid'] }]
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json({ product });
  } catch (err) {
    console.error('getProduct error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { name, price, category_uuid } = req.body;
    const product = await Product.findOne({ where: { uuid } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (category_uuid) {
      const category = await Category.findOne({ where: { uuid: category_uuid } });
      if (!category) return res.status(404).json({ message: 'Category not found' });
      product.categoryId = category.id;
    }

    if (name) product.name = name;
    if (price) product.price = price;

    if (req.file) {
      if (product.image_url) {
        const oldPath = path.join(process.cwd(), product.image_url.replace(/^\//, ''));
        try { if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath); } catch (e) { /* ignore */ }
      }
      const ext = path.extname(req.file.originalname);
      const newName = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
      const dest = path.join(UPLOAD_DIR, newName);
      fs.renameSync(req.file.path, dest);
      product.image_url = `/uploads/${newName}`;
    }

    await product.save();
    return res.json({ message: 'Product updated', product });
  } catch (err) {
    console.error('updateProduct error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { uuid } = req.params;
    const product = await Product.findOne({ where: { uuid } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.image_url) {
      const p = path.join(process.cwd(), product.image_url.replace(/^\//, ''));
      try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch (e) { /* ignore */ }
    }

    await product.destroy();
    return res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('deleteProduct error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const listProducts = async (req, res) => {
    try {
      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const limit = Math.min(parseInt(req.query.limit) || 10, 200);
      const offset = (page - 1) * limit;
      const { search = '', sort = 'price_asc', category = '' } = req.query;
  
      const include = [{ model: Category, as: 'category', attributes: ['id', 'name', 'uuid'] }];
  
      if (category) {
        include[0].where = { uuid: category };
      }
  
      const where = {};
      if (search && search.trim() !== '') {
        const q = `%${search.trim().toLowerCase()}%`;
  
        where[Op.or] = [
          seqWhere(fn('LOWER', col('Product.name')), { [Op.like]: q }),
          seqWhere(fn('LOWER', col('category.name')), { [Op.like]: q })
        ];
      }
  
      const order = [['price', sort === 'price_desc' ? 'DESC' : 'ASC']];
  
      const { count, rows } = await Product.findAndCountAll({
        where,
        include,
        limit,
        offset,
        order,
        distinct: true
      });
  
      return res.json({
        total: count,
        page,
        pages: Math.ceil(count / limit),
        data: rows
      });
    } catch (err) {
      console.error('listProducts error', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
