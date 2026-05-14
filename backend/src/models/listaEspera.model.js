import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export default (sequelize) => {
  return sequelize.define('ListaEspera', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tipo_lista: {
      type: DataTypes.ENUM('ABONADOS', 'NO_ABONADOS', 'GENERAL'),
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('EN_ESPERA', 'NOTIFICADO', 'CONFIRMADO', 'RECHAZADO', 'EXPIRADO'),
      defaultValue: 'EN_ESPERA'
    },
    fecha_notificacion: { type: DataTypes.DATE }
  }, {
    tableName: 'listas_espera',
    timestamps: true,
    paranoid: true
  });
};