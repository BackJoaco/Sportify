import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export default (sequelize) => {
  return sequelize.define('Credito', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    estado: {
      type: DataTypes.ENUM('DISPONIBLE', 'USADO', 'VENCIDO'),
      defaultValue: 'DISPONIBLE'
    },
    fecha_vencimiento: { type: DataTypes.DATE, allowNull: false }
  }, {
    tableName: 'creditos',
    timestamps: true,
    paranoid: true
  });
};