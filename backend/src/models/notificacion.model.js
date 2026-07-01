import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Notificacion', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    leida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'notificaciones',
    timestamps: false
  });
};