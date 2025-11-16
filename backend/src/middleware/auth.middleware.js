import jwt from 'jsonwebtoken';
import { sequelize } from '../models/index.js';
const { User } = sequelize.models;

import dotenv from 'dotenv';
dotenv.config();

export const authenticate = async (req, res, next) => {  
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    return next();
    
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};