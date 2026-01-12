import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './auth/auth.routes';

const app = express();


app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);


app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
);

export default app;
