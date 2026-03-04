'use client';
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import api, { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { MessageCircle, Send, Search } from 'lucide-react';

export default function SupportPage() {
  const [tab, setTab] = useState('new');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [ticketNum, setTicketNum] = useState('');
  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState('');

  const [form, setForm] = useState({
    customer_email: '', customer_name: '', subject: '', message: '', order_id: '',
  });

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async () => {
    const req = ['customer_email', 'customer_name', 'subject', 'message'];
    for (const f of req) if (!form[f].trim()) return toast.error(`Please fill in ${f.replace('_', ' ')}`);
    setLoading(true);
    try {
      const r = await api.post('/tickets', form);
      setSubmitted(r.data.ticket_number);
      toast.success('Ticket created!');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const handleLookup = async () => {
    if (!ticketNum.trim()) return toast.error('Enter a ticket number');
    setLoading(true);
    try {
      const r = await api.get(`/tickets/${ticketNum.trim().toUpperCase()}`);
      setTicket(r.data);
    } catch { toast.error('Ticket not found'); }
    finally { setLoading(false); }
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    try {
      await api.post(`/tickets/${ticket.ticket_number}/reply`, { message: reply });
      setReply('');
      toast.success('Reply sent');
      handleLookup();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const STATUS_COLORS = { open: 'badge-warning', in_progress: 'badge-info', resolved: 'badge-success', closed: 'badge-neutral' };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-black mb-2">SUPPORT</h1>
        <p className="text-ask-muted mb-8">Need help? Create a ticket or check an existing one.</p>

        <div className="flex rounded-xl overflow-hidden border border-ask-border mb-8">
          {['new', 'lookup'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${
                tab === t ? 'bg-ask-accent text-ask-bg' : 'text-ask-muted hover:text-ask-text'
              }`}>
              {t === 'new' ? 'New Ticket' : 'Check Ticket'}
            </button>
          ))}
        </div>

        {tab === 'new' && (
          submitted ? (
            <div className="card p-8 text-center">
              <MessageCircle size={48} className="mx-auto mb-4 text-ask-accent" />
              <h2 className="text-2xl font-bold mb-2">Ticket Created!</h2>
              <p className="text-ask-muted mb-4">Your ticket number:</p>
              <div className="font-mono text-3xl font-black text-ask-accent mb-6">{submitted}</div>
              <p className="text-ask-muted text-sm">Save this number to check your ticket status later.</p>
              <button onClick={() => { setSubmitted(null); setForm({ customer_email:'',customer_name:'',subject:'',message:'',order_id:'' }); }}
                className="btn-secondary mt-4 px-6 py-2 text-sm">New Ticket</button>
            </div>
          ) : (
            <div className="card p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-ask-muted uppercase tracking-wider mb-1 block">Name *</label>
                  <input className="input" placeholder="Your name" value={form.customer_name} onChange={set('customer_name')} />
                </div>
                <div>
                  <label className="text-xs text-ask-muted uppercase tracking-wider mb-1 block">Email *</label>
                  <input className="input" type="email" placeholder="you@example.com" value={form.customer_email} onChange={set('customer_email')} />
                </div>
              </div>
              <div>
                <label className="text-xs text-ask-muted uppercase tracking-wider mb-1 block">Order Number (optional)</label>
                <input className="input" placeholder="ORD-000001" value={form.order_id} onChange={set('order_id')} />
              </div>
              <div>
                <label className="text-xs text-ask-muted uppercase tracking-wider mb-1 block">Subject *</label>
                <input className="input" placeholder="What's your issue?" value={form.subject} onChange={set('subject')} />
              </div>
              <div>
                <label className="text-xs text-ask-muted uppercase tracking-wider mb-1 block">Message *</label>
                <textarea className="input resize-none" rows={5} placeholder="Describe your issue in detail..."
                  value={form.message} onChange={set('message')} />
              </div>
              <button onClick={handleSubmit} disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <div className="spinner w-4 h-4" /> : <Send size={16} />}
                Submit Ticket
              </button>
            </div>
          )
        )}

        {tab === 'lookup' && (
          <div>
            <div className="flex gap-2 mb-6">
              <input className="input flex-1" placeholder="TKT-000001"
                value={ticketNum} onChange={e => setTicketNum(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleLookup()} />
              <button onClick={handleLookup} disabled={loading}
                className="btn-primary px-4 flex items-center gap-2">
                {loading ? <div className="spinner w-4 h-4" /> : <Search size={18} />}
              </button>
            </div>

            {ticket && (
              <div className="card p-6 animate-fade-in">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="font-mono text-ask-accent font-bold">{ticket.ticket_number}</span>
                    <p className="font-semibold mt-1">{ticket.subject}</p>
                  </div>
                  <span className={`badge ${STATUS_COLORS[ticket.status] || 'badge-neutral'}`}>{ticket.status.replace('_', ' ')}</span>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                  {ticket.messages?.map(m => (
                    <div key={m.id} className={`p-3 rounded-xl text-sm ${m.sender_role === 'admin' ? 'bg-ask-accent/10 border border-ask-accent/20 ml-4' : 'bg-ask-border/50'}`}>
                      <p className={`text-xs font-bold mb-1 ${m.sender_role === 'admin' ? 'text-ask-accent' : 'text-ask-muted'}`}>
                        {m.sender_role === 'admin' ? 'Support Team' : 'You'}
                      </p>
                      <p>{m.message}</p>
                      <p className="text-xs text-ask-muted mt-1">{new Date(m.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {ticket.status !== 'closed' && (
                  <div className="flex gap-2">
                    <textarea className="input resize-none flex-1" rows={2} placeholder="Add a reply..."
                      value={reply} onChange={e => setReply(e.target.value)} />
                    <button onClick={handleReply} className="btn-primary px-4 self-end">
                      <Send size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
