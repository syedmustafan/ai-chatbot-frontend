import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import {
  generateDocuments,
  getSession,
  updateRecord,
} from '../../services/docforgeApi';

export default function Validate() {
  const { id } = useParams();
  const nav = useNavigate();
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    getSession(id).then(setSession).catch((e) => setError(e.message));
  }, [id]);

  const columns = useMemo(() => {
    if (!session) return [];
    const keys = new Set();
    session.records.forEach((r) => Object.keys(r.data || {}).forEach((k) => keys.add(k)));
    session.records.forEach((r) => (r.missing_fields || []).forEach((k) => keys.add(k)));
    return Array.from(keys);
  }, [session]);

  const allValid = useMemo(
    () => session?.records?.length > 0 && session.records.every((r) => (r.missing_fields || []).length === 0),
    [session],
  );

  const onCellChange = async (record, field, value) => {
    const nextData = { ...(record.data || {}), [field]: value };
    const updated = await updateRecord(record.id, nextData);
    setSession((s) => ({
      ...s,
      records: s.records.map((r) => (r.id === record.id ? updated : r)),
    }));
  };

  const onGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const s = await generateDocuments(id);
      setSession(s);
      nav(`/docforge/sessions/${id}/download`);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setGenerating(false);
    }
  };

  if (error) return <p className="text-red-400 font-mono">{error}</p>;
  if (!session) return <p className="text-gray-400 font-mono">Loading…</p>;

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-mono text-sm">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/docforge" className="text-xs text-gray-400 hover:text-cyber-green">
            ← back
          </Link>
          <h1 className="text-2xl text-cyber-green mt-1">Validate — {session.original_filename}</h1>
          <p className="text-gray-500 text-xs mt-1">
            {session.template_pack} · {session.privacy_mode} · {session.records.length} rows
          </p>
        </div>
        <button
          onClick={onGenerate}
          disabled={!allValid || generating}
          className={`px-4 py-2 rounded-lg border font-mono transition-colors ${
            allValid
              ? 'border-cyber-green text-cyber-green hover:bg-cyber-green/10'
              : 'border-white/10 text-gray-500 cursor-not-allowed'
          }`}
        >
          {generating ? 'Generating…' : 'Generate documents'}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/30">
        <table className="w-full text-left">
          <thead className="text-gray-500 text-xs uppercase bg-black/40">
            <tr>
              <th className="py-2 px-3">#</th>
              {columns.map((c) => (
                <th key={c} className="py-2 px-3">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {session.records.map((r) => (
              <tr key={r.id} className="border-t border-white/5">
                <td className="py-2 px-3 text-gray-500">{r.row_index}</td>
                {columns.map((c) => {
                  const isMissing = (r.missing_fields || []).includes(c);
                  return (
                    <td key={c} className="py-1 px-2">
                      <input
                        defaultValue={r.data?.[c] || ''}
                        onBlur={(e) =>
                          e.target.value !== (r.data?.[c] || '') &&
                          onCellChange(r, c, e.target.value)
                        }
                        className={`w-full bg-transparent px-2 py-1 rounded border outline-none text-gray-200 ${
                          isMissing
                            ? 'border-red-500/70 bg-red-500/5 focus:border-red-400'
                            : 'border-white/10 focus:border-cyber-green'
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!allValid && (
        <p className="text-amber-400 text-xs">
          Fill the red-outlined cells before generating documents.
        </p>
      )}
    </div>
  );
}
