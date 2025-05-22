import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { configurePassport } from './config/passport';
import cors from 'cors';
import { fileRouter } from './routes/fileRoutes';
import { authRouter } from './routes/authRoutes';

const app = express();
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST','OPTIONS'],
  credentials: true
}));

app.use(express.json());

// Mount routes
app.use('/api/files', fileRouter);
app.use('/api', authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});