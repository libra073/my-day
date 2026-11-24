// MY DAY Vendor Marketing Services API.
//
// Vendors request managed marketing services; admins review, quote, schedule,
// confirm payment (reusing public.payments), execute and report. Every important
// change lands in marketing_request_events. Money and status move only here,
// server-side — clients never confirm their own payments or placements.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { saveDatabase } from './db.js';
import { isSupabaseConfigured, supabaseAdmin } from './supabaseAdmin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = process.env.VERCEL
  ? path.join('/tmp', 'myday-data', 'uploads')
  : path.join(__dirname, 'data', 'uploads');
const BUCKET = 'marketing-assets';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;
const IMAGE_MIMES = ['image/png', 'image/jpeg', 'image/webp'];
const VIDEO_MIMES = ['video/mp4', 'video/quicktime'];

const nowIso = () => new Date().toISOString();
const newId = (prefix) => `${prefix}-${crypto.randomBytes(6).toString('hex')}`;

const ACTIVE_STATUSES = ['submitted', 'under_review', 'awaiting_info', 'approved', 'awaiting_payment', 'scheduled', 'in_progress'];
const VENDOR_CANCELABLE = ['submitted', 'under_review', 'awaiting_info', 'approved', 'awaiting_payment', 'scheduled'];

// Admin-driven lifecycle edges. Vendor-driven edges (cancel, respond-info) are
// handled separately with ownership checks.
const ADMIN_TRANSITIONS = {
  review: { from: ['submitted'], to: 'under_review' },
  'request-info': { from: ['under_review'], to: 'awaiting_info' },
  approve: { from: ['under_review'], to: 'approved' },
  reject: { from: ['submitted', 'under_review', 'awaiting_info'], to: 'rejected' },
  'await-payment': { from: ['approved'], to: 'awaiting_payment' },
  'waive-payment': { from: ['approved'], to: 'scheduled' },
  schedule: { from: ['approved', 'awaiting_payment', 'scheduled'], to: 'scheduled' },
  start: { from: ['scheduled'], to: 'in_progress' },
  complete: { from: ['in_progress'], to: 'completed' },
};

function pushEvent(db, request, actor, kind, extra = {}) {
  db.marketing_request_events.push({
    id: newId('mkev'),
    requestId: request.id,
    actorId: actor?.id || null,
    kind,
    fromStatus: extra.fromStatus || null,
    toStatus: extra.toStatus || null,
    data: { note: '', actorRole: actor?.globalRole || '', ...extra },
    createdAt: nowIso(),
  });
}

function placementLive(p, now = Date.now()) {
  return p.status === 'active'
    && new Date(p.startsAt).getTime() <= now
    && new Date(p.endsAt).getTime() >= now;
}

function publicService(s) {
  return s;
}

