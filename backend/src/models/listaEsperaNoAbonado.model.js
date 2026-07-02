import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('ListaEsperaNoAbonado', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    estado: {
      type: DataTypes.ENUM('EN_ESPERA', 'NOTIFICADO', 'CONFIRMADO', 'RECHAZADO', 'EXPIRADO', 'CUPO_RESERVADO'),
      defaultValue: 'EN_ESPERA'
    },
    posicion: { type: DataTypes.INTEGER, allowNull: false },
    cupo_reservado_hasta: { type: DataTypes.DATE, allowNull: true }
  }, {
    tableName: 'listas_espera_no_abonados',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['usuario_id', 'turno_id', 'fecha']
      }
    ]
  });
};
