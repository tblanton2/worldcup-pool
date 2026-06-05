import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAV65rZRS9lcrgY-xIfEqXYMrRxJGJRUCY",
  authDomain: "zucchini-2026-world-cup-pool.firebaseapp.com",
  projectId: "zucchini-2026-world-cup-pool",
  storageBucket: "zucchini-2026-world-cup-pool.firebasestorage.app",
  messagingSenderId: "944255574004",
  appId: "1:944255574004:web:f640b0963e2f84302863a1",
  measurementId: "G-9QE5NB29LW"
}

const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)

const POOL_DOC = 'pool/state'

// picks is a 6x8 array (potIdx x playerIdx) of teamName | null
// Firestore can't store nested arrays directly, so we flatten to an object:
// { "0_0": "France", "0_1": null, ... }

export function flattenPicks(picks) {
  const flat = {}
  picks.forEach((pot, pi) => {
    pot.forEach((team, ti) => {
      flat[`${pi}_${ti}`] = team ?? ''
    })
  })
  return flat
}

export function unflattenPicks(flat) {
  const picks = Array.from({ length: 6 }, () => new Array(8).fill(null))
  Object.entries(flat).forEach(([key, val]) => {
    const [pi, ti] = key.split('_').map(Number)
    picks[pi][ti] = val || null
  })
  return picks
}

export async function loadPicks() {
  const ref = doc(db, 'pool', 'state')
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return unflattenPicks(snap.data())
}

export async function savePicks(picks) {
  const ref = doc(db, 'pool', 'state')
  await setDoc(ref, flattenPicks(picks))
}

export function subscribePicks(callback) {
  const ref = doc(db, 'pool', 'state')
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback(unflattenPicks(snap.data()))
    }
  })
}
