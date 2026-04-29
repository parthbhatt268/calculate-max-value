// Phase 1: localStorage. Phase 2 will replace internals with Supabase calls.
const KEY = 'home-loan-app:snapshots';

export async function listSnapshots() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export async function saveSnapshot(label, state) {
  const snapshots = await listSnapshots();
  const newSnap = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    label,
    state,
  };
  localStorage.setItem(KEY, JSON.stringify([newSnap, ...snapshots]));
  return newSnap;
}

export async function deleteSnapshot(id) {
  const snapshots = await listSnapshots();
  localStorage.setItem(KEY, JSON.stringify(snapshots.filter((s) => s.id !== id)));
}
