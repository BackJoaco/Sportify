import dotenv from 'dotenv';

dotenv.config();

import app from './app.js';

import { sequelize } from './config/database.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await sequelize.authenticate();

        console.log('✅ Base de datos conectada');

        await sequelize.sync();

        console.log('✅ Modelos sincronizados');

        app.listen(PORT, () => {

            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
        });

    } catch (error) {

        console.error('❌ Error iniciando servidor');
        console.error(error);
    }
};

startServer();