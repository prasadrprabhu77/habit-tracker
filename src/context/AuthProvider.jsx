import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// ✅ Create context
const AuthContext = createContext();

// ✅ Hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Signup
  async function signup(name, email, password) {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Update Firebase Auth profile
    await updateProfile(user, { displayName: name });

    // Save to Firestore
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      createdAt: new Date(),
    });

    // ✅ Update local state with uid
    setCurrentUser({ uid: user.uid, name, email });

    return user;
  }

  // ✅ Login
  async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.exists()
      ? userDoc.data()
      : { name: user.displayName, email: user.email };

    // ✅ Update local state with uid
    setCurrentUser({ uid: user.uid, name: userData.name, email: user.email });

    return user;
  }

  // ✅ Logout
  async function logout() {
    await signOut(auth);
    setCurrentUser(null);
  }

  // ✅ Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists()
          ? userDoc.data()
          : { name: user.displayName, email: user.email };

        // ✅ Always include uid
        setCurrentUser({
          uid: user.uid,
          name: userData.name,
          email: user.email,
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser, // { uid, name, email }
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
