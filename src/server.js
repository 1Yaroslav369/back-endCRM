import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import helmet from 'helmet';
import { errors } from 'celebrate';
import cookieParser from 'cookie-parser';

//DB
import checkDatabase from './db/connectDB.js';

// middleware
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

//routes
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger);
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`Time: ${new Date().toLocaleString()}`);
  next();
});

app.use(authRoutes);
app.use(clientRoutes);

app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

await checkDatabase();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
