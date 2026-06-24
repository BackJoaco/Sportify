import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export default (sequelize) => {
  return sequelize.define('SuscripcionAbonado', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    mes_anio: { type: DataTypes.DATEONLY, allowNull: false },
    estado: { type: DataTypes.ENUM('ACTIVA', 'INACTIVA'), defaultValue: 'ACTIVA' },
    cancelaciones_mes: { type: DataTypes.INTEGER, defaultValue: 0 },
    pierde_descuento: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'suscripciones_abonados',
    timestamps: true,
    paranoid: true
  });
};