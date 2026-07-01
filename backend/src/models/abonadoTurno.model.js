import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('AbonadoTurno', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    estado: {
      type: DataTypes.ENUM('ACTIVO', 'BAJA', 'SUSPENDIDO'),
      defaultValue: 'ACTIVO'
    },
    fecha_alta: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    fecha_baja: { type: DataTypes.DATEONLY, allowNull: true }
  }, {
    tableName: 'abonados_turnos',
    timestamps: true,
    paranoid: true
  });
};
