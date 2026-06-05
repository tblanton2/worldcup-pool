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

function flattenPicks(picks) {
  const flat = {}
  picks.forEach((pot, pi) => {
    pot.forEach((team, ti) => { flat[`${pi}_${ti}`] = team ?? '' })
  })
  return flat
}

function unflattenPicks(flat) {
  const picks = Array.from({ length: 6 }, () => new Array(8).fill(null))
  Object.entries(flat).forEach(([key, val]) => {
    const [pi, ti] = key.split('_').map(Number)
    picks[pi][ti] = val || null
  })
  return picks
}

export async function savePicks(payload) {
  const ref = doc(db, 'pool', 'state')
  const picks = Array.isArray(payload) ? payload : payload.picks
  const results = Array.isArray(payload) ? {} : (payload.results || {})
  await setDoc(ref, {
    picks: flattenPicks(picks),
    results: results
  })
}

export async function loadPicks() {
  const ref = doc(db, 'pool', 'state')
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    picks: data.picks ? unflattenPicks(data.picks) : null,
    results: data.results || {}
  }
}

export function subscribePicks(callback) {
  const ref = doc(db, 'pool', 'state')
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data()
      callback({
        picks: data.picks ? unflattenPicks(data.picks) : null,
        results: data.results || {}
      })
    }
  })
}
