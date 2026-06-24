import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js';
import usuarioRoutes from './routes/usuario.route.js';
import actividadRoutes from './routes/actividad.route.js';
import turnoRoutes from './routes/turno.route.js';
import pagoRoutes from './routes/pago.route.js';
import reservaRoutes from './routes/reserva.route.js';

const app = express();

app.use(cookieParser());

app.use(helmet());
app.use(cors({
    origin: "http://localhost:5173", // Vite dev server
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));


app.use(morgan('dev'));
app.get('/api/status', (req, res) => {
    res.json({ ok: true, message: 'API funcionando correctamente' });
});
app.use('/api/auth', authRoutes);
app.use('/api/usuario', usuarioRoutes);
app.use('/api/actividad', actividadRoutes);
app.use('/api/turno', turnoRoutes);
app.use('/api/pago', pagoRoutes);
app.use('/api/reserva', reservaRoutes);
app.use((req, res) => {
    res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});




export default app;
