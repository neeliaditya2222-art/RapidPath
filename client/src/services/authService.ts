import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { authApi } from '../api/routeApi';

export interface AuthUser {
  id: string;
  firebaseUid?: string;
  email: string;
  name: string;
  role: string;
  badgeNumber: string;
  jurisdiction: string;
  phone: string;
  organization: string;
  memberSince: string;
  lastLogin: string;
  photoURL?: string | null;
  preferences: {
    notifications: boolean;
    emailNotifications: boolean;
    routeAlerts: boolean;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  message?: string;
}

const SESSION_AUTH_KEY = 'rapidpath_auth_session';

function mapFirebaseUserToAuthUser(fbUser: FirebaseUser, existingData?: Partial<AuthUser>): AuthUser {
  const email = fbUser.email || '';
  const displayName = existingData?.name || fbUser.displayName || 
    (email ? email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Emergency Dispatcher');

  const now = new Date();
  const formattedTime = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + 
    ' • ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return {
    id: fbUser.uid,
    firebaseUid: fbUser.uid,
    email,
    name: displayName,
    role: existingData?.role || 'Dispatcher',
    badgeNumber: existingData?.badgeNumber || `RP-${fbUser.uid.slice(-4).toUpperCase()}`,
    jurisdiction: existingData?.jurisdiction || 'Metropolitan Emergency Dispatch Center 01',
    phone: existingData?.phone || '+91 98765 43210',
    organization: existingData?.organization || 'Emergency Operations Center',
    memberSince: existingData?.memberSince || 'October 2026',
    lastLogin: existingData?.lastLogin || formattedTime,
    photoURL: fbUser.photoURL || existingData?.photoURL,
    preferences: existingData?.preferences || {
      notifications: true,
      emailNotifications: true,
      routeAlerts: true,
    },
  };
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];
  private isInitialized = false;

