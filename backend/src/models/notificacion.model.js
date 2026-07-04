import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Notificacion', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    mensaje: { type: DataTypes.TEXT, allowNull: false },
    leida: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'notificaciones',
    timestamps: true,
    paranoid: true
  });
};