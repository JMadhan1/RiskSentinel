import axios from "axios";

const API_BASE = "http://localhost:8000";

export const api = {
  scan: (walletId) =>
    axios.post(`${API_BASE}/api/scan`, null, {
      params: walletId ? { wallet_id: walletId } : {},
    }),

  status: () => axios.get(`${API_BASE}/api/status`),

  health: () => axios.get(`${API_BASE}/health`),
};
