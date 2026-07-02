import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('AbonadoTurno', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    estado: {
      type: DataTypes.ENUM('ACTIVO', 'BAJA', 'SUSPENDIDO'),
      defaultValue: 'ACTIVO'
    },
    mes_anio: { type: DataTypes.DATEONLY, allowNull: false },
    fecha_alta: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    cancelaciones_mes: { type: DataTypes.INTEGER, defaultValue: 0 },
    pierde_descuento: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'abonados_turnos',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['usuario_id', 'turno_id', 'mes_anio']
      }
    ]
  });
};
