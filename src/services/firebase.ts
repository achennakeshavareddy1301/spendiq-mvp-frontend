// src/services/firebase.ts
// Firebase client initialization for SpendIQ

import { initializeApp, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  Auth, 
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  Firestore,
  connectFirestoreEmulator,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe
} from "firebase/firestore";
import { AnalysisDocument, UserDocument, Transaction, AnalysisResult } from "@/types";

// Firebase configuration
// These are public keys and safe to include in frontend code
const firebaseConfig = {
  apiKey: "AIzaSyDauA_Q5lyOTEKPayJlix_Wj4b9cwJvV9Y",
  authDomain: "port-9867d.firebaseapp.com",
  projectId: "port-9867d",
  storageBucket: "port-9867d.firebasestorage.app",
  messagingSenderId: "926508088250",
  appId: "1:926508088250:web:9c108441886f48d933bb83"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Connect to emulators in development
// Uncomment these lines when running Firebase emulators locally
// if (import.meta.env.DEV) {
//   connectAuthEmulator(auth, "http://localhost:9099");
//   connectFirestoreEmulator(db, "localhost", 8080);
// }

// ============ AUTH FUNCTIONS ============

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, displayName?: string): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Create user document in Firestore
  const userDoc: UserDocument = {
    email: credential.user.email || email,
    displayName: displayName || null,
    createdAt: new Date().toISOString()
  };
  
  await setDoc(doc(db, "users", credential.user.uid), userDoc);
  
  return credential.user;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get the current user's ID token for API calls
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

// ============ FIRESTORE FUNCTIONS ============

/**
 * Get a single analysis by ID
 */
export async function getAnalysis(analysisId: string): Promise<AnalysisDocument | null> {
  const docRef = doc(db, "analyses", analysisId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  return {
    id: docSnap.id,
    ...docSnap.data()
  } as AnalysisDocument;
}

/**
 * Get all analyses for the current user
 */
export async function getUserAnalyses(userId: string): Promise<AnalysisDocument[]> {
  const q = query(
    collection(db, "analyses"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as AnalysisDocument[];
}

/**
 * Subscribe to analysis document changes (for real-time status updates)
 */
export function subscribeToAnalysis(
  analysisId: string, 
  callback: (analysis: AnalysisDocument | null) => void
): Unsubscribe {
  const docRef = doc(db, "analyses", analysisId);
  
  return onSnapshot(docRef, (docSnap) => {
    if (!docSnap.exists()) {
      callback(null);
      return;
    }
    
    callback({
      id: docSnap.id,
      ...docSnap.data()
    } as AnalysisDocument);
  });
}

/**
 * Subscribe to user's analyses list (for real-time dashboard updates)
 */
export function subscribeToUserAnalyses(
  userId: string,
  callback: (analyses: AnalysisDocument[]) => void
): Unsubscribe {
  // Simple query without orderBy to avoid index requirement
  const q = query(
    collection(db, "analyses"),
    where("userId", "==", userId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const analyses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AnalysisDocument[];
    
    // Sort client-side instead
    analyses.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
    
    console.log("Fetched analyses:", analyses.length);
    callback(analyses);
  }, (error) => {
    console.error("Error fetching analyses:", error);
    callback([]);
  });
}

/**
 * Save analysis results to Firestore (for history)
 */
export async function saveAnalysisToFirestore(
  userId: string,
  fileName: string,
  transactions: Transaction[],
  result: AnalysisResult
): Promise<string> {
  const analysisDoc: Omit<AnalysisDocument, "id"> = {
    userId,
    fileName,
    status: "done",
    transactionCount: transactions.length,
    result,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString()
  };
  
  const docRef = await addDoc(collection(db, "analyses"), analysisDoc);
  
  // Optionally save transactions as a subcollection
  // For now, we'll skip this to keep it simple
  // The transactions can be re-extracted from the PDF if needed
  
  return docRef.id;
}

// Export Firebase instances for direct use if needed
export { app, auth, db };
