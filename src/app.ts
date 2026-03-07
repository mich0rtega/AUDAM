import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './auth/auth.routes';
import usersRoutes from './users/users.routes';
import catalogRoutes from './catalog/catalog.routes';
import costCenterRoutes from './cost-centers/cost-centers.routes';
import productsRoutes from './products/products.routes';
import assetsRoutes from './assets/assets.routes';
import requisitionsRoutes from './requisitions/requisitions.routes';
import movementsRoutes from './movements/movements.routes';
import providersRoutes from './providers/providers.routes';
import dashboardRoutes from './dashboard/dashboard.routes';
import auditRoutes from './audit/audit.routes';
import { csrfMiddleware } from './middlewares/csrf.middleware';

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'https://audam-frontend.vercel.app'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(csrfMiddleware);

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/catalog', catalogRoutes);
app.use('/cost-centers', costCenterRoutes);
app.use('/products', productsRoutes);
app.use('/assets', assetsRoutes);
app.use('/requisitions', requisitionsRoutes);
app.use('/movements', movementsRoutes);
app.use('/providers', providersRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/audit', auditRoutes);

// Error handler global — debe tener exactamente 4 parámetros para Express
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  res.status(500).json({ message: err.message || 'Error interno del servidor' });
});

export default app;
