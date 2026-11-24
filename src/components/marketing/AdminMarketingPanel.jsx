import React, { useCallback, useEffect, useState } from 'react';
import {
  Megaphone, Send, ArrowLeft, Eye, Check, X, ClipboardList, Settings2, MapPin, Plus, Wallet,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import api from '../../services/api';
import { marketingApi } from '../../services/marketingApi';
import {
  StatusBadge, glassCard, pick, fmtTzs, MK_STATUS, MK_PAYMENT, ErrorNote, LoadingNote,
} from './marketingShared';

const LOCATIONS = ['homepage', 'featured', 'category', 'banner'];
const GATEWAYS = ['manual', 'mpesa', 'tigopesa', 'airtelmoney', 'halopesa', 'bank'];

const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Which lifecycle actions are offered in each status (mirrors server ADMIN_TRANSITIONS).
const ACTIONS_BY_STATUS = {
  submitted: ['review', 'reject'],
  under_review: ['request-info', 'approve', 'set-quote', 'reject'],
  awaiting_info: ['reject'],
  approved: ['await-payment', 'waive-payment', 'schedule', 'set-quote'],
  awaiting_payment: ['confirm-payment', 'schedule'],
  scheduled: ['start', 'schedule'],
  in_progress: ['complete'],
  completed: ['report'],
};

const ACTION_LABELS = {
  review: { en: 'Start review', sw: 'Anza mapitio' },
  'request-info': { en: 'Request information', sw: 'Omba taarifa' },
  approve: { en: 'Approve', sw: 'Idhinisha' },
  reject: { en: 'Reject', sw: 'Kataa' },
  'set-quote': { en: 'Set quotation', sw: 'Weka nukuu' },
  'await-payment': { en: 'Await payment', sw: 'Subiri malipo' },
  'waive-payment': { en: 'Waive payment & schedule', sw: 'Samehe malipo na panga' },
  schedule: { en: 'Schedule campaign', sw: 'Panga kampeni' },
  'confirm-payment': { en: 'Confirm payment', sw: 'Thibitisha malipo' },
  start: { en: 'Start campaign', sw: 'Anza kampeni' },
  complete: { en: 'Mark completed', sw: 'Kamilisha' },
  report: { en: 'Record report', sw: 'Rekodi ripoti' },
  assign: { en: 'Assign team member', sw: 'Mgawie mwanachama' },
};

export default function AdminMarketingPanel() {
  const { language } = useAppContext();
  const isSw = language === 'sw';

  const [view, setView] = useState('requests');
  const [requests, setRequests] = useState(null);
  const [services, setServices] = useState(null);
  const [placements, setPlacements] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [detail, setDetail] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [pending, setPending] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [serviceEdit, setServiceEdit] = useState(null);
  const [placementForm, setPlacementForm] = useState(null);

  const loadAll = useCallback(() => {
    setError('');
    marketingApi.requests().then(res => setRequests(res.requests || [])).catch(e => setError(e.message));
    marketingApi.services(true).then(res => setServices(res.services || [])).catch(e => setError(e.message));
    marketingApi.placements(true).then(res => setPlacements(res.placements || [])).catch(e => setError(e.message));
    api.request('/api/admin/users').then(res => setAdmins((res.users || []).filter(u => u.globalRole === 'admin'))).catch(() => {});
    api.request('/api/admin/vendors').then(res => setVendors(res.vendors || [])).catch(() => {});
  }, []);
  useEffect(loadAll, [loadAll]);

  const loadDetail = useCallback((id) => {
    marketingApi.requestDetail(id).then(setDetail).catch(e => setError(e.message));
  }, []);
  const openDetail = (id) => { setDetail(null); setPending(null); setView('detail'); loadDetail(id); };

  const vendorName = (vendorId) => {
    const v = vendors.find(x => x.ownerId === vendorId || x.id === vendorId);
    return v?.name || vendorId;
  };

  const runAction = async (id, body) => {
    setBusy(true); setError('');
    try {
      await marketingApi.action(id, body);
      setPending(null);
      loadDetail(id);
      marketingApi.requests().then(res => setRequests(res.requests || [])).catch(() => {});
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !detail) return;
    setBusy(true); setError('');
    try {
      await marketingApi.message(detail.request.id, messageText.trim());
      setMessageText('');
      loadDetail(detail.request.id);
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  const reviewAsset = async (asset, status) => {
    setBusy(true); setError('');
    try {
      await marketingApi.reviewAsset(detail.request.id, asset.id, { status });
      loadDetail(detail.request.id);
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  const viewAsset = async (asset) => {
    try {
      const url = await marketingApi.assetFile(detail.request.id, asset.id);
      window.open(url, '_blank', 'noopener');
    } catch (err) { setError(err.message); }
  };

  const saveService = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    const f = serviceEdit;
    const deliverables = String(f.deliverablesText || '').split('\n').map(l => l.trim()).filter(Boolean).map(l => {
      const [en, sw] = l.split('::').map(s => s.trim());
      return { en: en || '', sw: sw || en || '' };
    });
    const body = {
      name: { en: f.nameEn, sw: f.nameSw },
      summary: { en: f.summaryEn, sw: f.summarySw },
      description: { en: f.descriptionEn, sw: f.descriptionSw },
      requirements: { en: f.requirementsEn, sw: f.requirementsSw },
      deliverables,
      priceType: f.priceType,
      priceTzs: f.priceType === 'fixed' ? Number(f.priceTzs) : null,
      active: f.active,
      sort: Number(f.sort) || 0,
    };
    try {
      if (f.id) await marketingApi.updateService(f.id, body);
      else await marketingApi.createService({ ...body, slug: f.slug });
      setServiceEdit(null);
      marketingApi.services(true).then(res => setServices(res.services || [])).catch(() => {});
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  const savePlacement = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    const f = placementForm;
    const body = {
      vendorId: f.vendorId, location: f.location, category: f.category || '',
      startsAt: f.startsAt ? new Date(f.startsAt).toISOString() : null,
      endsAt: f.endsAt ? new Date(f.endsAt).toISOString() : null,
      status: f.status,
    };
    try {
      if (f.id) await marketingApi.updatePlacement(f.id, body);
      else await marketingApi.createPlacement(body);
      setPlacementForm(null);
      marketingApi.placements(true).then(res => setPlacements(res.placements || [])).catch(() => {});
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  const tabBtn = (active) => ({
    padding: '0.5rem 1.25rem', borderRadius: '9999px', border: 'none',
    background: active ? 'var(--puck-bg)' : 'transparent',
    color: active ? '#ffffff' : 'var(--app-text-muted)',
    fontWeight: 750, fontSize: '0.84rem', cursor: 'pointer',
    boxShadow: active ? '0 4px 12px rgba(0, 102, 238, 0.35)' : 'none',
    transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
  });

  const field = (label, node) => (
    <div className="mktg-field"><label>{label}</label>{node}</div>
  );

  // ---------------------------------------------------------------- detail
  if (view === 'detail') {
    if (!detail) return <><ErrorNote error={error} language={language} /><LoadingNote language={language} /></>;
    const { request, service, events, assets, messages, payments, report } = detail;
    const payment = MK_PAYMENT[request.paymentStatus] || MK_PAYMENT.awaiting_quote;
    const actions = ACTIONS_BY_STATUS[request.status] || [];
    const assignee = admins.find(a => a.id === request.assigneeId);

    const startPending = (action) => setPending({
      action, note: '', priceTzs: request.quotedPriceTzs || '', txnRef: '', gateway: 'manual',
      campaignStart: request.campaignStart || request.preferredStart || '',
      campaignEnd: request.campaignEnd || request.preferredEnd || '',
      assigneeId: request.assigneeId || admins[0]?.id || '',
      summaryEn: report?.summary?.en || '', summarySw: report?.summary?.sw || '',
      metricsText: report?.metrics ? Object.entries(report.metrics).map(([k, v]) => `${k}=${v}`).join('\n') : '',
      published: report?.published || false,
    });

    const submitPending = (e) => {
      e.preventDefault();
      const p = pending;
      const body = { action: p.action };
      if (['request-info', 'reject'].includes(p.action)) body.note = p.note;
      if (p.action === 'approve' && p.priceTzs) body.priceTzs = Number(p.priceTzs);
      if (p.action === 'set-quote') { body.priceTzs = Number(p.priceTzs); body.note = p.note; }
      if (['waive-payment', 'schedule'].includes(p.action)) { body.campaignStart = p.campaignStart; body.campaignEnd = p.campaignEnd; }
      if (p.action === 'confirm-payment') { body.txnRef = p.txnRef; body.gateway = p.gateway; }
      if (p.action === 'assign') body.assigneeId = p.assigneeId;
      if (p.action === 'report') {
        body.summary = { en: p.summaryEn, sw: p.summarySw };
        body.metrics = {};
        String(p.metricsText || '').split('\n').map(l => l.trim()).filter(Boolean).forEach(l => {
          const idx = l.indexOf('=');
          if (idx > 0) body.metrics[l.slice(0, idx).trim()] = l.slice(idx + 1).trim();
        });
        body.published = p.published;
      }
      runAction(request.id, body);
    };

    return (
      <div>
        <button type="button" className="mktg-btn mktg-btn--ghost" style={{ marginBottom: '1rem' }}
          onClick={() => { setView('requests'); setDetail(null); }}>
          <ArrowLeft size={15} /> {isSw ? 'Rudi kwenye foleni' : 'Back to queue'}
        </button>
        <ErrorNote error={error} language={language} />

        <div className="glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 850, color: 'var(--app-text-primary, #0F172A)', marginBottom: '0.3rem' }}>
                {pick(service?.name, language) || request.serviceId}
              </h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--app-text-muted)' }}>
                {vendorName(request.vendorId)} • <span style={{ fontFamily: 'monospace' }}>{request.id}</span>
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <StatusBadge status={request.status} language={language} />
              <span className="mktg-badge" style={{ color: payment.tone, borderColor: `${payment.tone}55`, background: `${payment.tone}14` }}>
                <Wallet size={12} /> {isSw ? payment.sw : payment.en}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--app-text-primary, #0F172A)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
            <strong>{isSw ? 'Malengo:' : 'Objectives:'}</strong> {request.objectives}
          </p>
          {request.campaignDetails?.audience && <p style={{ fontSize: '0.82rem', color: 'var(--app-text-muted)' }}><strong>{isSw ? 'Wanalengwa:' : 'Audience:'}</strong> {request.campaignDetails.audience}</p>}
          {request.campaignDetails?.keyMessage && <p style={{ fontSize: '0.82rem', color: 'var(--app-text-muted)' }}><strong>{isSw ? 'Ujumbe:' : 'Message:'}</strong> {request.campaignDetails.keyMessage}</p>}
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--app-text-muted)', marginTop: '0.5rem' }}>
            {request.quotedPriceTzs != null && <span>{isSw ? 'Nukuu:' : 'Quote:'} <strong>{fmtTzs(request.quotedPriceTzs)}</strong></span>}
            {request.agreedPriceTzs != null && <span>{isSw ? 'Iliyokubaliwa:' : 'Agreed:'} <strong style={{ color: '#059669' }}>{fmtTzs(request.agreedPriceTzs)}</strong></span>}
            {request.preferredStart && <span>{isSw ? 'Alizopendelea:' : 'Preferred:'} {request.preferredStart}{request.preferredEnd ? ` → ${request.preferredEnd}` : ''}</span>}
            {request.campaignStart && <span>{isSw ? 'Kampeni:' : 'Campaign:'} {request.campaignStart} → {request.campaignEnd || ''}</span>}
            <span>{isSw ? 'Amepewa:' : 'Assignee:'} <strong>{assignee ? (assignee.name || assignee.email) : (isSw ? 'Hajapewa' : 'Unassigned')}</strong></span>
          </div>

          {/* Action bar */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {actions.map(a => (
              <button key={a} type="button"
                className={`mktg-btn${a === 'reject' ? ' mktg-btn--danger' : ['review', 'set-quote', 'schedule'].includes(a) ? ' mktg-btn--ghost' : ''}`}
                disabled={busy} onClick={() => startPending(a)}>
                {isSw ? ACTION_LABELS[a].sw : ACTION_LABELS[a].en}
              </button>
            ))}
            {!['completed', 'rejected', 'cancelled'].includes(request.status) && (
              <button type="button" className="mktg-btn mktg-btn--ghost" disabled={busy} onClick={() => startPending('assign')}>
                {isSw ? ACTION_LABELS.assign.sw : ACTION_LABELS.assign.en}
              </button>
            )}
          </div>

          {pending && (
            <form onSubmit={submitPending} style={{ marginTop: '1rem', padding: '1rem', borderRadius: '16px', background: 'var(--lens-bg, rgba(255,255,255,0.5))', border: '1px solid var(--slab-border, rgba(255,255,255,0.35))', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <strong style={{ fontSize: '0.88rem', color: 'var(--app-text-primary, #0F172A)' }}>
                {isSw ? ACTION_LABELS[pending.action].sw : ACTION_LABELS[pending.action].en}
              </strong>
              {['request-info', 'reject'].includes(pending.action) && field(
                pending.action === 'reject' ? (isSw ? 'Sababu ya kukataa *' : 'Rejection reason *') : (isSw ? 'Taarifa unayohitaji kutoka kwa muuzaji *' : 'Information needed from the vendor *'),
                <textarea rows={2} required value={pending.note} onChange={e => setPending({ ...pending, note: e.target.value })} />
              )}
              {pending.action === 'approve' && field(isSw ? 'Nukuu ya bei (hiari, TSh)' : 'Quotation (optional, TSh)',
                <input type="number" min="1" value={pending.priceTzs} onChange={e => setPending({ ...pending, priceTzs: e.target.value })} />)}
              {pending.action === 'set-quote' && (
                <>
                  {field(isSw ? 'Nukuu ya bei (TSh) *' : 'Quotation (TSh) *',
                    <input type="number" min="1" required value={pending.priceTzs} onChange={e => setPending({ ...pending, priceTzs: e.target.value })} />)}
                  {field(isSw ? 'Maelezo ya nukuu' : 'Quote note',
                    <input type="text" value={pending.note} onChange={e => setPending({ ...pending, note: e.target.value })} />)}
                </>
              )}
              {['waive-payment', 'schedule'].includes(pending.action) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.7rem' }}>
                  {field(isSw ? 'Kuanza kwa kampeni *' : 'Campaign start *',
                    <input type="date" required value={pending.campaignStart} onChange={e => setPending({ ...pending, campaignStart: e.target.value })} />)}
                  {field(isSw ? 'Kumaliza kwa kampeni *' : 'Campaign end *',
                    <input type="date" required min={pending.campaignStart || undefined} value={pending.campaignEnd} onChange={e => setPending({ ...pending, campaignEnd: e.target.value })} />)}
                </div>
              )}
              {pending.action === 'confirm-payment' && (
                <>
                  <p style={{ fontSize: '0.78rem', color: 'var(--app-text-muted)', lineHeight: 1.55 }}>
                    {isSw
                      ? `Thibitisha tu baada ya kuthibitisha kupokea TSh ${(request.agreedPriceTzs || 0).toLocaleString()} kwenye akaunti rasmi za MY DAY. Kumbukumbu ya muamala huhifadhiwa kwenye rekodi ya malipo.`
                      : `Only confirm after verifying TSh ${(request.agreedPriceTzs || 0).toLocaleString()} was received in MY DAY’s official accounts. The transaction reference is stored on the payment record.`}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.7rem' }}>
                    {field(isSw ? 'Kumbukumbu ya muamala *' : 'Transaction reference *',
                      <input type="text" required value={pending.txnRef} onChange={e => setPending({ ...pending, txnRef: e.target.value })} />)}
                    {field(isSw ? 'Njia ya malipo' : 'Payment channel',
                      <select value={pending.gateway} onChange={e => setPending({ ...pending, gateway: e.target.value })}>
                        {GATEWAYS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>)}
                  </div>
                </>
              )}
              {pending.action === 'assign' && field(isSw ? 'Mwanachama wa timu ya MY DAY *' : 'MY DAY team member *',
                <select required value={pending.assigneeId} onChange={e => setPending({ ...pending, assigneeId: e.target.value })}>
                  {admins.map(a => <option key={a.id} value={a.id}>{a.name || a.email}</option>)}
                </select>)}
              {pending.action === 'report' && (
                <>
                  {field(isSw ? 'Muhtasari wa ripoti (Kiingereza)' : 'Report summary (English)',
                    <textarea rows={2} value={pending.summaryEn} onChange={e => setPending({ ...pending, summaryEn: e.target.value })} />)}
                  {field(isSw ? 'Muhtasari wa ripoti (Kiswahili)' : 'Report summary (Kiswahili)',
                    <textarea rows={2} value={pending.summarySw} onChange={e => setPending({ ...pending, summarySw: e.target.value })} />)}
                  {field(isSw ? 'Takwimu halisi (mfano: reach=12000, mstari mmoja kwa kipimo)' : 'Real metrics (e.g. reach=12000, one per line)',
                    <textarea rows={3} value={pending.metricsText} onChange={e => setPending({ ...pending, metricsText: e.target.value })} placeholder={'reach=12000\nengagement=850\nleads=24'} />)}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--app-text-primary, #0F172A)' }}>
                    <input type="checkbox" checked={pending.published} onChange={e => setPending({ ...pending, published: e.target.checked })} />
                    {isSw ? 'Chapisha ripoti kwa muuzaji' : 'Publish report to the vendor'}
                  </label>
                </>
              )}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="mktg-btn" disabled={busy}>{isSw ? 'Tekeleza' : 'Execute'}</button>
                <button type="button" className="mktg-btn mktg-btn--ghost" onClick={() => setPending(null)}>{isSw ? 'Ghairi' : 'Cancel'}</button>
              </div>
            </form>
          )}
        </div>

        <div className="provider-dashboard-grid">
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Assets review */}
            <div className="glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--app-text-primary, #0F172A)', marginBottom: '0.75rem' }}>
                {isSw ? 'Mapitio ya picha na video' : 'Image & video review'}
              </h3>
              {assets.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--app-text-muted)' }}>{isSw ? 'Muuzaji hajapakia faili bado.' : 'The vendor has not uploaded files yet.'}</p>
              ) : assets.map(a => (
                <div key={a.id} className="mktg-row mktg-row--static" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.83rem', color: 'var(--app-text-primary, #0F172A)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {a.kind === 'video' ? '🎬' : '🖼️'} {a.fileName}
                  </span>
                  <span style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span className="mktg-badge" style={{
                      color: a.status === 'approved' ? '#059669' : a.status === 'rejected' ? '#dc2626' : '#b45309',
                      borderColor: a.status === 'approved' ? '#05966955' : a.status === 'rejected' ? '#dc262655' : '#b4530955',
                    }}>{a.status}</span>
                    <button type="button" className="mktg-btn mktg-btn--ghost" style={{ padding: '0.3rem 0.6rem' }} onClick={() => viewAsset(a)}><Eye size={13} /></button>
                    {a.status === 'pending' && (
                      <>
                        <button type="button" className="mktg-btn" style={{ padding: '0.3rem 0.6rem' }} disabled={busy} onClick={() => reviewAsset(a, 'approved')}><Check size={13} /></button>
                        <button type="button" className="mktg-btn mktg-btn--danger" style={{ padding: '0.3rem 0.6rem' }} disabled={busy} onClick={() => reviewAsset(a, 'rejected')}><X size={13} /></button>
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Messages */}
            <div className="glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--app-text-primary, #0F172A)', marginBottom: '0.75rem' }}>
                {isSw ? 'Mawasiliano na muuzaji' : 'Vendor communication'}
              </h3>
              <div className="mktg-messages">
                {messages.length === 0 && <p style={{ fontSize: '0.82rem', color: 'var(--app-text-muted)' }}>{isSw ? 'Bado hakuna ujumbe.' : 'No messages yet.'}</p>}
                {messages.map(m => (
                  <div key={m.id} className={`mktg-message${m.senderRole === 'admin' ? ' mktg-message--admin' : ''}`}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 750, color: 'var(--app-text-muted)', marginBottom: '0.2rem' }}>
                      {m.senderRole === 'admin' ? (isSw ? 'Timu ya MY DAY' : 'MY DAY team') : (isSw ? 'Muuzaji' : 'Vendor')} • {new Date(m.createdAt).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.85rem', lineHeight: 1.55 }}>{m.body}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <input type="text" value={messageText} onChange={e => setMessageText(e.target.value)} maxLength={2000}
                  placeholder={isSw ? 'Jibu muuzaji…' : 'Reply to the vendor…'} style={{ flex: 1 }} />
                <button type="submit" className="mktg-btn" disabled={busy || !messageText.trim()}><Send size={14} /></button>
              </form>
            </div>

            {/* Payments */}
            {payments.length > 0 && (
              <div className="glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--app-text-primary, #0F172A)', marginBottom: '0.75rem' }}>
                  {isSw ? 'Malipo' : 'Payments'}
                </h3>
                {payments.map(p => (
                  <div key={p.id} className="mktg-row mktg-row--static" style={{ justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--app-text-muted)' }}>{p.txnRef} • {p.gateway}</span>
                    <strong style={{ fontSize: '0.88rem', color: '#059669' }}>{fmtTzs(p.amount)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div style={{ minWidth: 0 }}>
            <div className="glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--app-text-primary, #0F172A)', marginBottom: '0.75rem' }}>
                {isSw ? 'Historia kamili (ukaguzi)' : 'Full audit history'}
              </h3>
              <ul className="mktg-timeline">
                {events.map(ev => (
                  <li key={ev.id}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 750, color: 'var(--app-text-primary, #0F172A)' }}>
                      {ev.toStatus ? <StatusBadge status={ev.toStatus} language={language} /> : (ev.kind === 'quote' ? (isSw ? 'Nukuu' : 'Quote') : ev.kind === 'payment' ? (isSw ? 'Malipo' : 'Payment') : ev.kind === 'assignment' ? (isSw ? 'Mgawo' : 'Assignment') : ev.kind === 'asset' ? (isSw ? 'Faili' : 'Asset') : ev.kind === 'report' ? (isSw ? 'Ripoti' : 'Report') : ev.kind)}
                    </div>
                    {ev.data?.note && <div style={{ fontSize: '0.78rem', marginTop: '0.15rem' }}>{ev.data.note}</div>}
                    <div style={{ fontSize: '0.7rem', marginTop: '0.15rem' }}>
                      {new Date(ev.createdAt).toLocaleString()}{ev.data?.actorRole ? ` • ${ev.data.actorRole}` : ''}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------- tabs
  return (
    <div>
      <div className="glass-lens" style={{ display: 'inline-flex', gap: '0.4rem', background: 'var(--lens-bg)', padding: '0.3rem', borderRadius: '9999px', border: 'var(--lens-border)', marginBottom: '1.5rem', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)', flexWrap: 'wrap' }}>
        <button type="button" style={tabBtn(view === 'requests')} onClick={() => setView('requests')}>
          <ClipboardList size={15} /> {isSw ? `Maombi (${requests?.length ?? 0})` : `Requests (${requests?.length ?? 0})`}
        </button>
        <button type="button" style={tabBtn(view === 'services')} onClick={() => setView('services')}>
          <Settings2 size={15} /> {isSw ? 'Huduma na bei' : 'Services & pricing'}
        </button>
        <button type="button" style={tabBtn(view === 'placements')} onClick={() => setView('placements')}>
          <MapPin size={15} /> {isSw ? 'Nafasi za udhamini' : 'Sponsored placements'}
        </button>
      </div>

      <ErrorNote error={error} language={language} onRetry={loadAll} />

      {view === 'requests' && (
        !requests ? <LoadingNote language={language} /> : (
          <div>
            <div className="mktg-field" style={{ maxWidth: 260, marginBottom: '1rem' }}>
              <label>{isSw ? 'Chuja kwa hali' : 'Filter by status'}</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">{isSw ? 'Zote' : 'All'}</option>
                {Object.keys(MK_STATUS).map(s => <option key={s} value={s}>{isSw ? MK_STATUS[s].sw : MK_STATUS[s].en}</option>)}
              </select>
            </div>
            {requests.filter(r => !statusFilter || r.status === statusFilter).length === 0 ? (
              <p style={{ fontSize: '0.88rem', color: 'var(--app-text-muted)' }}>{isSw ? 'Hakuna maombi ya masoko kwa sasa.' : 'No marketing requests right now.'}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {requests.filter(r => !statusFilter || r.status === statusFilter).map(r => (
                  <button key={r.id} type="button" className="mktg-row glass-slab glass-frosted-optical"
                    style={{ ...glassCard, padding: '1rem 1.25rem', justifyContent: 'space-between', textAlign: 'left', width: '100%' }}
                    onClick={() => openDetail(r.id)}>
                    <span style={{ minWidth: 0 }}>
                      <strong style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, color: 'var(--app-text-primary, #0F172A)' }}>
                        {pick(r.service?.name, language) || r.serviceId}
                      </strong>
                      <span style={{ fontSize: '0.76rem', color: 'var(--app-text-muted)' }}>
                        {vendorName(r.vendorId)} • <span style={{ fontFamily: 'monospace' }}>{r.id}</span> • {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </span>
                    <span style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {(r.agreedPriceTzs ?? r.quotedPriceTzs) != null && <strong style={{ fontSize: '0.85rem', color: '#059669' }}>{fmtTzs(r.agreedPriceTzs ?? r.quotedPriceTzs)}</strong>}
                      <StatusBadge status={r.status} language={language} />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      )}

      {view === 'services' && (
        !services ? <LoadingNote language={language} /> : (
          <div>
            <button type="button" className="mktg-btn" style={{ marginBottom: '1rem' }}
              onClick={() => setServiceEdit({
                id: null, slug: '', nameEn: '', nameSw: '', summaryEn: '', summarySw: '',
                descriptionEn: '', descriptionSw: '', requirementsEn: '', requirementsSw: '',
                deliverablesText: '', priceType: 'quote', priceTzs: '', active: true, sort: services.length + 1,
              })}>
              <Plus size={15} /> {isSw ? 'Ongeza huduma' : 'Add service'}
            </button>

            {serviceEdit && (
              <form onSubmit={saveService} className="glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--app-text-primary, #0F172A)' }}>
                  {serviceEdit.id ? (isSw ? 'Hariri huduma' : 'Edit service') : (isSw ? 'Huduma mpya' : 'New service')}
                </strong>
                {!serviceEdit.id && field('Slug *', <input type="text" required value={serviceEdit.slug} onChange={e => setServiceEdit({ ...serviceEdit, slug: e.target.value })} />)}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.7rem' }}>
                  {field(isSw ? 'Jina (Kiingereza) *' : 'Name (English) *', <input type="text" required value={serviceEdit.nameEn} onChange={e => setServiceEdit({ ...serviceEdit, nameEn: e.target.value })} />)}
                  {field(isSw ? 'Jina (Kiswahili) *' : 'Name (Kiswahili) *', <input type="text" required value={serviceEdit.nameSw} onChange={e => setServiceEdit({ ...serviceEdit, nameSw: e.target.value })} />)}
                  {field(isSw ? 'Muhtasari (Kiingereza)' : 'Summary (English)', <input type="text" value={serviceEdit.summaryEn} onChange={e => setServiceEdit({ ...serviceEdit, summaryEn: e.target.value })} />)}
                  {field(isSw ? 'Muhtasari (Kiswahili)' : 'Summary (Kiswahili)', <input type="text" value={serviceEdit.summarySw} onChange={e => setServiceEdit({ ...serviceEdit, summarySw: e.target.value })} />)}
                </div>
                {field(isSw ? 'Maelezo (Kiingereza)' : 'Description (English)', <textarea rows={2} value={serviceEdit.descriptionEn} onChange={e => setServiceEdit({ ...serviceEdit, descriptionEn: e.target.value })} />)}
                {field(isSw ? 'Maelezo (Kiswahili)' : 'Description (Kiswahili)', <textarea rows={2} value={serviceEdit.descriptionSw} onChange={e => setServiceEdit({ ...serviceEdit, descriptionSw: e.target.value })} />)}
                {field(isSw ? 'Mahitaji (Kiingereza)' : 'Requirements (English)', <textarea rows={2} value={serviceEdit.requirementsEn} onChange={e => setServiceEdit({ ...serviceEdit, requirementsEn: e.target.value })} />)}
                {field(isSw ? 'Mahitaji (Kiswahili)' : 'Requirements (Kiswahili)', <textarea rows={2} value={serviceEdit.requirementsSw} onChange={e => setServiceEdit({ ...serviceEdit, requirementsSw: e.target.value })} />)}
                {field(isSw ? 'Yanayotolewa (mstari mmoja: English :: Kiswahili)' : 'Deliverables (one per line: English :: Kiswahili)',
                  <textarea rows={4} value={serviceEdit.deliverablesText} onChange={e => setServiceEdit({ ...serviceEdit, deliverablesText: e.target.value })} />)}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.7rem' }}>
                  {field(isSw ? 'Aina ya bei' : 'Price type',
                    <select value={serviceEdit.priceType} onChange={e => setServiceEdit({ ...serviceEdit, priceType: e.target.value })}>
                      <option value="quote">{isSw ? 'Nukuu ya bei' : 'Quotation'}</option>
                      <option value="fixed">{isSw ? 'Bei maalum' : 'Fixed price'}</option>
                    </select>)}
                  {serviceEdit.priceType === 'fixed' && field(isSw ? 'Bei (TSh) *' : 'Price (TSh) *',
                    <input type="number" min="1" required value={serviceEdit.priceTzs} onChange={e => setServiceEdit({ ...serviceEdit, priceTzs: e.target.value })} />)}
                  {field(isSw ? 'Mpangilio' : 'Sort order', <input type="number" value={serviceEdit.sort} onChange={e => setServiceEdit({ ...serviceEdit, sort: e.target.value })} />)}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--app-text-primary, #0F172A)' }}>
                  <input type="checkbox" checked={serviceEdit.active} onChange={e => setServiceEdit({ ...serviceEdit, active: e.target.checked })} />
                  {isSw ? 'Huduma inapatikana kwa wauzaji' : 'Service visible to vendors'}
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="mktg-btn" disabled={busy}>{isSw ? 'Hifadhi' : 'Save'}</button>
                  <button type="button" className="mktg-btn mktg-btn--ghost" onClick={() => setServiceEdit(null)}>{isSw ? 'Ghairi' : 'Cancel'}</button>
                </div>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {services.map(s => (
                <div key={s.id} className="mktg-row mktg-row--static glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '1rem 1.25rem', justifyContent: 'space-between' }}>
                  <span style={{ minWidth: 0 }}>
                    <strong style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, color: 'var(--app-text-primary, #0F172A)' }}>{pick(s.name, language)}</strong>
                    <span style={{ fontSize: '0.76rem', color: 'var(--app-text-muted)' }}>
                      {s.priceType === 'fixed' && s.priceTzs != null ? fmtTzs(s.priceTzs) : (isSw ? 'Nukuu ya bei' : 'Quotation')} • {s.slug}
                    </span>
                  </span>
                  <span style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="mktg-badge" style={{ color: s.active ? '#059669' : '#64748B', borderColor: s.active ? '#05966955' : '#64748B55' }}>
                      {s.active ? (isSw ? 'Inapatikana' : 'Active') : (isSw ? 'Imezimwa' : 'Inactive')}
                    </span>
                    <button type="button" className="mktg-btn mktg-btn--ghost" style={{ padding: '0.35rem 0.8rem' }}
                      onClick={() => marketingApi.updateService(s.id, { active: !s.active }).then(() => marketingApi.services(true).then(res => setServices(res.services || []))).catch(e => setError(e.message))}>
                      {s.active ? (isSw ? 'Zima' : 'Deactivate') : (isSw ? 'Washa' : 'Activate')}
                    </button>
                    <button type="button" className="mktg-btn" style={{ padding: '0.35rem 0.8rem' }}
                      onClick={() => setServiceEdit({
                        id: s.id, slug: s.slug, nameEn: s.name?.en || '', nameSw: s.name?.sw || '',
                        summaryEn: s.summary?.en || '', summarySw: s.summary?.sw || '',
                        descriptionEn: s.description?.en || '', descriptionSw: s.description?.sw || '',
                        requirementsEn: s.requirements?.en || '', requirementsSw: s.requirements?.sw || '',
                        deliverablesText: (s.deliverables || []).map(d => `${d.en} :: ${d.sw}`).join('\n'),
                        priceType: s.priceType, priceTzs: s.priceTzs ?? '', active: s.active, sort: s.sort,
                      })}>
                      {isSw ? 'Hariri' : 'Edit'}
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {view === 'placements' && (
        !placements ? <LoadingNote language={language} /> : (
          <div>
            <button type="button" className="mktg-btn" style={{ marginBottom: '1rem' }}
              onClick={() => setPlacementForm({ id: null, vendorId: vendors[0]?.id || '', location: 'homepage', category: '', startsAt: '', endsAt: '', status: 'scheduled' })}>
              <Plus size={15} /> {isSw ? 'Nafasi mpya ya udhamini' : 'New sponsored placement'}
            </button>

            {placementForm && (
              <form onSubmit={savePlacement} className="glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--app-text-primary, #0F172A)' }}>
                  {placementForm.id ? (isSw ? 'Hariri nafasi' : 'Edit placement') : (isSw ? 'Nafasi mpya' : 'New placement')}
                </strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.7rem' }}>
                  {field(isSw ? 'Muuzaji *' : 'Vendor *',
                    <select required disabled={Boolean(placementForm.id)} value={placementForm.vendorId} onChange={e => setPlacementForm({ ...placementForm, vendorId: e.target.value })}>
                      {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>)}
                  {field(isSw ? 'Mahali *' : 'Location *',
                    <select value={placementForm.location} onChange={e => setPlacementForm({ ...placementForm, location: e.target.value })}>
                      {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>)}
                  {field(isSw ? 'Kategoria (hiari)' : 'Category (optional)',
                    <input type="text" value={placementForm.category} onChange={e => setPlacementForm({ ...placementForm, category: e.target.value })} />)}
                  {field(isSw ? 'Hali' : 'Status',
                    <select value={placementForm.status} onChange={e => setPlacementForm({ ...placementForm, status: e.target.value })}>
                      <option value="scheduled">scheduled</option>
                      <option value="active">active</option>
                      <option value="cancelled">cancelled</option>
                    </select>)}
                  {field(isSw ? 'Huanza *' : 'Starts *',
                    <input type="datetime-local" required value={placementForm.startsAt} onChange={e => setPlacementForm({ ...placementForm, startsAt: e.target.value })} />)}
                  {field(isSw ? 'Huisha *' : 'Ends *',
                    <input type="datetime-local" required value={placementForm.endsAt} onChange={e => setPlacementForm({ ...placementForm, endsAt: e.target.value })} />)}
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--app-text-muted)', lineHeight: 1.55 }}>
                  {isSw
                    ? 'Nafasi huonekana tu ndani ya dirisha la muda na huisha kiotomatiki. Huwezi kubadilisha mpangilio wa asili wa wauzaji.'
                    : 'Placements appear only inside their time window and expire automatically. Organic vendor ranking is never altered.'}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="mktg-btn" disabled={busy}>{isSw ? 'Hifadhi' : 'Save'}</button>
                  <button type="button" className="mktg-btn mktg-btn--ghost" onClick={() => setPlacementForm(null)}>{isSw ? 'Ghairi' : 'Cancel'}</button>
                </div>
              </form>
            )}

            {placements.length === 0 ? (
              <p style={{ fontSize: '0.88rem', color: 'var(--app-text-muted)' }}>{isSw ? 'Hakuna nafasi za udhamini bado.' : 'No sponsored placements yet.'}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {placements.map(p => {
                  const now = Date.now();
                  const live = p.status === 'active' && new Date(p.startsAt).getTime() <= now && new Date(p.endsAt).getTime() >= now;
                  const vendor = vendors.find(v => v.id === p.vendorId);
                  return (
                    <div key={p.id} className="mktg-row mktg-row--static glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '1rem 1.25rem', justifyContent: 'space-between' }}>
                      <span style={{ minWidth: 0 }}>
                        <strong style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, color: 'var(--app-text-primary, #0F172A)' }}>
                          {vendor?.name || p.vendorId} <span className="mktg-sponsored-label" style={{ marginLeft: '0.4rem' }}>{isSw ? 'Imedhaminiwa' : 'Sponsored'}</span>
                        </strong>
                        <span style={{ fontSize: '0.76rem', color: 'var(--app-text-muted)' }}>
                          {p.location}{p.category ? ` • ${p.category}` : ''} • {new Date(p.startsAt).toLocaleString()} → {new Date(p.endsAt).toLocaleString()}
                        </span>
                      </span>
                      <span style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className="mktg-badge" style={{ color: live ? '#059669' : p.status === 'cancelled' ? '#dc2626' : '#b45309', borderColor: live ? '#05966955' : p.status === 'cancelled' ? '#dc262655' : '#b4530955' }}>
                          {live ? (isSw ? 'Hewani sasa' : 'Live now') : p.status}
                        </span>
                        <button type="button" className="mktg-btn mktg-btn--ghost" style={{ padding: '0.35rem 0.8rem' }}
                          onClick={() => setPlacementForm({
                            id: p.id, vendorId: p.vendorId, location: p.location, category: p.category || '',
                            startsAt: toLocalInput(p.startsAt), endsAt: toLocalInput(p.endsAt), status: p.status,
                          })}>
                          {isSw ? 'Hariri' : 'Edit'}
                        </button>
                        <button type="button" className="mktg-btn mktg-btn--danger" style={{ padding: '0.35rem 0.8rem' }}
                          onClick={() => {
                            if (!window.confirm(isSw ? 'Futa nafasi hii ya udhamini?' : 'Delete this sponsored placement?')) return;
                            marketingApi.deletePlacement(p.id)
                              .then(() => marketingApi.placements(true).then(res => setPlacements(res.placements || [])))
                              .catch(e => setError(e.message));
                          }}>
                          {isSw ? 'Futa' : 'Delete'}
                        </button>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}