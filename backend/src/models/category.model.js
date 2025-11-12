export default (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true }
    }, { tableName: 'categories' });
    return Category;
  };
  