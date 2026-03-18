import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchLeads } from '../services/api';

const JOB_LABELS = {
  full_move: 'Full move',
  partial_move: 'Partial move',
  few_boxes: 'Few boxes',
  moving_lift: 'Moving lift',
  other: 'Other',
};

function formatDt(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function Leads() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchLeads(page)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e) => {
        if (!cancelled) {
          const msg =
            e.response?.data?.detail ||
            e.response?.data?.error ||
            e.message ||
            'Failed to load leads';
          setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const results = data?.results ?? [];
  const total = typeof data?.count === 'number' ? data.count : results.length;

  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-cyber-green font-mono tracking-tight">
            Leads
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Intake from web chat & phone ({total} total)
          </p>
        </div>
        <Link
          to="/"
          className="px-4 py-2 rounded-lg border border-cyber-green/40 text-cyber-green hover:bg-cyber-green/10 font-mono text-sm transition-colors"
        >
          ← Chat
        </Link>
      </header>

      {error && (
        <div
          className="mb-6 p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-sm font-mono"
          role="alert"
        >
          {error}
        </div>
      )}

      {loading && !data ? (
        <p className="text-gray-500 font-mono text-sm animate-pulse">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-cyber-green/20 bg-cyber-dark/50 backdrop-blur-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-cyber-green/20 text-cyber-green/90 font-mono text-xs uppercase tracking-wider">
                <th className="p-3">Updated</th>
                <th className="p-3">Source</th>
                <th className="p-3">Status</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Job</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 font-mono">
                    No leads yet.
                  </td>
                </tr>
              ) : (
                results.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/5 hover:bg-cyber-green/5 transition-colors"
                  >
                    <td className="p-3 whitespace-nowrap text-gray-400">
                      {formatDt(row.updated_at)}
                    </td>
                    <td className="p-3 capitalize">{row.source}</td>
                    <td className="p-3">
                      <span
                        className={
                          row.status === 'complete'
                            ? 'text-cyber-green'
                            : 'text-amber-400'
                        }
                      >
                        {row.status === 'complete' ? 'Complete' : 'In progress'}
                      </span>
                    </td>
                    <td className="p-3">
                      {[row.first_name, row.last_name].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="p-3 max-w-[180px] truncate" title={row.email}>
                      {row.email || '—'}
                    </td>
                    <td className="p-3 whitespace-nowrap">{row.phone || '—'}</td>
                    <td className="p-3 text-gray-400">
                      {JOB_LABELS[row.job_type] || row.job_type || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {data && (data.next || data.previous) && (
        <div className="flex justify-center gap-4 mt-6 font-mono text-sm">
          <button
            type="button"
            disabled={!data.previous || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-lg border border-cyber-green/30 text-cyber-green disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyber-green/10"
          >
            Previous
          </button>
          <span className="py-2 text-gray-500">Page {page}</span>
          <button
            type="button"
            disabled={!data.next || loading}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg border border-cyber-green/30 text-cyber-green disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyber-green/10"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
