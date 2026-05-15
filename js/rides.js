import { db } from './firebase-config.js';
import {
  collection, doc, addDoc, updateDoc,
  getDocs, getDoc, query, where, orderBy,
  serverTimestamp, arrayUnion, arrayRemove,
  onSnapshot,
} from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js';

const RIDES = 'rides';

export async function createRide(user, data) {
  const payload = {
    ...data,
    availableSeats: data.seats,
    status: 'pending',
    createdBy: user.uid,
    driverName: user.name,
    driverEmail: user.email,
    passengers: [],
    createdAt: serverTimestamp(),
  };
  if (payload.description === undefined) delete payload.description;
  const ref = await addDoc(collection(db, RIDES), payload);
  return ref.id;
}

export async function getAvailableRides() {
  const today = new Date().toISOString().split('T')[0];
  const q = query(
    collection(db, RIDES),
    where('status', '==', 'pending'),
    where('date', '>=', today),
    orderBy('date', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Suscripción en tiempo real a rides disponibles.
 *  Llama callback(rides[]) cada vez que cambia Firestore.
 *  Retorna la función unsubscribe. */
export function listenAvailableRides(callback, onError) {
  const today = new Date().toISOString().split('T')[0];
  const q = query(
    collection(db, RIDES),
    where('status', '==', 'pending'),
    where('date', '>=', today),
    orderBy('date', 'asc')
  );
  return onSnapshot(
    q,
    snap => { callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))); },
    err  => { console.error('[Firestore]', err); if (onError) onError(err); }
  );
}

export async function getMyRides(uid) {
  const q = query(collection(db, RIDES), where('createdBy', '==', uid), orderBy('date', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getMyBookings(uid) {
  const q = query(collection(db, RIDES), where('passengers', 'array-contains', uid), orderBy('date', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getRideById(id) {
  const snap = await getDoc(doc(db, RIDES, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function bookRide(rideId, uid) {
  const ref  = doc(db, RIDES, rideId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Ride no encontrado');
  const r = snap.data();
  if (r.createdBy === uid)          throw new Error('No puedes reservar tu propio ride');
  if (r.status !== 'pending')       throw new Error('Este ride ya no está disponible');
  if (r.availableSeats <= 0)        throw new Error('No hay cupos disponibles');
  if (r.passengers.includes(uid))   throw new Error('Ya tienes reserva en este ride');
  const newAvail = r.availableSeats - 1;
  await updateDoc(ref, {
    passengers: arrayUnion(uid),
    availableSeats: newAvail,
    status: newAvail === 0 ? 'accepted' : 'pending',
  });
}

export async function cancelBooking(rideId, uid) {
  const ref  = doc(db, RIDES, rideId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Ride no encontrado');
  const r = snap.data();
  if (!r.passengers.includes(uid)) throw new Error('No tienes reserva en este ride');
  const newAvail = r.availableSeats + 1;
  await updateDoc(ref, {
    passengers: arrayRemove(uid),
    availableSeats: newAvail,
    status: r.status === 'accepted' && newAvail > 0 ? 'pending' : r.status,
  });
}

export async function completeRide(rideId, uid) {
  const ref  = doc(db, RIDES, rideId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Ride no encontrado');
  if (snap.data().createdBy !== uid) throw new Error('No eres el conductor');
  await updateDoc(ref, { status: 'completed' });
}

export async function cancelRide(rideId, uid) {
  const ref  = doc(db, RIDES, rideId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Ride no encontrado');
  const r = snap.data();
  if (r.createdBy !== uid) throw new Error('No eres el conductor');
  if (['completed','canceled'].includes(r.status)) throw new Error('Ride ya finalizado');
  await updateDoc(ref, { status: 'canceled' });
}
