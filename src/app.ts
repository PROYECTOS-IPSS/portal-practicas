import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import authRouter from './routes/auth.routes.js';
import internshipRouter from './routes/internship.routes.js';
import studentsRouter from './routes/students.routes.js';
import teachersRouter from './routes/teachers.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const sessionSecret = process.env['SESSION_SECRET'];
if (!sessionSecret) {
  throw new Error('Falta SESSION_SECRET en el entorno (.env)');
}

const app = express();

app.use(express.json());

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // la cookie no es legible desde JavaScript
      sameSite: 'lax',
      secure: process.env['NODE_ENV'] === 'production', // HTTPS en producción
    },
  }),
);

// API
app.use('/api/auth', authRouter);
app.use('/api/internships', internshipRouter);
app.use('/api/teachers', teachersRouter);
app.use('/api/students', studentsRouter);

// Último middleware: convierte errores (HttpError y otros) en JSON.
app.use(errorHandler);

export default app;
