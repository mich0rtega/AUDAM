import express from 'express';
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
import { csrfMiddleware } from './middlewares/csrf.middleware';



const app = express();


app.use(cors({
  origin: 'http://localhost:3000',
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



export default app;
