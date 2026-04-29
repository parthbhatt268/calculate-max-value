import { formatINR } from '../lib/formatINR';

function formatTimestamp(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SnapshotSidebar({ snapshots, onSave, onLoad, onDelete }) {
  return (
    <aside className="w-56 flex-shrink-0 bg-gray-900 text-gray-100 flex flex-col h-full">
      <div className="p-3 border-b border-gray-700">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
          Snapshots
        </h2>
        <button
          onClick={onSave}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-1.5 px-3 rounded transition-colors"
        >
          + Save snapshot
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {snapshots.length === 0 && (
          <p className="text-gray-500 text-xs p-3">No snapshots yet.</p>
        )}
        {snapshots.map((snap) => (
          <div
            key={snap.id}
            onClick={() => onLoad(snap)}
            className="flex items-start justify-between px-3 py-2.5 border-b border-gray-800 cursor-pointer hover:bg-gray-800 group"
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-200 truncate">
                {snap.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {formatTimestamp(snap.created_at)}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(snap.id);
              }}
              className="ml-1 text-gray-600 hover:text-red-400 text-sm leading-none opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
              title="Delete snapshot"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
