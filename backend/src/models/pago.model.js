import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export default (sequelize) => {
  return sequelize.define('Pago', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    monto: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    tipo_pago: {
      type: DataTypes.ENUM('SENA', 'RESTO_TURNO', 'CLASE_COMPLETA', 'SUSCRIPCION_MENSUAL', 'DEVOLUCION_SENA'),
      allowNull: false
    },
    metodo_pago: {
      type: DataTypes.ENUM('MERCADO_PAGO', 'EFECTIVO', 'CREDITO'),
    },
    estado: {
      type: DataTypes.ENUM('COMPLETADO', 'RECHAZADO', 'PENDIENTE'),
      defaultValue: 'COMPLETADO'
    }
  }, {
    tableName: 'pagos',
    timestamps: true,
    paranoid: true
  });
};
