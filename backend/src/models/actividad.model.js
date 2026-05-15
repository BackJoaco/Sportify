import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export default (sequelize) => {
  return sequelize.define('Actividad', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    precio_clase: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    precio_mensual: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
  }, {
    tableName: 'actividades',
    timestamps: true,
    paranoid: true
  });
};