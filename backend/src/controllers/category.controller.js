import { sequelize } from '../models/index.js';

const { Category } = sequelize.models;

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const existing = await Category.findOne({ where: { name } });
    if (existing) return res.status(409).json({ message: 'Category already exists' });

    const category = await Category.create({ name });
    return res.status(201).json({ message: 'Category created', category });
  } catch (err) {
    console.error('createCategory error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const listCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    return res.json({ data: categories });
  } catch (err) {
    console.error('listCategories error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCategory = async (req, res) => {
  try {
    const { uuid } = req.params;
    const category = await Category.findOne({ where: { uuid } });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    return res.json({ category });
  } catch (err) {
    console.error('getCategory error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { name } = req.body;
    const category = await Category.findOne({ where: { uuid } });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    if (name) category.name = name;
    await category.save();

    return res.json({ message: 'Category updated', category });
  } catch (err) {
    console.error('updateCategory error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { uuid } = req.params;
    const category = await Category.findOne({ where: { uuid } });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await category.destroy();
    return res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('deleteCategory error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
