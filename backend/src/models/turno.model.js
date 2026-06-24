import { sequelize } from '../config/database.js';
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Turno', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    entrenador: { type: DataTypes.STRING(100), allowNull: false },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    hora_inicio: { type: DataTypes.TIME, allowNull: false },
    cupo_maximo: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    tableName: 'turnos',
    timestamps: true,
    paranoid: true
  });
};