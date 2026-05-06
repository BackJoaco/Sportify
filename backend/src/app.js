import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import userRoutes from './routes/user.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));



app.get('/', (req, res) => {
    res.json({ok: true, message: 'API funcionando correctamente'});
});

app.use('/api/users', userRoutes);

app.use((req, res) => {
    res.status(404).json({ok: false,message: 'Ruta no encontrada'});
});

export default app;