'use client';
import { useState, useEffect } from 'react';
import api, { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then(r => setSettings(r.data || {})).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success('Einstellungen gespeichert');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const sections = [
    {
      title: '🏪 Shop-Konfiguration',
      fields: [
        { key: 'shop_name', label: 'Shop-Name', type: 'text', placeholder: 'CryptoMarket' },
        { key: 'shop_tagline', label: 'Tagline', type: 'text', placeholder: 'Anonymes Crypto-Shopping' },
        { key: 'shop_description', label: 'Beschreibung', type: 'textarea', placeholder: 'Shop-Beschreibung...' },
      ]
    },
    {
      title: '📢 Ankündigungs-Banner',
      fields: [
        { key: 'announcement_bar', label: 'Banner-Text', type: 'text', placeholder: '🔒 100% Anonym · XMR & Bitcoin · Weltweiter Versand' },
        { key: 'announcement_active', label: 'Banner anzeigen', type: 'checkbox' },
      ]
    },
    {
      title: '💱 Währung',
      fields: [
        { key: 'currency', label: 'Währungscode', type: 'text', placeholder: 'EUR' },
        { key: 'currency_symbol', label: 'Währungssymbol', type: 'text', placeholder: '€' },
      ]
    },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="spinner w-8 h-8" />
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--cm-muted)' }}>Konfiguration</p>
        <h1 className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--cm-text-bright)' }}>Einstellungen</h1>
      </div>

      <div className="max-w-2xl space-y-6">
        {sections.map(section => (
          <div key={section.title} className="card p-6">
            <h2 className="font-bold mb-5" style={{ color: 'var(--cm-text-bright)' }}>{section.title}</h2>
            <div className="space-y-4">
              {section.fields.map(f => (
                <div key={f.key}>
                  <label className="block text-xs uppercase tracking-wider mb-1.5 font-medium" style={{ color: 'var(--cm-muted)' }}>{f.label}</label>
                  {f.type === 'checkbox' ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" style={{ accentColor: 'var(--cm-cyan)', width: 16, height: 16 }}
                        checked={!!settings[f.key]} onChange={set(f.key)} />
                      <span className="text-sm">{settings[f.key] ? 'Aktiviert' : 'Deaktiviert'}</span>
                    </label>
                  ) : f.type === 'textarea' ? (
                    <textarea className="input" rows={3} placeholder={f.placeholder}
                      value={settings[f.key] || ''} onChange={set(f.key)} />
                  ) : (
                    <input className="input" type="text" placeholder={f.placeholder}
                      value={settings[f.key] || ''} onChange={set(f.key)} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Oxapay info */}
        <div className="card p-6">
          <h2 className="font-bold mb-4" style={{ color: 'var(--cm-text-bright)' }}>🔑 Zahlungs-Integration</h2>
          <div className="p-4 rounded-xl text-sm space-y-2" style={{ background: 'var(--cm-surface)', border: '1px solid var(--cm-border)' }}>
            <div className="flex justify-between">
              <span style={{ color: 'var(--cm-muted)' }}>Oxapay Merchant Key</span>
              <span className="font-mono text-xs" style={{ color: 'var(--cm-cyan)' }}>In .env.local konfiguriert</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--cm-muted)' }}>Callback URL</span>
              <span className="font-mono text-xs" style={{ color: 'var(--cm-muted)' }}>/api/oxapay/callback</span>
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-3">
          {saving ? <div className="spinner w-4 h-4" /> : <Save size={16} />}
          Einstellungen speichern
        </button>
      </div>
    </div>
  );
}
