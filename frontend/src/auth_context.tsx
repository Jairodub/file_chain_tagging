
import { Aptos,AptosConfig,Network,KeylessAccount,EphemeralKeyPair } from "@aptos-labs/ts-sdk";
import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  account: KeylessAccount | null;
  isLoading: boolean;
  error: Error | null;
  login: () => void; // only redirect
  completeLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}
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

const aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }));

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<KeylessAccount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const login = () => {
    const ekp = EphemeralKeyPair.generate();
    storeEphemeralKeyPair(ekp);
    const clientId =  process.env.GOOGLE_CLIENT_ID!;
    const redirectUri = `${window.location.origin}/login/callback`;
    const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=id_token&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid%20email%20profile&nonce=${ekp.nonce}`;
    window.location.href = loginUrl;
  };

  const completeLogin = async (idToken: string) => {
    try {
      setIsLoading(true);
      const payload = jwtDecode<{ nonce: string }>(idToken);
      const jwtNonce = payload.nonce;

      const ekp = getLocalEphemeralKeyPair();
      if (!ekp || ekp.nonce !== jwtNonce || ekp.isExpired()) {
        throw new Error("Invalid or expired key pair");
      }

      const keylessAccount = await aptos.deriveKeylessAccount({
        jwt: idToken,
        ephemeralKeyPair: ekp
      });

      setAccount(keylessAccount);
      setError(null);
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Unknown login error");
      setError(e);
      setAccount(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setAccount(null);
    localStorage.removeItem("@aptos/ekp");
  };

  useEffect(() => {
    setIsLoading(false); // session persistence can go here if needed
  }, []);

  return (
    <AuthContext.Provider
      value={{ account, isLoading, error, login, logout, completeLogin }}
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
