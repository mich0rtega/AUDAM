import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './auth/auth.routes';
import usersRoutes from './users/users.routes';
import catalogRoutes from './catalog/catalog.routes';
import costCenterRoutes from './cost-centers/cost-centers.routes';
import productsRoutes from './products/products.routes';
import assetsRoutes from './assets/assets.routes';


const app = express();


app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/catalog', catalogRoutes);
app.use('/cost-centers', costCenterRoutes);
app.use('/products', productsRoutes);
app.use('/assets', assetsRoutes);


export default app;