export async function handleMarketingRequest(ctx) {
  const { method, pathname, urlObj, json, err, readBody, authenticate, db } = ctx;
  const { user } = authenticate();
  const isAdmin = user?.globalRole === 'admin';
  const isVendor = user?.globalRole === 'provider';

  // Guards send the error response themselves and return true when denied.
  const requireAdmin = () => {
    if (!user) { err('Unauthorized', 401); return true; }
    if (!isAdmin) { err('Forbidden: administrator access required', 403); return true; }
    return false;
  };
  const findRequest = (id) => (db.marketing_requests || []).find(r => r.id === id);
  const seeRequest = (r) => {
    if (!r) { err('Request not found', 404); return true; }
    if (!user) { err('Unauthorized', 401); return true; }
    if (!isAdmin && r.vendorId !== user.id) { err('Forbidden: this request belongs to another vendor', 403); return true; }
    return false;
  };
  const serviceOf = (r) => (db.marketing_services || []).find(s => s.id === r.serviceId);

  // ------------------------------------------------------------ catalogue
  if (pathname === '/api/marketing/services' && method === 'GET') {
    const all = urlObj.searchParams.get('all') === '1';
    if (all) {
      if (requireAdmin()) return;
      return json({ services: [...db.marketing_services].sort((a, b) => a.sort - b.sort) });
    }
    const services = db.marketing_services.filter(s => s.active).sort((a, b) => a.sort - b.sort);
    return json({ services: services.map(publicService) });
  }

  if (pathname === '/api/marketing/services' && method === 'POST') {
    if (requireAdmin()) return;
    const body = await readBody();
    const slug = String(body.slug || '').trim().toLowerCase();
    if (!/^[a-z0-9-]{3,40}$/.test(slug)) return err('A valid slug is required', 422);
    if (db.marketing_services.some(s => s.slug === slug)) return err('Slug already exists', 409);
    if (!body.name?.en || !body.name?.sw) return err('English and Kiswahili names are required', 422);
    const priceType = body.priceType === 'fixed' ? 'fixed' : 'quote';
    const priceTzs = priceType === 'fixed' ? Math.round(Number(body.priceTzs)) : null;
    if (priceType === 'fixed' && (!Number.isFinite(priceTzs) || priceTzs <= 0)) {
      return err('A fixed price in TZS greater than zero is required', 422);
    }
    const service = {
      id: newId('mks'), slug, active: body.active !== false, priceType, priceTzs,
      sort: Number(body.sort) || db.marketing_services.length + 1,
      name: body.name, summary: body.summary || { en: '', sw: '' },
      description: body.description || { en: '', sw: '' },
      requirements: body.requirements || { en: '', sw: '' },
      deliverables: Array.isArray(body.deliverables) ? body.deliverables : [],
      managed: true, createdAt: nowIso(), updatedAt: nowIso(),
    };
    db.marketing_services.push(service);
    await saveDatabase();
    return json({ service }, 201);
  }

  const serviceMatch = pathname.match(/^\/api\/marketing\/services\/([a-zA-Z0-9_-]+)$/);
  if (serviceMatch && method === 'PATCH') {
    if (requireAdmin()) return;
    const service = db.marketing_services.find(s => s.id === serviceMatch[1]);
    if (!service) return err('Service not found', 404);
    const body = await readBody();
    for (const key of ['name', 'summary', 'description', 'requirements', 'deliverables']) {
      if (body[key] !== undefined) service[key] = body[key];
    }
    if (body.active !== undefined) service.active = Boolean(body.active);
    if (body.sort !== undefined) service.sort = Number(body.sort) || 0;
    if (body.priceType !== undefined || body.priceTzs !== undefined) {
      const priceType = body.priceType === 'fixed' ? 'fixed' : body.priceType === 'quote' ? 'quote' : service.priceType;
      const priceTzs = priceType === 'fixed'
        ? Math.round(Number(body.priceTzs !== undefined ? body.priceTzs : service.priceTzs))
        : null;
      if (priceType === 'fixed' && (!Number.isFinite(priceTzs) || priceTzs <= 0)) {
        return err('A fixed price in TZS greater than zero is required', 422);
      }
      service.priceType = priceType;
      service.priceTzs = priceTzs;
    }
    service.updatedAt = nowIso();
    await saveDatabase();
    return json({ service });
  }

  // ------------------------------------------------------------ requests
  if (pathname === '/api/marketing/requests' && method === 'GET') {
    if (!user) return err('Unauthorized', 401);
    let list = isAdmin ? db.marketing_requests : db.marketing_requests.filter(r => r.vendorId === user.id);
    const status = urlObj.searchParams.get('status');
    if (status) list = list.filter(r => r.status === status);
    const withService = list.map(r => ({ ...r, service: serviceOf(r) || null }));
    return json({ requests: withService.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
  }

  if (pathname === '/api/marketing/requests' && method === 'POST') {
    if (!user) return err('Unauthorized', 401);
    if (!isVendor) return err('Only registered vendors can request marketing services', 403);
    const body = await readBody();
    const service = db.marketing_services.find(s => s.id === body.serviceId);
    if (!service || !service.active) return err('Service not available', 422);
    const objectives = String(body.objectives || '').trim();
    if (objectives.length < 10) return err('Please describe your campaign objectives (at least 10 characters)', 422);
    const preferredStart = body.preferredStart || null;
    const preferredEnd = body.preferredEnd || null;
    if (preferredStart && preferredEnd && preferredEnd < preferredStart) {
      return err('Preferred end date must be after the start date', 422);
    }
    const request = {
      id: newId('mkr'), serviceId: service.id, vendorId: user.id,
      status: 'submitted',
      paymentStatus: service.priceType === 'fixed' && service.priceTzs > 0 ? 'awaiting_payment' : 'awaiting_quote',
      assigneeId: null, quotedPriceTzs: null, agreedPriceTzs: null,
      preferredStart, preferredEnd, campaignStart: null, campaignEnd: null,
      objectives, campaignDetails: body.campaignDetails || {},
      createdAt: nowIso(), updatedAt: nowIso(),
    };
    db.marketing_requests.push(request);
    pushEvent(db, request, user, 'status_change', { fromStatus: null, toStatus: 'submitted', note: 'Request submitted' });
    await saveDatabase();
    return json({ request: { ...request, service } }, 201);
  }

  const requestMatch = pathname.match(/^\/api\/marketing\/requests\/([a-zA-Z0-9_-]+)(\/.*)?$/);
  if (requestMatch) {
    const request = findRequest(requestMatch[1]);
    const sub = requestMatch[2] || '';
    if (seeRequest(request)) return;
    const service = serviceOf(request);

    if (sub === '' && method === 'GET') {
      return json({
        request,
        service,
        events: db.marketing_request_events.filter(e => e.requestId === request.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
        assets: db.marketing_request_assets.filter(a => a.requestId === request.id),
        messages: db.marketing_request_messages.filter(m => m.requestId === request.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
        payments: db.payments.filter(p => p.marketingRequestId === request.id),
        report: db.campaign_reports.find(r => r.requestId === request.id && (isAdmin || r.published)) || null,
      });
    }

    // Vendor-safe actions: cancel own request, answer an information request.
    if (sub === '/action' && method === 'POST') {
      const body = await readBody();
      const action = String(body.action || '');

      if (action === 'cancel') {
        if (!isAdmin && request.vendorId !== user.id) return err('Forbidden', 403);
        const allowed = isAdmin ? request.status !== 'completed' : VENDOR_CANCELABLE.includes(request.status);
        if (!allowed) return err('This request can no longer be cancelled', 422);
        const fromStatus = request.status;
        request.status = 'cancelled';
        request.updatedAt = nowIso();
        pushEvent(db, request, user, 'status_change', { fromStatus, toStatus: 'cancelled', note: String(body.note || '').slice(0, 500) });
        await saveDatabase();
        return json({ request });
      }

      if (action === 'respond-info') {
        if (request.vendorId !== user.id) return err('Forbidden: only the requesting vendor can respond', 403);
        if (request.status !== 'awaiting_info') return err('No information request is open', 422);
        const note = String(body.note || '').trim();
        if (!note) return err('Please provide the requested information', 422);
        const fromStatus = request.status;
        request.status = 'under_review';
        request.updatedAt = nowIso();
        pushEvent(db, request, user, 'status_change', { fromStatus, toStatus: 'under_review', note });
        db.marketing_request_messages.push({
          id: newId('mkmsg'), requestId: request.id, senderId: user.id,
          senderRole: user.globalRole, body: note, createdAt: nowIso(),
        });
        await saveDatabase();
        return json({ request });
      }

      // Everything below is administrator-only.
      if (requireAdmin()) return;

      if (action === 'assign') {
        const assignee = db.users.find(u => u.id === body.assigneeId);
        if (!assignee || assignee.globalRole !== 'admin') return err('Assignee must be a MY DAY team administrator', 422);
        request.assigneeId = assignee.id;
        request.updatedAt = nowIso();
        pushEvent(db, request, user, 'assignment', { note: `Assigned to ${assignee.name || assignee.email}` });
        await saveDatabase();
        return json({ request });
      }

      if (action === 'set-quote') {
        if (!ACTIVE_STATUSES.includes(request.status) || ['scheduled', 'in_progress'].includes(request.status)) {
          return err('Quoting is closed once the campaign is scheduled', 422);
        }
        const price = Math.round(Number(body.priceTzs));
        if (!Number.isFinite(price) || price <= 0) return err('A quote in TZS greater than zero is required', 422);
        request.quotedPriceTzs = price;
        request.updatedAt = nowIso();
        pushEvent(db, request, user, 'quote', { note: String(body.note || '').slice(0, 500), priceTzs: price });
        await saveDatabase();
        return json({ request });
      }

      if (action === 'confirm-payment') {
        if (request.status !== 'awaiting_payment') return err('Payment is not awaited for this request', 422);
        const txnRef = String(body.txnRef || '').trim();
        if (!txnRef) return err('A verified transaction reference is required to confirm payment', 422);
        const amount = request.agreedPriceTzs;
        if (!Number.isFinite(amount) || amount <= 0) return err('No agreed price to confirm', 422);
        if (db.payments.some(p => p.marketingRequestId === request.id && p.status === 'confirmed')) {
          return err('Payment already confirmed for this request', 409);
        }
        db.payments.push({
          id: newId('pay'), bookingId: null, marketingRequestId: request.id,
          customerId: request.vendorId, amount,
          gateway: String(body.gateway || 'manual').slice(0, 40), txnRef,
          status: 'confirmed', createdAt: nowIso(),
        });
        request.paymentStatus = 'paid';
        request.updatedAt = nowIso();
        pushEvent(db, request, user, 'payment', { note: `Payment confirmed: ${txnRef}`, amountTzs: amount });
        await saveDatabase();
        return json({ request });
      }

      if (action === 'report') {
        if (request.status !== 'completed') return err('Reports are recorded after completion', 422);
        const existing = db.campaign_reports.find(r => r.requestId === request.id);
        const report = existing || {
          id: newId('mkrep'), requestId: request.id, published: false,
          createdAt: nowIso(), updatedAt: nowIso(),
        };
        report.summary = body.summary || report.summary || { en: '', sw: '' };
        report.metrics = body.metrics && typeof body.metrics === 'object' ? body.metrics : report.metrics || {};
        if (body.published !== undefined) report.published = Boolean(body.published);
        report.updatedAt = nowIso();
        if (!existing) db.campaign_reports.push(report);
        pushEvent(db, request, user, 'report', { note: report.published ? 'Campaign report published' : 'Campaign report recorded' });
        await saveDatabase();
        return json({ report });
      }

      const transition = ADMIN_TRANSITIONS[action];
      if (!transition) return err('Unknown action', 422);
      if (!transition.from.includes(request.status)) {
        return err(`Cannot ${action} a request in status ${request.status}`, 422);
      }
      const note = String(body.note || '').slice(0, 500);
      if (action === 'request-info' && !note) return err('Describe the information you need from the vendor', 422);
      if (action === 'reject' && !note) return err('A rejection reason is required', 422);

      if (action === 'await-payment') {
        const price = request.quotedPriceTzs ?? (service?.priceType === 'fixed' ? service.priceTzs : null);
        if (!Number.isFinite(price) || price <= 0) return err('Set a quote or fixed price before awaiting payment', 422);
        request.agreedPriceTzs = price;
        request.paymentStatus = 'awaiting_payment';
      }
      if (action === 'waive-payment') {
        request.agreedPriceTzs = 0;
        request.paymentStatus = 'not_required';
        if (!request.campaignStart || !request.campaignEnd) {
          return err('Set campaign dates when waiving payment', 422);
        }
      }
      if (action === 'schedule') {
        const start = body.campaignStart || request.campaignStart;
        const end = body.campaignEnd || request.campaignEnd;
        if (!start || !end || end < start) return err('Valid campaign start and end dates are required', 422);
        if (request.status === 'awaiting_payment' && request.paymentStatus !== 'paid') {
          return err('Confirm payment before scheduling', 422);
        }
        if (request.status === 'approved' && request.paymentStatus !== 'not_required') {
          return err('Await payment or waive it before scheduling', 422);
        }
        request.campaignStart = start;
        request.campaignEnd = end;
      }
      if (action === 'approve' && body.priceTzs !== undefined) {
        const price = Math.round(Number(body.priceTzs));
        if (!Number.isFinite(price) || price <= 0) return err('Invalid quote amount', 422);
        request.quotedPriceTzs = price;
      }

      const fromStatus = request.status;
      request.status = transition.to;
      request.updatedAt = nowIso();
      pushEvent(db, request, user, 'status_change', { fromStatus, toStatus: transition.to, note });
      await saveDatabase();
      return json({ request });
    }

    if (sub === '/messages' && method === 'POST') {
      const body = await readBody();
      const text = String(body.body || '').trim();
      if (!text) return err('Message cannot be empty', 422);
      if (text.length > 2000) return err('Message too long (2000 characters max)', 422);
      const message = {
        id: newId('mkmsg'), requestId: request.id, senderId: user.id,
        senderRole: user.globalRole, body: text, createdAt: nowIso(),
      };
      db.marketing_request_messages.push(message);
      await saveDatabase();
      return json({ message }, 201);
    }

    if (sub === '/assets' && method === 'POST') {
      if (request.vendorId !== user.id) return err('Forbidden: only the requesting vendor can upload', 403);
      if (['completed', 'rejected', 'cancelled'].includes(request.status)) {
        return err('Uploads are closed for this request', 422);
      }
      const body = await readBody();
      const mime = String(body.mime || '');
      const kind = IMAGE_MIMES.includes(mime) ? 'image' : VIDEO_MIMES.includes(mime) ? 'video' : null;
      if (!kind) return err('Only PNG, JPEG, WebP images or MP4/MOV videos are accepted', 422);
      const buffer = Buffer.from(String(body.dataBase64 || ''), 'base64');
      const cap = kind === 'image' ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
      if (!buffer.length) return err('Empty file', 422);
      if (buffer.length > cap) return err(`File exceeds the ${Math.round(cap / 1024 / 1024)}MB limit`, 422);
      const declared = Number(body.sizeBytes);
      if (Number.isFinite(declared) && declared !== buffer.length) return err('File size mismatch', 422);
      const assetId = newId('mka');
      const safeName = String(body.fileName || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
      const storagePath = `${request.id}/${assetId}-${safeName}`;
      if (isSupabaseConfigured) {
        const { error: bucketError } = await supabaseAdmin.storage.createBucket(BUCKET, { public: false });
        if (bucketError && !/exist/i.test(bucketError.message)) return err(`Storage unavailable: ${bucketError.message}`, 502);
        const { error: uploadError } = await supabaseAdmin.storage.from(BUCKET).upload(storagePath, buffer, { contentType: mime });
        if (uploadError) return err(`Upload failed: ${uploadError.message}`, 502);
      } else {
        fs.mkdirSync(path.join(UPLOAD_DIR, request.id), { recursive: true });
        fs.writeFileSync(path.join(UPLOAD_DIR, storagePath), buffer);
      }
      const asset = {
        id: assetId, requestId: request.id, uploadedBy: user.id, kind,
        status: 'pending', storagePath,
        fileName: safeName, mime, sizeBytes: buffer.length,
        createdAt: nowIso(),
      };
      db.marketing_request_assets.push(asset);
      pushEvent(db, request, user, 'asset', { note: `Uploaded ${kind}: ${safeName}` });
      await saveDatabase();
      return json({ asset }, 201);
    }

    const assetMatch = sub.match(/^\/assets\/([a-zA-Z0-9_-]+)(\/file)?$/);
    if (assetMatch) {
      const asset = db.marketing_request_assets.find(a => a.id === assetMatch[1] && a.requestId === request.id);
      if (!asset) return err('Asset not found', 404);
      if (assetMatch[2] && method === 'GET') {
        if (isSupabaseConfigured) {
          const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(asset.storagePath, 300);
          if (error) return err(`Could not sign asset URL: ${error.message}`, 502);
          return json({ url: data.signedUrl });
        }
        const file = path.join(UPLOAD_DIR, asset.storagePath);
        if (!fs.existsSync(file)) return err('Asset file missing', 404);
        ctx.res.statusCode = 200;
        ctx.res.setHeader('Content-Type', asset.mime);
        ctx.res.setHeader('Content-Disposition', `inline; filename="${asset.fileName}"`);
        ctx.res.end(fs.readFileSync(file));
        return;
      }
      if (!assetMatch[2] && method === 'PATCH') {
        if (requireAdmin()) return;
        const body = await readBody();
        if (!['approved', 'rejected'].includes(body.status)) return err('Status must be approved or rejected', 422);
        asset.status = body.status;
        asset.reviewNote = String(body.note || '').slice(0, 500);
        pushEvent(db, request, user, 'asset', { note: `Asset ${body.status}: ${asset.fileName}` });
        await saveDatabase();
        return json({ asset });
      }
    }

    return err(`API endpoint not found: ${method} ${pathname}`, 404);
  }

  // ------------------------------------------------------------ placements
  if (pathname === '/api/marketing/placements' && method === 'GET') {
    const all = urlObj.searchParams.get('all') === '1';
    if (all) {
      if (requireAdmin()) return;
      return json({ placements: db.sponsored_placements });
    }
    const live = db.sponsored_placements.filter(p => placementLive(p));
    const withVendor = live.map(p => ({
      ...p,
      vendor: (db.vendors || []).find(v => v.id === p.vendorId) || null,
    }));
    return json({ placements: withVendor });
  }

  if (pathname === '/api/marketing/placements' && method === 'POST') {
    if (requireAdmin()) return;
    const body = await readBody();
    const vendor = (db.vendors || []).find(v => v.id === body.vendorId);
    if (!vendor) return err('Vendor not found', 422);
    if (!['homepage', 'featured', 'category', 'banner'].includes(body.location)) return err('Invalid placement location', 422);
    const startsAt = body.startsAt ? new Date(body.startsAt) : null;
    const endsAt = body.endsAt ? new Date(body.endsAt) : null;
    if (!startsAt || !endsAt || isNaN(startsAt) || isNaN(endsAt) || endsAt <= startsAt) {
      return err('Valid start and end timestamps are required (end after start)', 422);
    }
    const placement = {
      id: newId('mkpl'), vendorId: vendor.id, requestId: body.requestId || null,
      location: body.location, category: String(body.category || ''),
      status: ['scheduled', 'active'].includes(body.status) ? body.status : 'scheduled',
      startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString(),
      label: { en: 'Sponsored', sw: 'Imedhaminiwa' },
      createdBy: user.id, createdAt: nowIso(), updatedAt: nowIso(),
    };
    db.sponsored_placements.push(placement);
    await saveDatabase();
    return json({ placement }, 201);
  }

  const placementMatch = pathname.match(/^\/api\/marketing\/placements\/([a-zA-Z0-9_-]+)$/);
  if (placementMatch && (method === 'PATCH' || method === 'DELETE')) {
    if (requireAdmin()) return;
    const placement = db.sponsored_placements.find(p => p.id === placementMatch[1]);
    if (!placement) return err('Placement not found', 404);
    if (method === 'DELETE') {
      db.sponsored_placements = db.sponsored_placements.filter(p => p.id !== placement.id);
      await saveDatabase();
      return json({ deleted: placement.id });
    }
    const body = await readBody();
    if (body.status !== undefined) {
      if (!['scheduled', 'active', 'cancelled'].includes(body.status)) return err('Invalid placement status', 422);
      placement.status = body.status;
    }
    if (body.location !== undefined) {
      if (!['homepage', 'featured', 'category', 'banner'].includes(body.location)) return err('Invalid placement location', 422);
      placement.location = body.location;
    }
    if (body.category !== undefined) placement.category = String(body.category);
    if (body.startsAt !== undefined || body.endsAt !== undefined) {
      const startsAt = new Date(body.startsAt !== undefined ? body.startsAt : placement.startsAt);
      const endsAt = new Date(body.endsAt !== undefined ? body.endsAt : placement.endsAt);
      if (isNaN(startsAt) || isNaN(endsAt) || endsAt <= startsAt) return err('End must be after start', 422);
      placement.startsAt = startsAt.toISOString();
      placement.endsAt = endsAt.toISOString();
    }
    placement.updatedAt = nowIso();
    await saveDatabase();
    return json({ placement });
  }

  return err(`API endpoint not found: ${method} ${pathname}`, 404);
}