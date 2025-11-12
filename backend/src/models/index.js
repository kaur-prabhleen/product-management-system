//this loads all models into Sequelize
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import userModel from './user.model.js';
import categoryModel from './category.model.js';
import productModel from './product.model.js';

const User = userModel(sequelize, DataTypes);
const Category = categoryModel(sequelize, DataTypes);
const Product = productModel(sequelize, DataTypes);

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

export { sequelize, User, Category, Product };
