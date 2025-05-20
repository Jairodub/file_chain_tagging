
import { Aptos,AptosConfig,Network,KeylessAccount,EphemeralKeyPair } from "@aptos-labs/ts-sdk";
import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  account: KeylessAccount | null;
  isLoading: boolean;
  error: Error | null;
  login: () => void;
  completeLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  userAddress: string | null;
}
const storeIdToken = (token: string): void =>
  localStorage.setItem("@aptos/id_token", token);

const getStoredIdToken = (): string | null =>
  localStorage.getItem("@aptos/id_token");

// Helper functions for ephemeral key pair storage
const storeEphemeralKeyPair = (ekp: EphemeralKeyPair): void =>
  localStorage.setItem("@aptos/ekp", encodeEphemeralKeyPair(ekp));

const getLocalEphemeralKeyPair = (): EphemeralKeyPair | undefined => {
  try {
    const encodedEkp = localStorage.getItem("@aptos/ekp");
    return encodedEkp ? decodeEphemeralKeyPair(encodedEkp) : undefined;
  } catch (error) {
    console.warn("Failed to decode ephemeral key pair from localStorage", error);
    return undefined;
  }
};

const encodeEphemeralKeyPair = (ekp: EphemeralKeyPair): string =>
  JSON.stringify(ekp, (_, e) => {
    if (typeof e === "bigint") return { __type: "bigint", value: e.toString() };
    if (e instanceof Uint8Array)
      return { __type: "Uint8Array", value: Array.from(e) };
    if (e instanceof EphemeralKeyPair)
      return { __type: "EphemeralKeyPair", data: e.bcsToBytes() };
    return e;
  });

const decodeEphemeralKeyPair = (encodedEkp: string): EphemeralKeyPair =>
  JSON.parse(encodedEkp, (_, e) => {
    if (e && e.__type === "bigint") return BigInt(e.value);
    if (e && e.__type === "Uint8Array") return new Uint8Array(e.value);
    if (e && e.__type === "EphemeralKeyPair")
      return EphemeralKeyPair.fromBytes(e.data);
    return e;
  });

const storeKeylessAccount = (account: KeylessAccount): void =>
  localStorage.setItem("@aptos/account", encodeKeylessAccount(account));

const encodeKeylessAccount = (account: KeylessAccount): string =>
  JSON.stringify(account, (_, e) => {
    if (typeof e === "bigint") return { __type: "bigint", value: e.toString() };
    if (e instanceof Uint8Array)
      return { __type: "Uint8Array", value: Array.from(e) };
    if (e instanceof KeylessAccount)
      return { __type: "KeylessAccount", data: e.bcsToBytes() };
    return e;
  });

const getLocalKeylessAccount = (): KeylessAccount | undefined => {
  try {
    const encodedAccount = localStorage.getItem("@aptos/account");
    return encodedAccount ? decodeKeylessAccount(encodedAccount) : undefined;
  } catch (error) {
    console.warn("Failed to decode account from localStorage", error);
    return undefined;
  }
};

const decodeKeylessAccount = (encodedAccount: string): KeylessAccount =>
  JSON.parse(encodedAccount, (_, e) => {
    if (e && e.__type === "bigint") return BigInt(e.value);
    if (e && e.__type === "Uint8Array") return new Uint8Array(e.value);
    if (e && e.__type === "KeylessAccount")
      return KeylessAccount.fromBytes(e.data);
    return e;
  });

const aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }));

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = !!account;
  const userAddress = account?.accountAddress?.toString() ?? null;

  const login = () => {
    try {
      // Generate new ephemeral key pair
      const ekp = EphemeralKeyPair.generate();
      
      // Clear any existing auth data first
      localStorage.removeItem("@aptos/id_token");
      localStorage.removeItem("@aptos/ekp");
      localStorage.removeItem("@aptos/account");
      
      // Store new ephemeral key pair
      storeEphemeralKeyPair(ekp);
      
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
      const redirectUri = import.meta.env.VITE_OAUTH_REDIRECT_URI!;
      
      if (!clientId || !redirectUri) {
        throw new Error('Missing OAuth configuration');
      }
  
      console.log('Starting OAuth flow with:', {
        redirectUri,
        nonce: ekp.nonce
      });
  
      const loginUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      const params = new URLSearchParams({
        response_type: 'id_token',
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: 'openid email profile',
        nonce: ekp.nonce,
        prompt: 'select_account',
        state: crypto.randomUUID()
      });
  
      loginUrl.search = params.toString();
      
      // Force redirect to OAuth page
      window.location.replace(loginUrl.toString());
    } catch (error) {
      console.error('Login initialization failed:', error);
      setError(error instanceof Error ? error : new Error(String(error)));
    }
  };

  const completeLogin = async (idToken: string) => {
    try {
      setIsLoading(true);
      console.log("completing login in context");
      
      const ekp = getLocalEphemeralKeyPair();
      if (!ekp) {
        throw new Error("No ephemeral key pair found");
      }
  
      // Improved retry logic with better error handling
      const retryWithBackoff = async (attempts = 3, initialDelay = 1000) => {
        let delay = initialDelay;
        
        for (let i = 0; i < attempts; i++) {
          try {
            console.log(`Attempt ${i + 1} of ${attempts}`);
            const response = await aptos.deriveKeylessAccount({
              jwt: idToken,
              ephemeralKeyPair: ekp
            });
            
            // Only try to parse successful responses
            return response;
          } catch (error: any) {
            console.error('Attempt failed:', {
              status: error.status,
              message: error.message
            });
  
            // Handle rate limiting specifically
            if (error.status === 429) {
              if (i === attempts - 1) {
                throw new Error('Rate limit exceeded, max retries reached');
              }
              console.log(`Rate limited, waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              delay *= 2; // Exponential backoff
              continue;
            }
  
            // For other errors, don't retry
            throw error;
          }
        }
        throw new Error('Max retry attempts reached');
      };
  
      const keylessAccount = await retryWithBackoff();
      if (!keylessAccount) {
        throw new Error('Failed to derive keyless account');
      }
  
      // Store everything atomically
      storeIdToken(idToken);
      storeEphemeralKeyPair(ekp);
      storeKeylessAccount(keylessAccount);
  
      setAccount(keylessAccount);
      setError(null);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setAccount(null);
      
      // Clean up storage on error
      localStorage.removeItem("@aptos/id_token");
      localStorage.removeItem("@aptos/ekp");
      localStorage.removeItem("@aptos/account");
    } finally {
      setIsLoading(false);
    }
  };

  // Update logout to clear all stored data
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clear all storage first
      localStorage.removeItem("@aptos/id_token");
      localStorage.removeItem("@aptos/ekp");
      localStorage.removeItem("@aptos/account");
      
      // Then clear state
      setAccount(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };


 // Replace the empty useEffect with proper session restoration
 useEffect(() => {
  let isRestoring = false;

  const restoreSession = async () => {
    if (isRestoring) return;
    isRestoring = true;

    try {
      setIsLoading(true);
      console.log('Attempting to restore session...');
      // Skip session restoration on callback route
      if (window.location.pathname === '/oauth/callback') {
        console.log("callback path return")
        return;
      }

      const storedAccount = getLocalKeylessAccount();
      const storedToken = getStoredIdToken();
      const storedEkp = getLocalEphemeralKeyPair();
      console.log('Stored credentials:', {
        hasAccount: !!storedAccount,
        hasToken: !!storedToken,
        hasEkp: !!storedEkp
      });

      if (storedAccount) {
        setAccount(storedAccount);
        setError(null);
        console.log("has stored account exit")
        return;
      }


      // Check if we have all necessary pieces
      if (!storedAccount || !storedToken || !storedEkp) {
        console.log('Missing some credentials, cleaning up...');
        localStorage.removeItem("@aptos/id_token");
        localStorage.removeItem("@aptos/ekp");
        localStorage.removeItem("@aptos/account");
        return;
      }

      if (!storedToken || !storedEkp) {
        return;
      }

      // Verify token expiration
      const payload = jwtDecode<{ exp: number }>(storedToken);
      if (Date.now() >= payload.exp * 1000) {
        throw new Error("Token expired");
      }

      const keylessAccount = await aptos.deriveKeylessAccount({
        jwt: storedToken,
        ephemeralKeyPair: storedEkp
      });

      storeKeylessAccount(keylessAccount);
      console.log('Setting restored account in state...');
      setAccount(keylessAccount);
      setError(null);
    } catch (err) {
      console.error("Failed to restore session:", err);
      localStorage.removeItem("@aptos/id_token");
      localStorage.removeItem("@aptos/ekp");
      localStorage.removeItem("@aptos/account");
      setAccount(null);
    } finally {
      setIsLoading(false);
      isRestoring = false;
    }
  };

  restoreSession();
}, []);


  return (
    <AuthContext.Provider
      value={{
        account,
        isLoading,
        error,
        login,
        logout,
        completeLogin,
        isAuthenticated,
        userAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
