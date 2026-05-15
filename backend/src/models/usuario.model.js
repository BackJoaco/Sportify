import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export default (sequelize) => {
  return sequelize.define('Usuario', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    apellido: { type: DataTypes.STRING(100), allowNull: false },
    dni: { type: DataTypes.STRING(20), unique: true, allowNull: false },
    email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    contrasena: { type: DataTypes.STRING(255), allowNull: false },
    rol: { 
      type: DataTypes.ENUM('CLIENTE', 'EMPLEADO', 'ADMINISTRADOR'), 
      defaultValue: 'CLIENTE' 
    },
    estado: { 
      type: DataTypes.ENUM('HABILITADO', 'SUSPENDIDO'), 
      defaultValue: 'HABILITADO' 
    }
  }, { 
    tableName: 'usuarios', 
    timestamps: true, 
    paranoid: true 
  });
};