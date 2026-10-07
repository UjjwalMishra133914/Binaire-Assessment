import { initializeApp } from "firebase/app";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, updateProfile, type Auth, type User,
} from "firebase/auth";

/** Firebase-only authentication wrapped in a class. */
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
  signOut() { return signOut(this.auth); }
  onChange(cb: (u: User | null) => void) { return onAuthStateChanged(this.auth, cb); }
  static friendlyError(e: unknown): string {
    const code = (e as { code?: string })?.code ?? "";
    const map: Record<string, string> = {
      "auth/email-already-in-use": "That email is already registered.",
      "auth/invalid-email": "Please enter a valid email.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/invalid-credential": "Incorrect email or password.",
      "auth/network-request-failed": "You're offline — connect to the internet to authenticate.",
    };
    return map[code] ?? "Something went wrong. Check your Firebase config and try again.";
  }
}
