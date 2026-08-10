import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth } from "../../config/firebase";

/**
 * Register a new FROST user with email and password.
 */
export async function registerUser({
  email,
  password,
  displayName,
}) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  if (displayName?.trim()) {
    await updateProfile(user, {
      displayName: displayName.trim(),
    });
  }

  await sendEmailVerification(user);

  return user;
}

/**
 * Sign in an existing FROST user.
 */
export async function loginUser({
  email,
  password,
}) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return userCredential.user;
}

/**
 * Send password reset email.
 */
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Send verification email again.
 */
export async function resendVerificationEmail() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No user is currently signed in.");
  }

  await sendEmailVerification(user);
}

/**
 * Sign out the current user.
 */
export async function logoutUser() {
  await signOut(auth);
}

/**
 * Get the currently signed-in Firebase user.
 */
export function getCurrentUser() {
  return auth.currentUser;
}
