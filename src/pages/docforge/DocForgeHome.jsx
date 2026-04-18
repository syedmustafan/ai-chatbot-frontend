import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  deleteSession,
  listPacks,
  listSessions,
  uploadFile,
  zipDownloadUrl,
} from '../../services/docforgeApi';

const PRIVACY_MODES = [
  {
    value: 'ephemeral',
    label: 'Ephemeral',
    hint: 'Wipe on download or after 1h — nothing persists.',
  },
  {
    value: 'auto_expire',
    label: 'Auto-expire (24h)',
    hint: 'Retained for 24 hours, then deleted automatically.',
  },
  {
    value: 'retained',
    label: 'Retained',
    hint: 'Kept in your workspace until you manually delete.',
  },
];

const STATUS_BADGE = {
  incomplete: 'border-amber-400/40 text-amber-300 bg-amber-400/10',
  ready: 'border-blue-400/40 text-blue-300 bg-blue-400/10',
  generated: 'border-cyber-green/50 text-cyber-green bg-cyber-green/10',
};

export default function DocForgeHome() {
  const nav = useNavigate();
  const [packs, setPacks] = useState([]);
  const [pack, setPack] = useState('housing_tribunal_pack');
  const [privacy, setPrivacy] = useState('auto_expire');
  const [sessions, setSessions] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const refresh = async () => {
    try {
      const list = await listSessions();
      setSessions(list);
    } catch (e) {
      setError(e.message || 'Failed to load sessions');
    }
  };

  useEffect(() => {
    listPacks().then(setPacks).catch(() => {});
    refresh();
  }, []);

  const doUpload = async (file) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const s = await uploadFile({ file, privacyMode: privacy, templatePack: pack });
      if ((s.record_count || 0) === 0) {
        setError('No rows extracted from the file.');
      }
      await refresh();
      nav(`/docforge/sessions/${s.id}/validate`);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    doUpload(file);
  };

  const onRemove = async (id) => {
    if (!confirm('Delete this session and all its files?')) return;
    await deleteSession(id);
    refresh();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono text-sm">
      <header>
        <h1 className="text-2xl text-cyber-green">DocForge</h1>
        <p className="text-gray-400 mt-1">
          Structured document builder. Upload tabular input, validate extracted rows,
          render templated outputs.
        </p>
      </header>

      <section className="rounded-xl border border-white/10 bg-black/30 p-5 space-y-4">
        <h2 className="text-cyber-green">Upload</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-gray-400">Template pack</span>
            <select
              value={pack}
              onChange={(e) => setPack(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:border-cyber-green outline-none"
            >
              {packs.length === 0 ? (
                <option value="housing_tribunal_pack">Housing Tribunal Pack</option>
              ) : (
                packs.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.display_name}
                  </option>
                ))
              )}
            </select>
          </label>

          <div className="space-y-1">
            <span className="text-gray-400">Privacy mode</span>
            <div className="space-y-1">
              {PRIVACY_MODES.map((m) => (
                <label
                  key={m.value}
                  className={`flex items-start gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                    privacy === m.value
                      ? 'border-cyber-green bg-cyber-green/5'
                      : 'border-white/10 hover:border-cyber-green/40'
                  }`}
                >
                  <input
                    type="radio"
                    checked={privacy === m.value}
                    onChange={() => setPrivacy(m.value)}
                    className="mt-1 accent-cyber-green"
                  />
                  <span>
                    <span className="text-gray-200">{m.label}</span>
                    <span className="block text-xs text-gray-500">{m.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            dragOver
              ? 'border-cyber-green bg-cyber-green/5 text-cyber-green'
              : 'border-white/15 text-gray-400 hover:border-cyber-green/50 hover:text-cyber-green'
          }`}
        >
          {busy ? 'Uploading…' : 'Drop .xlsx or .pdf here, or click to choose a file'}
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.pdf"
            className="hidden"
            onChange={(e) => doUpload(e.target.files?.[0])}
          />
        </div>

        {error && <p className="text-red-400">{error}</p>}
      </section>

      <section className="rounded-xl border border-white/10 bg-black/30 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-cyber-green">Recent sessions</h2>
          <button
            onClick={refresh}
            className="text-xs text-gray-400 hover:text-cyber-green"
          >
            refresh
          </button>
        </div>

        {sessions.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">No sessions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-gray-500 text-xs uppercase">
                <tr>
                  <th className="py-2 pr-4">File</th>
                  <th className="py-2 pr-4">Pack</th>
                  <th className="py-2 pr-4">Mode</th>
                  <th className="py-2 pr-4">Rows</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-t border-white/5">
                    <td className="py-2 pr-4 text-gray-200">{s.original_filename}</td>
                    <td className="py-2 pr-4 text-gray-400">{s.template_pack}</td>
                    <td className="py-2 pr-4 text-gray-400">{s.privacy_mode}</td>
                    <td className="py-2 pr-4 text-gray-400">{s.record_count}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded border text-xs ${STATUS_BADGE[s.status] || ''}`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-gray-500">
                      {new Date(s.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4 text-right space-x-2">
                      <button
                        onClick={() => nav(`/docforge/sessions/${s.id}/validate`)}
                        className="text-cyber-green hover:underline"
                      >
                        validate
                      </button>
                      {s.status === 'generated' && (
                        <a
                          href={zipDownloadUrl(s.id)}
                          className="text-cyber-green hover:underline"
                        >
                          zip
                        </a>
                      )}
                      <button
                        onClick={() => onRemove(s.id)}
                        className="text-red-400 hover:underline"
                      >
                        delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
