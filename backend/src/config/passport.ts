import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Aptos, AptosConfig, Network, EphemeralKeyPair } from '@aptos-labs/ts-sdk';
import { jwtDecode } from 'jwt-decode';

// Initialize Aptos client
const aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }));

// Only store the essential keyless data
interface KeylessSession {
  aptosAddress: string;
}

// Extend Express.User with our custom properties
declare global {
  namespace Express {
    interface User extends KeylessSession {}
  }
}
export const encodeEphemeralKeyPair = (ekp: EphemeralKeyPair): string => 
  JSON.stringify(ekp, (_, e) => {
    if (typeof e === "bigint") return { __type: "bigint", value: e.toString() };
    if (e instanceof Uint8Array)
      return { __type: "Uint8Array", value: Array.from(e) };
    if (e instanceof EphemeralKeyPair)
      return { __type: "EphemeralKeyPair", data: e.bcsToBytes() };
    return e;
  });

export const decodeEphemeralKeyPair = (encodedEkp: string): EphemeralKeyPair =>
  JSON.parse(encodedEkp, (_, e) => {
    if (e && e.__type === "bigint") return BigInt(e.value);
    if (e && e.__type === "Uint8Array") return new Uint8Array(e.value);
    if (e && e.__type === "EphemeralKeyPair")
      return EphemeralKeyPair.fromBytes(e.data);
    return e;
  });

  export const configurePassport = () => {
    passport.serializeUser((session: KeylessSession, done) => {
      done(null, session);
    });
  
    passport.deserializeUser((session: KeylessSession, done) => {
      done(null, session);
    });
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          callbackURL: process.env.REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google',
          scope: ['openid'],  // Minimal scope needed
          passReqToCallback: true
        },
        async (
          req: Express.Request,
          accessToken: string,
          refreshToken: string,
          params: { id_token?: string },
          profile: any,
          done: (error: Error | null, session?: KeylessSession) => void
        ) => {
          try {
            const jwt = params.id_token;
            if (!jwt) {
              throw new Error('Missing JWT token');
            }
  
            const payload = jwtDecode<{ nonce: string }>(jwt);
            const storedKeyPair = req.session.ephemeralKeyPair ? 
              decodeEphemeralKeyPair(JSON.stringify(req.session.ephemeralKeyPair)) : 
              null;
  
            if (!storedKeyPair || storedKeyPair.nonce !== payload.nonce) {
              throw new Error('Invalid or missing ephemeral key pair');
            }
  
            const keylessAccount = await aptos.deriveKeylessAccount({
              jwt,
              ephemeralKeyPair: storedKeyPair
            });
  
            const session: KeylessSession = {
              aptosAddress: keylessAccount.accountAddress.toString(),
              
            };
  
            delete req.session.ephemeralKeyPair;
            return done(null, session);
          } catch (error) {
            console.error('Keyless account creation failed:', error);
            return done(error as Error);
          }
        }
      )
    );
  
    return passport;
  };