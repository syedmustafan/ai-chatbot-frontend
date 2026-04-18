import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  documentDownloadUrl,
  getSession,
  zipDownloadUrl,
} from '../../services/docforgeApi';

export default function Download() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getSession(id).then(setSession).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="text-red-400 font-mono">{error}</p>;
  if (!session) return <p className="text-gray-400 font-mono">Loading…</p>;

  return (
    <div className="max-w-7xl mx-auto space-y-5 font-mono text-sm">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/docforge" className="text-xs text-gray-400 hover:text-cyber-green">
            ← back
          </Link>
          <h1 className="text-2xl text-cyber-green mt-1">
            Download — {session.original_filename}
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            {session.template_pack} · {session.privacy_mode}
          </p>
        </div>
        <a
          href={zipDownloadUrl(session.id)}
          className="px-4 py-2 rounded-lg border border-cyber-green text-cyber-green hover:bg-cyber-green/10"
        >
          Download ZIP (all)
        </a>
      </div>

      {session.privacy_mode === 'ephemeral' && (
        <p className="text-amber-400 text-xs">
          Ephemeral mode — the ZIP download will wipe this session from the server.
        </p>
      )}

      <div className="space-y-3">
        {session.records.map((r) => (
          <div
            key={r.id}
            className="rounded-xl border border-white/10 bg-black/30 p-4"
          >
            <div className="text-gray-300 mb-2">
              Row {r.row_index}
              <span className="text-gray-500 ml-2">
                {r.data?.tenant_name || r.data?.name || ''}
              </span>
            </div>
            {(r.documents || []).length === 0 ? (
              <p className="text-gray-500 text-xs">No documents.</p>
            ) : (
              <ul className="space-y-1">
                {r.documents.map((d) => (
                  <li key={d.id}>
                    <a
                      href={documentDownloadUrl(d.id)}
                      className="text-cyber-green hover:underline"
                    >
                      {d.display_name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
