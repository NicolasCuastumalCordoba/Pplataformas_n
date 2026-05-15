import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut as fbSignOut, onAuthStateChanged, updateProfile,
} from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js';
import {
  doc, setDoc, getDoc, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js';

export let currentUser = null;
export let authReady   = false;
const listeners = [];

export function onUserChange(fn) { listeners.push(fn); }
function notify() { listeners.forEach(fn => fn(currentUser)); }

async function saveProfile(fbUser, role = 'passenger', name = null) {
  const ref  = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: fbUser.uid,
      name: name || fbUser.displayName || 'Usuario',
      email: fbUser.email,
      role,
      photoURL: fbUser.photoURL || null,
      createdAt: serverTimestamp(),
    });
  }
}

export async function getProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export function parseError(err) {
  const map = {
    'auth/email-already-in-use': 'Ese correo ya está registrado.',
    'auth/invalid-email':        'El correo no es válido.',
    'auth/weak-password':        'Contraseña muy débil (mín. 6 caracteres).',
    'auth/invalid-credential':   'Correo o contraseña incorrectos.',
    'auth/user-not-found':       'No existe cuenta con ese correo.',
    'auth/wrong-password':       'Contraseña incorrecta.',
    'auth/too-many-requests':    'Demasiados intentos. Espera un momento.',
  };
  return map[err.code] || 'Ocurrió un error inesperado.';
}

onAuthStateChanged(auth, async fbUser => {
  currentUser = fbUser ? await getProfile(fbUser.uid) : null;
  authReady = true;
  notify();
});

export async function register(name, email, password, role = 'passenger') {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await saveProfile(cred.user, role, name);
  currentUser = await getProfile(cred.user.uid);
  notify();
  return currentUser;
}

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  currentUser = await getProfile(cred.user.uid);
  if (!currentUser) throw new Error('Perfil no encontrado');
  notify();
  return currentUser;
}

export async function signOut() {
  await fbSignOut(auth);
  currentUser = null;
  notify();
}

export async function updateRole(uid, role) {
  await setDoc(doc(db, 'users', uid), { role }, { merge: true });
  currentUser = { ...currentUser, role };
  notify();
}