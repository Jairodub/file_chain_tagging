import express, { Request, Response } from 'express';
import passport from 'passport';
import { Aptos, AptosConfig, Network, EphemeralKeyPair } from '@aptos-labs/ts-sdk';

// Session type declaration
declare module 'express-session' {
  interface SessionData {
    ephemeralKeyPair?: {
      nonce: string;
    };
  }
}

interface KeylessSession {
  aptosAddress: string;
  
}

const router = express.Router();
const aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }));

// Initialize auth with ephemeral key pair
router.post('/auth/init', async (req, res) => {
  try {
    const ephemeralKeyPair = EphemeralKeyPair.generate();
    
    // Store ephemeral key pair in session
    req.session.ephemeralKeyPair = {
      nonce: ephemeralKeyPair.nonce,
    };

    res.json({ 
      success: true,
      nonce: ephemeralKeyPair.nonce 
    });
  } catch (error) {
    console.error('Auth initialization error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to initialize authentication' 
    });
  }
});

// Google OAuth login route
router.get('/auth/google', passport.authenticate('google'));

// Google OAuth callback route
router.get('/auth/callback/google', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const user = req.user as KeylessSession;
    res.json({
      success: true,
      data: {
        address: user.aptosAddress,
      }
    });
  }
);

// Get current session
router.get('/auth/session', (req:any, res:any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated'
    });
  }

  const session = req.user as KeylessSession;
  res.json({
    success: true,
    data: {
      address: session.aptosAddress
    }
  });
});

// Logout route
router.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
    res.json({ success: true });
  });
});

export const authRouter = router;