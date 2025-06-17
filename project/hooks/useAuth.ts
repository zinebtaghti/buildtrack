import { useState } from 'react';
import { Alert } from 'react-native';
import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

// Custom error types
export class CustomAuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'CustomAuthError';
  }
}

// User data type
export interface UserData {
  name: string;
  email: string;
  role: string;
  createdAt: string;
  photoURL?: string;
}

// Password validation
const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      const error = 'Please enter both email and password';
      setAuthError(error);
      throw new CustomAuthError(error);
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setAuthError(null);
    } catch (error) {
      const firebaseError = error as FirebaseError;
      let errorMessage = 'Failed to login. Please try again.';
      
      switch (firebaseError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
      }
      
      setAuthError(errorMessage);
      throw new CustomAuthError(errorMessage, firebaseError.code);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    if (!name || !email || !password) {
      const error = 'Please fill in all fields';
      setAuthError(error);
      throw new CustomAuthError(error);
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setAuthError(passwordError);
      throw new CustomAuthError(passwordError);
    }

    setLoading(true);
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(firebaseUser, { displayName: name });
      
      const userData: UserData = {
        name,
        email,
        role: 'user',
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      setAuthError(null);
    } catch (error) {
      const firebaseError = error as FirebaseError;
      let errorMessage = 'Failed to register. Please try again.';
      
      switch (firebaseError.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
      }
      
      setAuthError(errorMessage);
      throw new CustomAuthError(errorMessage, firebaseError.code);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    authError,
    login,
    register
  };
}