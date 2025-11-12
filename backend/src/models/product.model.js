//primary key for internal references and an auto-generated UUID as an external unique identifier for APIs
export default (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      price: { type: DataTypes.DECIMAL(12,2), allowNull: false },
      image_url: { type: DataTypes.STRING },
      uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
      categoryId: { type: DataTypes.INTEGER, allowNull: false }
    }, { tableName: 'products' });
    return Product;
  };