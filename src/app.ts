import 'dotenv/config';
import express from 'express';
import session from 'express-session';

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

export default app;
