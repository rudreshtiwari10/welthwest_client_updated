import React, { useEffect, useState, useRef } from 'react';
import { marketService } from '../../services/api';
import { PlusIcon, TrashIcon, CheckIcon, ArrowUpTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

type Tab = 'profile' | 'goals' | 'portfolio' | 'documents';

interface UploadedDoc {
  document_id: string;
  document_type: string;
  filename: string;
  uploaded_at: string;
  extracted_data: any;
  status: string;
  cloudinary_public_id?: string | null;
  download_url?: string | null;
}

const DOC_TYPES: Array<{ id: string; label: string; example: string }> = [
  { id: 'form16', label: 'Form 16', example: 'Annual TDS / salary certificate from your employer' },
  { id: 'salary_slip', label: 'Salary slip', example: 'Monthly payslip with basic, HRA, deductions' },
  { id: 'mf_cg_statement', label: 'MF Capital Gains', example: 'AY-wise statement from CAMS / KFintech' },
  { id: 'loan_document', label: 'Loan document', example: 'Sanction letter or amortisation schedule' },
];

interface MoneyProfile {
  age?: number;
  annual_income?: number;
  is_salaried?: boolean;
  city_tier?: 'metro' | 'tier1' | 'tier2' | 'tier3';
  dependents?: number;
  tax_regime_pref?: 'old' | 'new' | 'auto';
  risk_profile?: 'conservative' | 'moderate' | 'aggressive';
  marital_status?: string;
}

interface Goal {
  id: string;
  type: string;
  name: string;
  target_amount: number;
  target_year: number;
  current_progress: number;
  monthly_sip: number;
  expected_return_pct: number;
}

interface Holding {
  id?: string;
  asset_type: string;
  symbol: string;
  name: string;
  quantity: number;
  avg_buy_price: number;
  buy_date?: string;
  notes?: string;
}

const ASSET_TYPES = ['equity', 'equity_mf', 'debt_mf', 'hybrid_mf', 'etf', 'fd', 'rd', 'ppf', 'epf', 'nps', 'ssy', 'gold', 'bond', 'real_estate', 'cash', 'other'];
const GOAL_TYPES = ['retirement', 'house', 'education', 'emergency', 'vehicle', 'vacation', 'wedding', 'custom'];
const CITY_TIERS = ['metro', 'tier1', 'tier2', 'tier3'];
const REGIMES = ['auto', 'old', 'new'];
const RISK = ['conservative', 'moderate', 'aggressive'];

const MoneyProfileSection: React.FC = () => {
  const [tab, setTab] = useState<Tab>('profile');
  const [savedAt, setSavedAt] = useState<string>('');

  return (
    <div className="bg-white dark:bg-dark-100 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Money Profile</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          The data here grounds Welth's personalised answers — tax estimates, goal tracking, portfolio analysis.
          Nothing here is shared outside your account.
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
        {(['profile', 'goals', 'portfolio', 'documents'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-[1px] transition-colors whitespace-nowrap ${
              tab === t
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t === 'profile' ? 'Profile' : t === 'goals' ? 'Goals' : t === 'portfolio' ? 'Portfolio' : 'Documents'}
          </button>
        ))}
      </div>

      {tab === 'profile' && <ProfileTab onSaved={() => setSavedAt(new Date().toLocaleTimeString())} />}
      {tab === 'goals' && <GoalsTab />}
      {tab === 'portfolio' && <PortfolioTab onSaved={() => setSavedAt(new Date().toLocaleTimeString())} />}
      {tab === 'documents' && <DocumentsTab onSaved={() => setSavedAt(new Date().toLocaleTimeString())} />}

      {savedAt && (
        <div className="mt-4 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <CheckIcon className="w-3.5 h-3.5" /> Saved at {savedAt}
        </div>
      )}
    </div>
  );
};

// =====================================================================
// Profile tab
// =====================================================================

const ProfileTab: React.FC<{ onSaved: () => void }> = ({ onSaved }) => {
  const [profile, setProfile] = useState<MoneyProfile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    marketService.getMoneyProfile()
      .then((p: any) => setProfile(p || {}))
      .catch((e: any) => setErr(e?.response?.data?.error || 'Could not load profile'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setErr('');
    try {
      const saved = await marketService.saveMoneyProfile(profile);
      setProfile(saved);
      onSaved();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading…</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Age">
        <input type="number" min={0} max={120} value={profile.age ?? ''}
          onChange={(e) => setProfile({ ...profile, age: e.target.value ? Number(e.target.value) : undefined })}
          className={inputClass} />
      </Field>
      <Field label="Annual income (₹)">
        <input type="number" min={0} value={profile.annual_income ?? ''}
          onChange={(e) => setProfile({ ...profile, annual_income: e.target.value ? Number(e.target.value) : undefined })}
          className={inputClass} placeholder="e.g. 1500000" />
      </Field>
      <Field label="Salaried?">
        <select value={profile.is_salaried === undefined ? '' : profile.is_salaried ? 'yes' : 'no'}
          onChange={(e) => setProfile({ ...profile, is_salaried: e.target.value === '' ? undefined : e.target.value === 'yes' })}
          className={inputClass}>
          <option value="">— select —</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </Field>
      <Field label="City tier">
        <select value={profile.city_tier ?? ''} onChange={(e) => setProfile({ ...profile, city_tier: (e.target.value || undefined) as any })} className={inputClass}>
          <option value="">— select —</option>
          {CITY_TIERS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Dependents">
        <input type="number" min={0} value={profile.dependents ?? ''}
          onChange={(e) => setProfile({ ...profile, dependents: e.target.value ? Number(e.target.value) : undefined })}
          className={inputClass} />
      </Field>
      <Field label="Tax regime preference">
        <select value={profile.tax_regime_pref ?? 'auto'} onChange={(e) => setProfile({ ...profile, tax_regime_pref: e.target.value as any })} className={inputClass}>
          {REGIMES.map((r) => <option key={r} value={r}>{r === 'auto' ? 'Auto-pick (cheaper)' : r}</option>)}
        </select>
      </Field>
      <Field label="Risk profile">
        <select value={profile.risk_profile ?? ''} onChange={(e) => setProfile({ ...profile, risk_profile: (e.target.value || undefined) as any })} className={inputClass}>
          <option value="">— select —</option>
          {RISK.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </Field>
      <Field label="Marital status">
        <input type="text" value={profile.marital_status ?? ''}
          onChange={(e) => setProfile({ ...profile, marital_status: e.target.value || undefined })}
          className={inputClass} placeholder="single / married / …" />
      </Field>

      {err && <div className="md:col-span-2 text-sm text-rose-600 dark:text-rose-400">{err}</div>}

      <div className="md:col-span-2 flex justify-end pt-2">
        <button onClick={save} disabled={saving} className={primaryBtn}>
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </div>
    </div>
  );
};

// =====================================================================
// Goals tab
// =====================================================================

const GoalsTab: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Partial<Goal>>({ type: 'retirement', expected_return_pct: 12 });
  const [err, setErr] = useState<string>('');

  const load = () => {
    setLoading(true);
    marketService.getMoneyGoals()
      .then((g: Goal[]) => setGoals(g))
      .catch((e: any) => setErr(e?.response?.data?.error || 'Could not load goals'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const add = async () => {
    setErr('');
    try {
      await marketService.addMoneyGoal(draft);
      setDraft({ type: 'retirement', expected_return_pct: 12 });
      load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Could not add goal');
    }
  };

  const remove = async (id: string) => {
    await marketService.deleteMoneyGoal(id);
    load();
  };

  return (
    <div>
      {/* Existing goals */}
      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : goals.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400 italic mb-4">
          No goals saved yet. Add one below — Welth will use it for goal-tracking and tailored projections.
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {goals.map((g) => (
            <div key={g.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-dark-200">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {g.name} <span className="text-xs text-gray-500 dark:text-gray-400">· {g.type}</span>
                </div>
                <div className="font-mono text-xs text-gray-600 dark:text-gray-400 tabular-nums">
                  Target ₹{g.target_amount.toLocaleString('en-IN')} by {g.target_year}
                  {g.monthly_sip ? ` · SIP ₹${g.monthly_sip.toLocaleString('en-IN')}/mo` : ''}
                  {g.current_progress ? ` · Progress ₹${g.current_progress.toLocaleString('en-IN')}` : ''}
                </div>
              </div>
              <button onClick={() => remove(g.id)} className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Add a goal</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Type">
            <select value={draft.type ?? 'retirement'} onChange={(e) => setDraft({ ...draft, type: e.target.value })} className={inputClass}>
              {GOAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Name">
            <input type="text" value={draft.name ?? ''} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputClass} placeholder="e.g. Retirement at 55" />
          </Field>
          <Field label="Target amount (₹)">
            <input type="number" min={0} value={draft.target_amount ?? ''} onChange={(e) => setDraft({ ...draft, target_amount: Number(e.target.value) })} className={inputClass} placeholder="e.g. 50000000" />
          </Field>
          <Field label="Target year">
            <input type="number" min={2025} max={2100} value={draft.target_year ?? ''} onChange={(e) => setDraft({ ...draft, target_year: Number(e.target.value) })} className={inputClass} placeholder="e.g. 2050" />
          </Field>
          <Field label="Current progress (₹)">
            <input type="number" min={0} value={draft.current_progress ?? ''} onChange={(e) => setDraft({ ...draft, current_progress: Number(e.target.value) })} className={inputClass} placeholder="optional" />
          </Field>
          <Field label="Monthly SIP (₹)">
            <input type="number" min={0} value={draft.monthly_sip ?? ''} onChange={(e) => setDraft({ ...draft, monthly_sip: Number(e.target.value) })} className={inputClass} placeholder="optional" />
          </Field>
          <Field label="Expected return (%)">
            <input type="number" min={0} max={50} value={draft.expected_return_pct ?? 12} onChange={(e) => setDraft({ ...draft, expected_return_pct: Number(e.target.value) })} className={inputClass} />
          </Field>
        </div>
        {err && <div className="text-sm text-rose-600 dark:text-rose-400 mt-2">{err}</div>}
        <div className="flex justify-end mt-3">
          <button onClick={add} className={primaryBtn}>
            <PlusIcon className="w-4 h-4 inline mr-1" /> Add goal
          </button>
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// Portfolio tab
// =====================================================================

const PortfolioTab: React.FC<{ onSaved: () => void }> = ({ onSaved }) => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    marketService.getMoneyPortfolio()
      .then((p: any) => setHoldings(p.holdings || []))
      .catch((e: any) => setErr(e?.response?.data?.error || 'Could not load portfolio'))
      .finally(() => setLoading(false));
  }, []);

  const update = (idx: number, field: keyof Holding, val: any) => {
    setHoldings(holdings.map((h, i) => (i === idx ? { ...h, [field]: val } : h)));
  };

  const addRow = () => {
    setHoldings([...holdings, { asset_type: 'equity', symbol: '', name: '', quantity: 0, avg_buy_price: 0 }]);
  };
  const removeRow = (idx: number) => {
    setHoldings(holdings.filter((_, i) => i !== idx));
  };

  const save = async () => {
    setSaving(true);
    setErr('');
    try {
      const saved = await marketService.saveMoneyPortfolio(holdings);
      setHoldings(saved.holdings || []);
      onSaved();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Could not save portfolio');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading…</div>;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="pb-2 pr-2 font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Type</th>
              <th className="pb-2 pr-2 font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Symbol</th>
              <th className="pb-2 pr-2 font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Name</th>
              <th className="pb-2 pr-2 font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Quantity</th>
              <th className="pb-2 pr-2 font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Avg buy price (₹)</th>
              <th className="pb-2 pr-2 font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Buy date</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {holdings.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-sm text-gray-500 dark:text-gray-400 italic">
                  No holdings yet. Click "Add row" to enter your investments.
                </td>
              </tr>
            ) : (
              holdings.map((h, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-1.5 pr-2">
                    <select value={h.asset_type} onChange={(e) => update(idx, 'asset_type', e.target.value)} className={cellInput}>
                      {ASSET_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </td>
                  <td className="py-1.5 pr-2">
                    <input type="text" value={h.symbol} onChange={(e) => update(idx, 'symbol', e.target.value.toUpperCase())} className={cellInput} placeholder="RELIANCE" />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input type="text" value={h.name} onChange={(e) => update(idx, 'name', e.target.value)} className={cellInput} placeholder="Reliance Industries" />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input type="number" min={0} step="any" value={h.quantity || ''} onChange={(e) => update(idx, 'quantity', Number(e.target.value))} className={`${cellInput} tabular-nums`} />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input type="number" min={0} step="any" value={h.avg_buy_price || ''} onChange={(e) => update(idx, 'avg_buy_price', Number(e.target.value))} className={`${cellInput} tabular-nums`} />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input type="date" value={h.buy_date || ''} onChange={(e) => update(idx, 'buy_date', e.target.value)} className={cellInput} />
                  </td>
                  <td className="py-1.5">
                    <button onClick={() => removeRow(idx)} className="p-1 text-gray-400 hover:text-rose-500">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {err && <div className="text-sm text-rose-600 dark:text-rose-400 mt-3">{err}</div>}

      <div className="flex justify-between items-center mt-4">
        <button onClick={addRow} className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 inline-flex items-center gap-1">
          <PlusIcon className="w-4 h-4" /> Add row
        </button>
        <button onClick={save} disabled={saving} className={primaryBtn}>
          {saving ? 'Saving…' : 'Save portfolio'}
        </button>
      </div>
    </div>
  );
};

// =====================================================================
// Documents tab
// =====================================================================

const DocumentsTab: React.FC<{ onSaved: () => void }> = ({ onSaved }) => {
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [err, setErr] = useState<string>('');
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = () => {
    setLoading(true);
    marketService.listDocuments()
      .then((d: UploadedDoc[]) => setDocs(d))
      .catch((e: any) => setErr(e?.response?.data?.error || 'Could not load documents'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleFile = async (docType: string, file: File | null | undefined) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErr('Only PDF files are supported.');
      return;
    }
    setErr('');
    setUploading(docType);
    try {
      await marketService.uploadDocument(file, docType);
      onSaved();
      load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(null);
      if (fileRefs.current[docType]) {
        fileRefs.current[docType]!.value = '';
      }
    }
  };

  const remove = async (id: string) => {
    await marketService.deleteDocument(id);
    load();
  };

  const docsByType = (t: string) => docs.filter((d) => d.document_type === t);

  return (
    <div>
      <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-200 p-3 mb-5 text-xs text-gray-600 dark:text-gray-400">
        <strong className="text-gray-900 dark:text-white">Privacy:</strong> uploaded PDFs are stored privately on WelthWest's
        secure object storage (authenticated access only — they're not publicly browsable) and parsed for structured fields.
        Only you can re-download them via a time-limited signed link from this page. Delete anytime — removes both the file
        and the extracted data. Scanned-image PDFs aren't supported yet (text-based only).
      </div>

      <div className="space-y-5">
        {DOC_TYPES.map((dt) => {
          const existing = docsByType(dt.id);
          const isUploading = uploading === dt.id;
          return (
            <div key={dt.id} className="rounded-md border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="font-medium text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    {dt.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{dt.example}</div>
                </div>
                <div>
                  <input
                    ref={(el) => (fileRefs.current[dt.id] = el)}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(e) => handleFile(dt.id, e.target.files?.[0])}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileRefs.current[dt.id]?.click()}
                    disabled={isUploading}
                    className="px-3 py-1.5 text-xs font-medium rounded-md border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white dark:hover:text-white disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <ArrowUpTrayIcon className="w-3.5 h-3.5" />
                    {isUploading ? 'Parsing…' : existing.length > 0 ? 'Replace' : 'Upload PDF'}
                  </button>
                </div>
              </div>

              {existing.length === 0 ? (
                <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                  No {dt.label.toLowerCase()} uploaded yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {existing.map((d) => (
                    <DocumentRow key={d.document_id} doc={d} onDelete={() => remove(d.document_id)} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {loading && <div className="text-sm text-gray-500 mt-3">Loading…</div>}
      {err && <div className="text-sm text-rose-600 dark:text-rose-400 mt-3">{err}</div>}
    </div>
  );
};

const DocumentRow: React.FC<{ doc: UploadedDoc; onDelete: () => void }> = ({ doc, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const data = doc.extracted_data || {};
  const headlineFields = pickHeadlines(doc.document_type, data);

  return (
    <div className="rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-200 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-xs text-gray-900 dark:text-light-200 truncate">{doc.filename}</div>
          <div className="font-mono text-[10px] text-gray-500 dark:text-gray-400">
            Uploaded {new Date(doc.uploaded_at).toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {doc.download_url && (
            <a
              href={doc.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest rounded border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white dark:hover:text-white transition-colors"
              title="Download / view the original PDF (signed link, expires in 1 hour)"
            >
              Download
            </a>
          )}
          <button onClick={onDelete} className="p-1 text-gray-400 hover:text-rose-500" title="Delete this document">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Headline extracted fields */}
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5 font-mono text-[11px]">
        {headlineFields.map(([label, val]) => (
          <div key={label}>
            <span className="block uppercase tracking-widest text-[9px] text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-gray-900 dark:text-light-200 tabular-nums">{val}</span>
          </div>
        ))}
      </div>

      {/* Expand to show full extraction */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
      >
        {expanded ? 'Hide full extraction' : 'Show all extracted fields'}
      </button>
      {expanded && (
        <pre className="mt-2 text-[10px] font-mono text-gray-700 dark:text-light-300 bg-white dark:bg-dark-100 border border-gray-200 dark:border-gray-700 rounded p-2 overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

const fmt = (v: any) => {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'number') return v.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  return String(v);
};

function pickHeadlines(docType: string, data: any): Array<[string, string]> {
  if (docType === 'form16') {
    return [
      ['FY', fmt(data.financial_year)],
      ['Gross', fmt(data.gross_salary)],
      ['Taxable', fmt(data.total_taxable_income)],
      ['80C', fmt(data.section_80c)],
      ['Total tax', fmt(data.total_tax_payable)],
      ['TDS', fmt(data.tds_deducted)],
    ];
  }
  if (docType === 'salary_slip') {
    return [
      ['Period', fmt(data.pay_period)],
      ['Basic', fmt(data.basic)],
      ['HRA', fmt(data.hra)],
      ['Gross', fmt(data.gross_pay || data.gross_pay_inferred_from_components)],
      ['TDS', fmt(data.income_tax_tds)],
      ['Net pay', fmt(data.net_pay)],
    ];
  }
  if (docType === 'mf_cg_statement') {
    return [
      ['AY', fmt(data.assessment_year)],
      ['STCG', fmt(data.total_short_term_gain)],
      ['LTCG', fmt(data.total_long_term_gain)],
      ['ST Loss', fmt(data.total_short_term_loss)],
      ['LT Loss', fmt(data.total_long_term_loss)],
      ['Schemes', fmt(data.schemes_detected_count)],
    ];
  }
  if (docType === 'loan_document') {
    return [
      ['Lender', fmt(data.lender_name)],
      ['Type', fmt(data.loan_type)],
      ['Principal', fmt(data.principal_sanctioned)],
      ['Rate', data.annual_interest_rate_pct ? `${data.annual_interest_rate_pct}%` : '—'],
      ['Tenure', data.tenure_months ? `${data.tenure_months} mo` : '—'],
      ['EMI', fmt(data.monthly_emi)],
    ];
  }
  return [];
}

// =====================================================================
// Shared bits
// =====================================================================

const inputClass =
  'w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500';
const cellInput =
  'w-full px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500';
const primaryBtn =
  'px-4 py-2 text-sm font-medium rounded-md bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

export default MoneyProfileSection;
