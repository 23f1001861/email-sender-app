import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { config } from './config.js';
import router from './routes/emailRoutes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  return res.json({ status: 'ok' });
});

app.use('/api', router);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  return res.status(400).json({ message: err.message });
});

app.listen(config.port, () => {
  console.log(`API listening on ${config.port}`);
});
