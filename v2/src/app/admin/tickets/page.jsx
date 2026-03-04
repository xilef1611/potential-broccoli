'use client';
import { useState, useEffect } from 'react';
import api, { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { Send, MessageCircle } from 'lucide-react';

const PRIO_COLORS = { low: 'badge-neutral', normal: 'badge-info', high: 'badge-warning', urgent: 'badge-danger' };
const STATUS_COLORS = { open: 'badge-warning', in_progress: 'badge-info', resolved: 'badge-success', closed: 'badge-neutral' };
const STATUS_DE = { open: 'Offen', in_progress: 'In Bearbeitung', resolved: 'Gelöst', closed: 'Geschlossen' };

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const r = await api.get('/tickets/admin/all');
      setTickets(r.data.tickets || []);
    } catch { toast.error('Fehler beim Laden der Tickets'); }
    finally { setLoading(false); }
  };

  const fetchTicket = async (ticket) => {
    try {
      const r = await api.get(`/tickets/${ticket.ticket_number}`);
      setSelected(r.data);
    } catch { toast.error('Ticket konnte nicht geladen werden'); }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleReply = async () => {
    if (!reply.trim()) return;
    try {
      await api.post(`/tickets/${selected.ticket_number}/reply`, { message: reply });
      setReply(''); toast.success('Antwort gesendet');
      fetchTicket(selected);
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleStatus = async (status) => {
    await api.put(`/tickets/admin/${selected.id}`, { status });
    toast.success('Status aktualisiert');
    fetchTickets(); fetchTicket(selected);
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--cm-muted)' }}>Verwaltung</p>
        <h1 className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--cm-text-bright)' }}>Support Tickets</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Ticket list */}
        <div className="space-y-2">
          {loading ? (
            [...Array(5)].map((_, i) => <div key={i} className="card h-20 animate-pulse" />)
          ) : tickets.length === 0 ? (
            <div className="card p-10 text-center">
              <MessageCircle size={32} className="mx-auto mb-2 opacity-20" style={{ color: 'var(--cm-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--cm-muted)' }}>Keine Tickets</p>
            </div>
          ) : tickets.map(t => (
            <button key={t.id} onClick={() => fetchTicket(t)}
              className={`card p-4 w-full text-left transition-all hover:border-cyan-500/40 ${selected?.id === t.id ? 'border-cyan-500/60' : ''}`}>
              <div className="flex justify-between items-start mb-1">
                <span className="font-mono text-xs font-bold" style={{ color: 'var(--cm-cyan)' }}>{t.ticket_number}</span>
                <span className={`badge ${STATUS_COLORS[t.status]} text-xs`}>{STATUS_DE[t.status] || t.status}</span>
              </div>
              <p className="text-sm font-medium line-clamp-1">{t.subject}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--cm-muted)' }}>{t.customer_name || t.email}</p>
              <div className="flex gap-2 mt-2">
                <span className={`badge ${PRIO_COLORS[t.priority]} text-xs`}>{t.priority}</span>
                {t.reply_count > 0 && <span className="text-xs" style={{ color: 'var(--cm-muted)' }}>{t.reply_count} Antworten</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Ticket detail */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="card p-16 text-center">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--cm-muted)' }} />
              <p style={{ color: 'var(--cm-muted)' }}>Ticket auswählen</p>
            </div>
          ) : (
            <div className="card flex flex-col" style={{ height: '70vh' }}>
              {/* Header */}
              <div className="p-4 border-b" style={{ borderColor: 'var(--cm-border)' }}>
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-bold" style={{ color: 'var(--cm-text-bright)' }}>{selected.subject}</h2>
                  <span className="font-mono text-xs" style={{ color: 'var(--cm-cyan)' }}>{selected.ticket_number}</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--cm-muted)' }}>{selected.customer_name} • {selected.customer_email || selected.email}</p>
                <div className="flex gap-2 mt-3">
                  {['open', 'in_progress', 'resolved', 'closed'].map(s => (
                    <button key={s} onClick={() => handleStatus(s)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium`}
                      style={selected.status === s
                        ? { background: 'var(--cm-cyan)', color: '#020712' }
                        : { background: 'var(--cm-surface)', color: 'var(--cm-muted)', border: '1px solid var(--cm-border)' }}>
                      {STATUS_DE[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selected.messages?.map(m => (
                  <div key={m.id} className={`p-3 rounded-xl text-sm max-w-[85%] ${m.sender_role === 'admin' ? 'ml-auto' : ''}`}
                    style={m.sender_role === 'admin'
                      ? { background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }
                      : { background: 'var(--cm-surface)', border: '1px solid var(--cm-border)' }}>
                    <p className="text-xs font-bold mb-1" style={{ color: m.sender_role === 'admin' ? 'var(--cm-cyan)' : 'var(--cm-muted)' }}>
                      {m.sender_role === 'admin' ? '👤 Admin' : `👤 ${selected.customer_name}`}
                    </p>
                    <p className="whitespace-pre-wrap">{m.message}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--cm-muted)' }}>{new Date(m.created_at).toLocaleString('de-DE')}</p>
                  </div>
                ))}
                {(!selected.messages || selected.messages.length === 0) && (
                  <p className="text-sm text-center py-8" style={{ color: 'var(--cm-muted)' }}>Keine Nachrichten</p>
                )}
              </div>

              {/* Reply */}
              {selected.status !== 'closed' && (
                <div className="p-4 border-t flex gap-2" style={{ borderColor: 'var(--cm-border)' }}>
                  <textarea className="input resize-none flex-1 text-sm" rows={2}
                    placeholder="Antwort schreiben..." value={reply} onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }} />
                  <button onClick={handleReply} className="btn-primary self-end px-4 py-2">
                    <Send size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
