import api from './api';

const post = (endpoint, body) => api.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
const patch = (endpoint, body) => api.request(endpoint, { method: 'PATCH', body: JSON.stringify(body) });

export const marketingApi = {
  services: (all = false) => api.request(`/api/marketing/services${all ? '?all=1' : ''}`),
  createService: (body) => post('/api/marketing/services', body),
  updateService: (id, body) => patch(`/api/marketing/services/${id}`, body),

  requests: (status) => api.request(`/api/marketing/requests${status ? `?status=${status}` : ''}`),
  createRequest: (body) => post('/api/marketing/requests', body),
  requestDetail: (id) => api.request(`/api/marketing/requests/${id}`),
  action: (id, body) => post(`/api/marketing/requests/${id}/action`, body),
  message: (id, body) => post(`/api/marketing/requests/${id}/messages`, { body }),

  uploadAsset: (id, body) => post(`/api/marketing/requests/${id}/assets`, body),
  assetUrl: (id, assetId) => api.request(`/api/marketing/requests/${id}/assets/${assetId}/file`),
  // Supabase mode answers with a signed URL; JSON mode streams the file itself.
  assetFile: async (id, assetId) => {
    const res = await api.rawRequest(`/api/marketing/requests/${id}/assets/${assetId}/file`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    const type = res.headers.get('content-type') || '';
    if (type.includes('application/json')) {
      const { url } = await res.json();
      return url;
    }
    return URL.createObjectURL(await res.blob());
  },
  reviewAsset: (id, assetId, body) => patch(`/api/marketing/requests/${id}/assets/${assetId}`, body),

  placements: (all = false) => api.request(`/api/marketing/placements${all ? '?all=1' : ''}`),
  createPlacement: (body) => post('/api/marketing/placements', body),
  updatePlacement: (id, body) => patch(`/api/marketing/placements/${id}`, body),
  deletePlacement: (id) => api.request(`/api/marketing/placements/${id}`, { method: 'DELETE' }),
};