import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';

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
app.use('/api/user', userRoutes);
app.use((req, res) => {
    res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});




export default app;