import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import helmet from 'helmet';
import { errors } from 'celebrate';

//DB
import checkDatabase from './db/connectDB.js';

// middleware
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger);
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`Time: ${new Date().toLocaleString()}`);
  next();
});

app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

await checkDatabase();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
