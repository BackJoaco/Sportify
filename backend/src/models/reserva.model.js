import { sequelize } from '../config/database.js';
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Reserva', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tipo_reserva: { type: DataTypes.ENUM('ABONADO', 'NO_ABONADO'), allowNull: false },
    estado: {
      type: DataTypes.ENUM('CONFIRMADA', 'CANCELADA', 'PRESENTE', 'AUSENTE'),
      defaultValue: 'CONFIRMADA'
    },
    estado_pago: {
      type: DataTypes.ENUM('PENDIENTE', 'SENA_ABONADA', 'PAGADO_COMPLETO'),
      defaultValue: 'PENDIENTE'
    },
    codigo_qr: { type: DataTypes.STRING(255), unique: true }
  }, {
    tableName: 'reservas',
    timestamps: true,
    paranoid: true
  });
};