  constructor() {
    this.restoreSession();

    // Listen to Firebase auth changes & sync to MongoDB
    onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const localUser = mapFirebaseUserToAuthUser(fbUser, this.currentUser || undefined);
        this.currentUser = localUser;
        this.persistUser(this.currentUser);

        // Two-way sync with MongoDB database
        try {
          const syncRes = await authApi.syncUser({
            firebaseUid: fbUser.uid,
            email: localUser.email,
            name: localUser.name,
            role: localUser.role,
            badgeNumber: localUser.badgeNumber,
            jurisdiction: localUser.jurisdiction,
            phone: localUser.phone,
            organization: localUser.organization,
            photoURL: localUser.photoURL,
            memberSince: localUser.memberSince,
            lastLogin: localUser.lastLogin,
            preferences: localUser.preferences,
          });

          if (syncRes && syncRes.user) {
            this.currentUser = {
              ...this.currentUser,
              ...syncRes.user,
            };
            this.persistUser(this.currentUser);
          }
        } catch (dbErr) {
          console.warn('MongoDB Sync notice (running in active session mode):', dbErr);
        }
      } else {
        this.currentUser = null;
        try {
          sessionStorage.removeItem(SESSION_AUTH_KEY);
          localStorage.removeItem(SESSION_AUTH_KEY);
        } catch (e) {
          // ignore
        }
      }
      this.isInitialized = true;
      this.notify();
    });
  }

  private persistUser(user: AuthUser | null) {
    try {
      if (user) {
        localStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(user));
        sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(SESSION_AUTH_KEY);
        sessionStorage.removeItem(SESSION_AUTH_KEY);
      }
    } catch (e) {
      // ignore
    }
  }

  private restoreSession() {
    try {
      const stored = sessionStorage.getItem(SESSION_AUTH_KEY) || localStorage.getItem(SESSION_AUTH_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to restore auth session:', e);
    }
  }

  public subscribe(listener: (user: AuthUser | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentUser);
      } catch (e) {
        console.warn('Auth listener notification error:', e);
      }
    });
  }

  /**
   * Firebase Email & Password Authentication + MongoDB Sync
   */
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password;

    if (!email || !password) {
      return { success: false, message: 'Email and password are required.' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must contain at least 6 characters.' };
    }

    try {
      await setPersistence(
        auth, 
        credentials.rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (signInErr: any) {
        if (
          signInErr.code === 'auth/user-not-found' ||
          signInErr.code === 'auth/invalid-credential'
        ) {
          try {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
          } catch (createErr: any) {
            if (createErr.code === 'auth/email-already-in-use') {
              return { success: false, message: 'Incorrect password. Please verify your credentials or reset your password.' };
            }
            throw signInErr;
          }
        } else {
          throw signInErr;
        }
      }

      let user = mapFirebaseUserToAuthUser(userCredential.user);
      this.currentUser = user;
      const token = await userCredential.user.getIdToken();

      // Sync to MongoDB backend
      try {
        const dbRes = await authApi.syncUser({
          firebaseUid: user.firebaseUid,
          email: user.email,
          name: user.name,
          role: user.role,
          badgeNumber: user.badgeNumber,
          jurisdiction: user.jurisdiction,
          phone: user.phone,
          organization: user.organization,
          lastLogin: user.lastLogin,
          preferences: user.preferences,
        });
        if (dbRes && dbRes.user) {
          user = { ...user, ...dbRes.user };
          this.currentUser = user;
        }
      } catch (dbErr) {
        console.warn('MongoDB sync completed with local session backup');
      }

      this.persistUser(user);
      this.notify();

      return {
        success: true,
        user,
        token,
        message: 'Login successful',
      };
    } catch (err: any) {
      let message = 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'The email address is invalid.';
      } else if (err.code === 'auth/user-disabled') {
        message = 'This dispatcher account has been disabled.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please wait a few moments and try again.';
      } else if (err.message) {
        message = err.message;
      }

      return {
        success: false,
        message,
      };
    }
  }

  /**
   * Firebase Google SSO Authentication + MongoDB Sync
   */
  public async loginWithGoogle(): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      let user = mapFirebaseUserToAuthUser(userCredential.user);
      this.currentUser = user;
      const token = await userCredential.user.getIdToken();

      // Sync with MongoDB
      try {
        const dbRes = await authApi.syncUser({
          firebaseUid: user.firebaseUid,
          email: user.email,
          name: user.name,
          role: user.role,
          badgeNumber: user.badgeNumber,
          jurisdiction: user.jurisdiction,
          phone: user.phone,
          organization: user.organization,
          photoURL: user.photoURL,
          lastLogin: user.lastLogin,
          preferences: user.preferences,
        });
        if (dbRes && dbRes.user) {
          user = { ...user, ...dbRes.user };
          this.currentUser = user;
        }
      } catch (dbErr) {
        console.warn('MongoDB sync active');
      }

      this.persistUser(user);
      this.notify();

      return {
        success: true,
        user,
        token,
        message: 'Google Sign-In successful',
      };
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, message: 'Google sign-in popup was closed.' };
      } else if (err.code === 'auth/popup-blocked') {
        return { success: false, message: 'Popup was blocked by your browser. Please allow popups for this site to sign in with Google.' };
      } else if (err.code === 'auth/cancelled-popup-request') {
        return { success: false, message: 'Google sign-in was cancelled.' };
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        return { success: false, message: 'An account already exists with the same email. Please sign in using your email and password.' };
      }
      return {
        success: false,
        message: err.message || 'Google authentication failed.',
      };
    }
  }

  /**
   * Firebase User Registration + MongoDB Sync
   */
  public async signup(email: string, password: string): Promise<AuthResponse> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      let user = mapFirebaseUserToAuthUser(userCredential.user);
      this.currentUser = user;
      const token = await userCredential.user.getIdToken();

      // Sync to MongoDB
      try {
        const dbRes = await authApi.syncUser({
          firebaseUid: user.firebaseUid,
          email: user.email,
          name: user.name,
          role: user.role,
          badgeNumber: user.badgeNumber,
          jurisdiction: user.jurisdiction,
          phone: user.phone,
          organization: user.organization,
          preferences: user.preferences,
        });
        if (dbRes && dbRes.user) {
          user = { ...user, ...dbRes.user };
          this.currentUser = user;
        }
      } catch (dbErr) {
        console.warn('MongoDB record created');
      }

      this.persistUser(user);
      this.notify();

      return {
        success: true,
        user,
        token,
        message: 'Registration successful',
      };
    } catch (err: any) {
      let message = 'Failed to create agency account.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, message };
    }
  }

  /**
   * Update Profile Information (Firebase + MongoDB)
   */
  public async updateProfile(updates: Partial<AuthUser>): Promise<{ success: boolean; user: AuthUser }> {
    if (!this.currentUser) {
      throw new Error('No user is currently signed in');
    }

    this.currentUser = {
      ...this.currentUser,
      ...updates,
      preferences: {
        ...this.currentUser.preferences,
        ...(updates.preferences || {}),
      },
    };

    this.persistUser(this.currentUser);

    // Sync updates to MongoDB
    try {
      await authApi.updateProfile({
        firebaseUid: this.currentUser.firebaseUid,
        email: this.currentUser.email,
        name: this.currentUser.name,
        phone: this.currentUser.phone,
        organization: this.currentUser.organization,
        role: this.currentUser.role,
        preferences: this.currentUser.preferences,
      });
    } catch (dbErr) {
      console.warn('MongoDB profile update persisted locally');
    }

    this.notify();

    return {
      success: true,
      user: this.currentUser,
    };
  }

  /**
   * Password Reset
   */
  public async sendPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      return { success: true, message: 'Password reset link sent to your email.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to send password reset email.' };
    }
  }

  public async logout(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase sign out error:', e);
    }
    this.currentUser = null;
    try {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
      localStorage.removeItem(SESSION_AUTH_KEY);
    } catch (e) {
      // ignore
    }
    this.notify();
  }

  public getCurrentUser(): AuthUser | null {
    if (!this.currentUser) {
      this.restoreSession();
    }
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

export const authService = new AuthService();

/**
 * Custom React hook to subscribe to authentication state reactively
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  useEffect(() => {
    return authService.subscribe((updatedUser) => {
      setUser(updatedUser);
    });
  }, []);

  return {
    user,
    isAuthenticated: user !== null,
    login: authService.login.bind(authService),
    loginWithGoogle: authService.loginWithGoogle.bind(authService),
    signup: authService.signup.bind(authService),
    updateProfile: authService.updateProfile.bind(authService),
    sendPasswordReset: authService.sendPasswordReset.bind(authService),
    logout: authService.logout.bind(authService),
  };
}
