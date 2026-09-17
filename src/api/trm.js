export const trmApi = {
  getCurrent: async () => {
    const res = await fetch('/api/trm');
    if (!res.ok) throw new Error('Error al obtener la TRM actual');
    return res.json();
  },

  getHistory: async (rango = '1M') => {
    const res = await fetch(`/api/trm/history?rango=${rango}`);
    if (!res.ok) throw new Error('Error al obtener el histórico de TRM');
    return res.json();
  }
};
