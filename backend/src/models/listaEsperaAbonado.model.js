import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('ListaEsperaAbonado', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    estado: {
      type: DataTypes.ENUM('EN_ESPERA', 'CUPO_RESERVADO', 'CONFIRMADO', 'RECHAZADO', 'EXPIRADO'),
      defaultValue: 'EN_ESPERA'
    },
    posicion: { type: DataTypes.INTEGER, allowNull: false },
    cupo_reservado_hasta: { type: DataTypes.DATE, allowNull: true }
  }, {
    tableName: 'listas_espera_abonados',
    timestamps: true,
    paranoid: true
  });
};
