import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { setupAuth } from './middleware/auth';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const UI_ORIGIN = process.env.UI_ORIGIN || 'http://localhost:3000';

app.use(helmet());
app.use(
  cors({
    origin: [UI_ORIGIN],
    credentials: true,
  }),
);
app.use(express.json());

// Setup Authentication
setupAuth(app);

import routes from './routes';
app.use('/api', routes);

app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
