import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { configurePassport } from './config/passport';
import cors from 'cors';
import sponsorRoutes from './routes/sponsorRoutes';
// import { fileRouter } from './routes/fileRoutes';
// import { authRouter } from './routes/authRoutes';

const app = express();
// app.use(session({
//   secret: process.env.SESSION_SECRET!,
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production',
//     maxAge: 24 * 60 * 60 * 1000 // 24 hours
//   }
// }));
// app.use(passport.initialize());
// app.use(passport.session());

// Configure CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001', // Vite's default port
    // origin: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    // credentials: false,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    optionsSuccessStatus: 200
}));

app.use(express.json());

// Mount routes
app.use('/api/sponsor', sponsorRoutes);
// app.use('/api/files', fileRouter);
// app.use('/api', authRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});