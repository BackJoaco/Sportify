import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/*
    Modelo de usuarios

    Sequelize crea automáticamente:
    - id
    - createdAt
    - updatedAt
*/

export const User = sequelize.define('users', {

    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },

    apellido: {
        type: DataTypes.STRING,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    dni: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    rol: {
        type: DataTypes.ENUM('ADMIN', 'CLIENTE'),
        defaultValue: 'CLIENTE'
    }
});