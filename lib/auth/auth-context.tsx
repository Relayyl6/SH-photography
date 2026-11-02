"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  createUserWithEmailAndPassword,
  updateProfile,
  IdTokenResult,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  tokenResult: IdTokenResult | null;
  signInWithEmail: (e: string, p: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signUpWithEmail: (e: string, p: string, name?: string) => Promise<any>;
  signOut: () => Promise<void>;
  refreshClaims: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isOwner: false,
  isAdmin: false,
  tokenResult: null,
  signInWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
  refreshClaims: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [tokenResult, setTokenResult] = useState<IdTokenResult | null>(null);

  const checkOwnerStatus = async (currentUser: User | null) => {
    if (!currentUser) {
      setIsOwner(false);
      setTokenResult(null);
      return;
    }

    try {
      const token = await currentUser.getIdTokenResult(true);
      setTokenResult(token);

      // Check custom claim
      const hasOwnerClaim = token.claims.role === "owner" || token.claims.admin === true;

      // In addition to claim, check admins/{uid} document if Firestore is reachable
      let hasAdminDoc = false;
      try {
        const adminSnap = await getDoc(doc(db, "admins", currentUser.uid));
        if (adminSnap.exists() && adminSnap.data()?.role === "owner") {
          hasAdminDoc = true;
        }
      } catch {
        // Doc check fallback
      }

      // Also allow fallback if current user email matches standard admin email in demo/dev mode
      const isEmailAllowed = (currentUser.email?.toLowerCase() === "shfotography1@gmail.com" ||
        currentUser.email?.toLowerCase() === "admin@shphotography.com");

      setIsOwner(Boolean(hasOwnerClaim || hasAdminDoc || isEmailAllowed));
    } catch (err) {
      console.warn("Error verifying owner claim:", err);
      setIsOwner(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      await checkOwnerStatus(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshClaims = async () => {
    if (auth.currentUser) {
      await checkOwnerStatus(auth.currentUser);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    await checkOwnerStatus(res.user);
    return res;
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const res = await signInWithPopup(auth, provider);
    await checkOwnerStatus(res.user);
    return res;
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (name && res.user) {
      await updateProfile(res.user, { displayName: name });
    }
    await checkOwnerStatus(res.user);
    return res;
  };

  const signOut = async () => {
    await fbSignOut(auth);
    setUser(null);
    setIsOwner(false);
    setTokenResult(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isOwner,
        isAdmin: isOwner,
        tokenResult,
        signInWithEmail,
        signInWithGoogle,
        signUpWithEmail,
        signOut,
        refreshClaims,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
