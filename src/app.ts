import express from 'express';
import cors from 'cors';
import authRouter from './modules/auth/auth.router';
import issuesRouter from './modules/issues/issues.router';
import errorHandler from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the DevPulse API server!'
  });
});

app.use('/api/auth', authRouter);
app.use('/api/issues', issuesRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
