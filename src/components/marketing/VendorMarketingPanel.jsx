import React, { useCallback, useEffect, useState } from 'react';
import { Megaphone, Send, Upload, ArrowLeft, Eye, XCircle, Wallet } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { marketingApi } from '../../services/marketingApi';
import {
  ServiceCard, StatusBadge, glassCard, pick, fmtTzs, MK_PAYMENT, ErrorNote, LoadingNote,
} from './marketingShared';

const CANCELABLE = ['submitted', 'under_review', 'awaiting_info', 'approved', 'awaiting_payment', 'scheduled'];
const UPLOAD_CLOSED = ['completed', 'rejected', 'cancelled'];
const IMAGE_MIMES = ['image/png', 'image/jpeg', 'image/webp'];
const VIDEO_MIMES = ['video/mp4', 'video/quicktime'];

function readFileBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(new Error('Could not read the selected file'));
    reader.readAsDataURL(file);
  });
}

export default function VendorMarketingPanel() {
  const { language } = useAppContext();
  const isSw = language === 'sw';

  const [view, setView] = useState('explore');
  const [services, setServices] = useState(null);
  const [requests, setRequests] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [infoNote, setInfoNote] = useState('');
  const [uploading, setUploading] = useState(false);

  const loadServices = useCallback(() => {
    marketingApi.services().then(res => setServices(res.services || [])).catch(e => setError(e.message));
  }, []);
  const loadRequests = useCallback(() => {
    marketingApi.requests().then(res => setRequests(res.requests || [])).catch(e => setError(e.message));
  }, []);
  const loadDetail = useCallback((id) => {
    setError('');
    marketingApi.requestDetail(id).then(setDetail).catch(e => setError(e.message));
  }, []);

  useEffect(() => { loadServices(); loadRequests(); }, [loadServices, loadRequests]);

  const openDetail = (id) => { setDetail(null); setView('detail'); loadDetail(id); };

  const startRequest = (service) => {
    setForm({ serviceId: service.id, objectives: '', audience: '', keyMessage: '', preferredStart: '', preferredEnd: '' });
    setView('form');
    setError('');
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const res = await marketingApi.createRequest({
        serviceId: form.serviceId,
        objectives: form.objectives,
        campaignDetails: { audience: form.audience, keyMessage: form.keyMessage },
        preferredStart: form.preferredStart || null,
        preferredEnd: form.preferredEnd || null,
      });
      setForm(null);
      loadRequests();
      openDetail(res.request.id);
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  const doAction = async (id, body, after) => {
    setBusy(true); setError('');
    try {
      await marketingApi.action(id, body);
      loadDetail(id);
      loadRequests();
      if (after) after();
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

  const uploadFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !detail) return;
    const kind = IMAGE_MIMES.includes(file.type) ? 'image' : VIDEO_MIMES.includes(file.type) ? 'video' : null;
    if (!kind) { setError(isSw ? 'Kubaliwa: picha PNG/JPEG/WebP au video MP4/MOV pekee.' : 'Only PNG/JPEG/WebP images or MP4/MOV videos are accepted.'); return; }
    const cap = kind === 'image' ? 8 * 1024 * 1024 : 25 * 1024 * 1024;
    if (file.size > cap) { setError(isSw ? `Faili linazidi kikomo cha ${Math.round(cap / 1024 / 1024)}MB.` : `File exceeds the ${Math.round(cap / 1024 / 1024)}MB limit.`); return; }
    setUploading(true); setError('');
    try {
      const dataBase64 = await readFileBase64(file);
      await marketingApi.uploadAsset(detail.request.id, {
        fileName: file.name, mime: file.type, sizeBytes: file.size, dataBase64,
      });
      loadDetail(detail.request.id);
    } catch (err) { setError(err.message); }
    setUploading(false);
  };

  const viewAsset = async (asset) => {
    setError('');
    try {
      const url = await marketingApi.assetFile(detail.request.id, asset.id);
      window.open(url, '_blank', 'noopener');
    } catch (err) { setError(err.message); }
  };

  const tabBtn = (active) => ({
    padding: '0.5rem 1.25rem', borderRadius: '9999px', border: 'none',
    background: active ? 'var(--puck-bg)' : 'transparent',
    color: active ? '#ffffff' : 'var(--app-text-muted)',
    fontWeight: 750, fontSize: '0.84rem', cursor: 'pointer',
    boxShadow: active ? '0 4px 12px rgba(0, 102, 238, 0.35)' : 'none',
    transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
  });

  // ---------------------------------------------------------------- detail
  if (view === 'detail') {
    if (!detail) return <><ErrorNote error={error} language={language} onRetry={() => loadDetail(requests?.[0]?.id)} /><LoadingNote language={language} /></>;
    const { request, service, events, assets, messages, payments, report } = detail;
    const payment = MK_PAYMENT[request.paymentStatus] || MK_PAYMENT.awaiting_quote;
    const price = request.agreedPriceTzs ?? request.quotedPriceTzs ?? (service?.priceType === 'fixed' ? service.priceTzs : null);

    return (
      <div>
        <button type="button" className="mktg-btn mktg-btn--ghost" style={{ marginBottom: '1rem' }}
          onClick={() => { setView('requests'); setDetail(null); }}>
          <ArrowLeft size={15} /> {isSw ? 'Rudi kwenye maombi yangu' : 'Back to my requests'}
        </button>
        <ErrorNote error={error} language={language} />

        <div className="glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 850, color: 'var(--app-text-primary, #0F172A)', marginBottom: '0.35rem' }}>
                {pick(service?.name, language) || request.serviceId}
              </h2>
              <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--app-text-muted)' }}>{request.id}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <StatusBadge status={request.status} language={language} />
              <span className="mktg-badge" style={{ color: payment.tone, borderColor: `${payment.tone}55`, background: `${payment.tone}14` }}>
                <Wallet size={12} /> {isSw ? payment.sw : payment.en}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--app-text-primary, #0F172A)', lineHeight: 1.6, marginBottom: '0.6rem' }}>
            <strong>{isSw ? 'Malengo:' : 'Objectives:'}</strong> {request.objectives}
          </p>
          {request.campaignDetails?.audience && (
            <p style={{ fontSize: '0.84rem', color: 'var(--app-text-muted)', marginBottom: '0.35rem' }}>
              <strong>{isSw ? 'Wanalengwa:' : 'Target audience:'}</strong> {request.campaignDetails.audience}
            </p>
          )}
          {request.campaignDetails?.keyMessage && (
            <p style={{ fontSize: '0.84rem', color: 'var(--app-text-muted)', marginBottom: '0.35rem' }}>
              <strong>{isSw ? 'Ujumbe mkuu:' : 'Key message:'}</strong> {request.campaignDetails.keyMessage}
            </p>
          )}
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--app-text-muted)', marginTop: '0.5rem' }}>
            {price != null && <span><strong style={{ color: '#059669' }}>{fmtTzs(price)}</strong> {request.agreedPriceTzs != null ? (isSw ? '(iliyokubaliwa)' : '(agreed)') : (isSw ? '(nukuu)' : '(quote)')}</span>}
            {request.preferredStart && <span>{isSw ? 'Tarehe ulizopendelea:' : 'Preferred:'} {request.preferredStart}{request.preferredEnd ? ` → ${request.preferredEnd}` : ''}</span>}
            {request.campaignStart && <span>{isSw ? 'Kampeni:' : 'Campaign:'} {request.campaignStart}{request.campaignEnd ? ` → ${request.campaignEnd}` : ''}</span>}
          </div>

          {request.status === 'awaiting_payment' && (
            <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <strong style={{ fontSize: '0.88rem', color: '#b45309' }}>
                {isSw ? 'Malipo yanahitajika ili kuendelea' : 'Payment required to proceed'}
              </strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--app-text-muted)', lineHeight: 1.6, marginTop: '0.35rem' }}>
                {isSw
                  ? `Lipa TSh ${(request.agreedPriceTzs || 0).toLocaleString()} kupitia njia rasmi za MY DAY (M-Pesa, Tigo Pesa, Airtel Money, HaloPesa au benki) kama ilivyoelekezwa kwenye uthibitisho wako. Timu ya MY DAY huthibitisha malipo kwa kumbukumbu ya muamala kabla ya kupanga kampeni yako.`
                  : `Pay TSh ${(request.agreedPriceTzs || 0).toLocaleString()} through MY DAY’s official channels (M-Pesa, Tigo Pesa, Airtel Money, HaloPesa or bank) as instructed in your approval. The MY DAY team verifies the payment against the transaction reference before scheduling your campaign.`}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {request.status === 'awaiting_info' && (
              <form onSubmit={e => { e.preventDefault(); if (infoNote.trim()) doAction(request.id, { action: 'respond-info', note: infoNote.trim() }, () => setInfoNote('')); }} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%' }}>
                <input
                  type="text" value={infoNote} onChange={e => setInfoNote(e.target.value)} required
                  placeholder={isSw ? 'Toa taarifa iliyoombwa na timu ya MY DAY…' : 'Provide the information the MY DAY team asked for…'}
                  style={{ flex: 1, minWidth: 220 }}
                />
                <button type="submit" className="mktg-btn" disabled={busy}><Send size={14} /> {isSw ? 'Tuma taarifa' : 'Send information'}</button>
              </form>
            )}
            {CANCELABLE.includes(request.status) && (
              <button type="button" className="mktg-btn mktg-btn--danger" disabled={busy}
                onClick={() => { if (window.confirm(isSw ? 'Uhakika unataka kufuta ombi hili?' : 'Cancel this marketing request?')) doAction(request.id, { action: 'cancel' }); }}>
                <XCircle size={14} /> {isSw ? 'Futa ombi' : 'Cancel request'}
              </button>
            )}
          </div>
        </div>

        <div className="provider-dashboard-grid">
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Messages */}
            <div className="glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--app-text-primary, #0F172A)', marginBottom: '0.75rem' }}>
                {isSw ? 'Mawasiliano na timu ya MY DAY' : 'Messages with the MY DAY team'}
              </h3>
              <div className="mktg-messages">
                {messages.length === 0 && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--app-text-muted)' }}>
                    {isSw ? 'Bado hakuna ujumbe. Uliza swali au toa maelezo ya kampeni yako.' : 'No messages yet. Ask a question or add details about your campaign.'}
                  </p>
                )}
                {messages.map(m => (
                  <div key={m.id} className={`mktg-message${m.senderRole === 'admin' ? ' mktg-message--admin' : ''}`}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 750, color: 'var(--app-text-muted)', marginBottom: '0.2rem' }}>
                      {m.senderRole === 'admin' ? (isSw ? 'Timu ya MY DAY' : 'MY DAY team') : (isSw ? 'Wewe' : 'You')} • {new Date(m.createdAt).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--app-text-primary, #0F172A)', lineHeight: 1.55 }}>{m.body}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <input type="text" value={messageText} onChange={e => setMessageText(e.target.value)} maxLength={2000}
                  placeholder={isSw ? 'Andika ujumbe…' : 'Write a message…'} style={{ flex: 1 }} />
                <button type="submit" className="mktg-btn" disabled={busy || !messageText.trim()}><Send size={14} /></button>
              </form>
            </div>

            {/* Assets */}
            <div className="glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--app-text-primary, #0F172A)', marginBottom: '0.75rem' }}>
                {isSw ? 'Picha na video za kampeni' : 'Campaign images & videos'}
              </h3>
              {!UPLOAD_CLOSED.includes(request.status) && (
                <label className="mktg-btn mktg-btn--ghost" style={{ marginBottom: '0.75rem', opacity: uploading ? 0.6 : 1 }}>
                  <Upload size={14} /> {uploading ? (isSw ? 'Inapakia…' : 'Uploading…') : (isSw ? 'Pakia picha / video' : 'Upload image / video')}
                  <input type="file" accept={[...IMAGE_MIMES, ...VIDEO_MIMES].join(',')} onChange={uploadFile} disabled={uploading} style={{ display: 'none' }} />
                </label>
              )}
              {assets.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--app-text-muted)' }}>
                  {isSw ? 'Bado hujapakia faili. Picha (≤8MB) na video (≤25MB) husaidia timu kutekeleza huduma yako.' : 'No files uploaded yet. Images (≤8MB) and videos (≤25MB) help the team deliver your service.'}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {assets.map(a => (
                    <div key={a.id} className="mktg-row mktg-row--static" style={{ justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.83rem', color: 'var(--app-text-primary, #0F172A)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.kind === 'video' ? '🎬' : '🖼️'} {a.fileName}
                      </span>
                      <span style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span className="mktg-badge" style={{
                          color: a.status === 'approved' ? '#059669' : a.status === 'rejected' ? '#dc2626' : '#b45309',
                          borderColor: a.status === 'approved' ? '#05966955' : a.status === 'rejected' ? '#dc262655' : '#b4530955',
                        }}>
                          {a.status === 'approved' ? (isSw ? 'Imeidhinishwa' : 'Approved') : a.status === 'rejected' ? (isSw ? 'Imekataliwa' : 'Rejected') : (isSw ? 'Inasubiri mapitio' : 'Pending review')}
                        </span>
                        <button type="button" className="mktg-btn mktg-btn--ghost" style={{ padding: '0.3rem 0.7rem' }} onClick={() => viewAsset(a)}>
                          <Eye size={13} />
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Report */}
            {report && (
              <div className="glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--app-text-primary, #0F172A)', marginBottom: '0.75rem' }}>
                  {isSw ? 'Ripoti ya kampeni' : 'Campaign report'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--app-text-primary, #0F172A)', lineHeight: 1.6, marginBottom: '0.6rem' }}>
                  {pick(report.summary, language) || (isSw ? 'Ripoti imerekodiwa.' : 'Report recorded.')}
                </p>
                {report.metrics && Object.keys(report.metrics).length > 0 && (
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {Object.entries(report.metrics).map(([k, v]) => (
                      <div key={k} style={{ padding: '0.6rem 0.9rem', borderRadius: '12px', background: 'rgba(0, 113, 227, 0.06)', border: '1px solid rgba(0, 113, 227, 0.18)' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 750, color: 'var(--app-text-muted)', textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 850, color: 'var(--color-primary, #0071E3)' }}>{String(v)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timeline + payments */}
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--app-text-primary, #0F172A)', marginBottom: '0.75rem' }}>
                {isSw ? 'Historia ya ombi' : 'Request history'}
              </h3>
              <ul className="mktg-timeline">
                {events.map(ev => (
                  <li key={ev.id}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 750, color: 'var(--app-text-primary, #0F172A)' }}>
                      {ev.toStatus ? <StatusBadge status={ev.toStatus} language={language} /> : (ev.kind === 'quote' ? (isSw ? 'Nukuu ya bei' : 'Quotation') : ev.kind === 'payment' ? (isSw ? 'Malipo' : 'Payment') : ev.kind === 'assignment' ? (isSw ? 'Mgawo wa kazi' : 'Assignment') : ev.kind === 'asset' ? (isSw ? 'Faili' : 'File') : ev.kind === 'report' ? (isSw ? 'Ripoti' : 'Report') : ev.kind)}
                    </div>
                    {ev.data?.note && <div style={{ fontSize: '0.78rem', color: 'var(--app-text-muted)', marginTop: '0.15rem' }}>{ev.data.note}</div>}
                    <div style={{ fontSize: '0.7rem', color: 'var(--app-text-muted)', marginTop: '0.15rem' }}>{new Date(ev.createdAt).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            </div>

            {payments.length > 0 && (
              <div className="glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--app-text-primary, #0F172A)', marginBottom: '0.75rem' }}>
                  {isSw ? 'Malipo yaliyothibitishwa' : 'Confirmed payments'}
                </h3>
                {payments.map(p => (
                  <div key={p.id} className="mktg-row mktg-row--static" style={{ justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--app-text-muted)' }}>{p.txnRef}</span>
                    <strong style={{ fontSize: '0.88rem', color: '#059669' }}>{fmtTzs(p.amount)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------- form
  if (view === 'form' && form) {
    const service = (services || []).find(s => s.id === form.serviceId);
    return (
      <div className="glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '1.5rem', maxWidth: 720 }}>
        <button type="button" className="mktg-btn mktg-btn--ghost" style={{ marginBottom: '1rem' }} onClick={() => { setView('explore'); setForm(null); }}>
          <ArrowLeft size={15} /> {isSw ? 'Rudi kwenye huduma' : 'Back to services'}
        </button>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 850, color: 'var(--app-text-primary, #0F172A)', marginBottom: '0.35rem' }}>
          {isSw ? 'Omba:' : 'Request:'} {pick(service?.name, language)}
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--app-text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
          {pick(service?.requirements, language)}
        </p>
        <ErrorNote error={error} language={language} />
        <form onSubmit={submitRequest}>
          <div className="mktg-field">
            <label>{isSw ? 'Malengo na maelezo ya kampeni *' : 'Campaign objectives & details *'}</label>
            <textarea rows={4} required minLength={10} value={form.objectives}
              onChange={e => setForm({ ...form, objectives: e.target.value })}
              placeholder={isSw ? 'Eleza unachotaka kufikia: huduma unazotaka kuangazia, tukio au msimu, matokeo unayotarajia…' : 'Describe what you want to achieve: services to highlight, an event or season, expected outcomes…'} />
          </div>
          <div className="mktg-field">
            <label>{isSw ? 'Wateja unaowalenga' : 'Target audience'}</label>
            <input type="text" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}
              placeholder={isSw ? 'Mfano: wanandoa wa Dar es Salaam, bajeti ya kati' : 'E.g. couples in Dar es Salaam, mid-range budgets'} />
          </div>
          <div className="mktg-field">
            <label>{isSw ? 'Ujumbe mkuu wa promosheni' : 'Key promotion message'}</label>
            <input type="text" value={form.keyMessage} onChange={e => setForm({ ...form, keyMessage: e.target.value })}
              placeholder={isSw ? 'Mfano: ofa ya mapambo ya harusi kwa msimu wa kiangazi' : 'E.g. seasonal wedding decor offer'} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div className="mktg-field">
              <label>{isSw ? 'Tarehe ya kuanza unayopendelea' : 'Preferred start date'}</label>
              <input type="date" value={form.preferredStart} onChange={e => setForm({ ...form, preferredStart: e.target.value })} />
            </div>
            <div className="mktg-field">
              <label>{isSw ? 'Tarehe ya kumaliza unayopendelea' : 'Preferred end date'}</label>
              <input type="date" value={form.preferredEnd} min={form.preferredStart || undefined} onChange={e => setForm({ ...form, preferredEnd: e.target.value })} />
            </div>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--app-text-muted)', margin: '0.5rem 0 1rem', lineHeight: 1.55 }}>
            {isSw
              ? 'Baada ya kuwasilisha, unaweza kupakia picha na video kwenye ukurasa wa ombi. Timu ya MY DAY itapitia ombi na kutoa nukuu ya bei.'
              : 'After submitting, you can upload images and videos on the request page. The MY DAY team will review it and issue a price quotation.'}
          </p>
          <button type="submit" className="mktg-btn" disabled={busy}>
            <Megaphone size={15} /> {busy ? (isSw ? 'Inawasilisha…' : 'Submitting…') : (isSw ? 'Wasilisha ombi' : 'Submit request')}
          </button>
        </form>
      </div>
    );
  }

  // ---------------------------------------------------------------- lists
  return (
    <div>
      <div className="glass-lens" style={{ display: 'inline-flex', gap: '0.4rem', background: 'var(--lens-bg)', padding: '0.3rem', borderRadius: '9999px', border: 'var(--lens-border)', marginBottom: '1.5rem', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)' }}>
        <button type="button" style={tabBtn(view === 'explore')} onClick={() => setView('explore')}>
          <Megaphone size={15} /> {isSw ? 'Gundua huduma' : 'Explore services'}
        </button>
        <button type="button" style={tabBtn(view === 'requests')} onClick={() => { setView('requests'); loadRequests(); }}>
          <Send size={15} /> {isSw ? `Maombi yangu (${requests?.length ?? 0})` : `My requests (${requests?.length ?? 0})`}
        </button>
      </div>

      <ErrorNote error={error} language={language} onRetry={() => { loadServices(); loadRequests(); }} />

      {view === 'explore' ? (
        !services ? <LoadingNote language={language} /> : (
          <div className="mktg-grid">
            {services.map(s => (
              <ServiceCard key={s.id} service={s} language={language}
                actionLabel={isSw ? 'Omba huduma hii' : 'Request this service'}
                onAction={() => startRequest(s)} />
            ))}
          </div>
        )
      ) : (
        !requests ? <LoadingNote language={language} /> : requests.length === 0 ? (
          <div className="glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--app-text-muted)', marginBottom: '1rem' }}>
              {isSw ? 'Bado hujaomba huduma yoyote ya masoko.' : 'You have not requested any marketing service yet.'}
            </p>
            <button type="button" className="mktg-btn" onClick={() => setView('explore')}>
              {isSw ? 'Gundua huduma' : 'Explore services'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {requests.map(r => (
              <button key={r.id} type="button" className="mktg-row glass-slab glass-frosted-optical"
                style={{ ...glassCard, padding: '1rem 1.25rem', justifyContent: 'space-between', textAlign: 'left', width: '100%' }}
                onClick={() => openDetail(r.id)}>
                <span style={{ minWidth: 0 }}>
                  <strong style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, color: 'var(--app-text-primary, #0F172A)' }}>
                    {pick(r.service?.name, language) || r.serviceId}
                  </strong>
                  <span style={{ fontSize: '0.76rem', color: 'var(--app-text-muted)' }}>
                    {r.id} • {new Date(r.createdAt).toLocaleDateString()}
                    {r.campaignStart ? ` • ${r.campaignStart} → ${r.campaignEnd || ''}` : ''}
                  </span>
                </span>
                <span style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {(r.agreedPriceTzs ?? r.quotedPriceTzs) != null && (
                    <strong style={{ fontSize: '0.85rem', color: '#059669' }}>{fmtTzs(r.agreedPriceTzs ?? r.quotedPriceTzs)}</strong>
                  )}
                  <StatusBadge status={r.status} language={language} />
                </span>
              </button>
            ))}
          </div>
        )
      )}
    </div>
  );
}