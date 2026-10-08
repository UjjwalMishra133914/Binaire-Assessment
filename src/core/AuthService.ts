import { initializeApp } from "firebase/app";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, updateProfile, GoogleAuthProvider, signInWithPopup, type Auth, type User,
} from "firebase/auth";


export class AuthService {
  private static instance: AuthService;
  private auth: Auth;
  static get(): AuthService { return (this.instance ??= new AuthService()); }

  private constructor() {
    const app = initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    });
    this.auth = getAuth(app);
  }
  async signUp(name: string, email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    return cred.user;
  }
  async signIn(email: string, password: string) { return (await signInWithEmailAndPassword(this.auth, email, password)).user; }
  
  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return (await signInWithPopup(this.auth, provider)).user;
  }
  signOut() { return signOut(this.auth); }
  onChange(cb: (u: User | null) => void) { return onAuthStateChanged(this.auth, cb); }
  static friendlyError(e: unknown): string {
    const code = (e as { code?: string })?.code ?? "";
    
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return "";
    const map: Record<string, string> = {
      "auth/email-already-in-use": "That email is already registered. Try signing in instead.",
      "auth/invalid-email": "Please enter a valid email.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/invalid-credential": "Incorrect email or password.",
      "auth/user-not-found": "No account found with that email.",
      "auth/wrong-password": "Incorrect email or password.",
      "auth/user-disabled": "This account has been disabled.",
      "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
      "auth/network-request-failed": "You're offline — connect to the internet to authenticate.",
      "auth/popup-blocked": "Your browser blocked the Google sign-in popup. Allow popups for this site and try again.",
      "auth/account-exists-with-different-credential": "This email is already registered with a password. Sign in with your email and password instead.",
      "auth/operation-not-allowed": "This sign-in method is not enabled in the Firebase console yet.",
      "auth/invalid-api-key": "Firebase API key is invalid. Check VITE_FIREBASE_API_KEY in .env and restart the dev server.",
      "auth/api-key-not-valid.-please-pass-a-valid-api-key.": "Firebase API key is invalid. Check VITE_FIREBASE_API_KEY in .env and restart the dev server.",
      "auth/configuration-not-found": "Authentication is not set up in this Firebase project. Click Get started in the Authentication tab.",
      "auth/unauthorized-domain": "This domain is not authorized in Firebase. Add it under Authentication → Settings → Authorized domains.",
    };
    return map[code] ?? `Something went wrong${code ? ` (${code})` : ""}. Check your Firebase config and try again.`;
  }
}