export const contentsApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = `/api/dashboard/content${query ? `?${query}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener contenidos');
    return res.json();
  },

  getById: async (id) => {
    const res = await fetch(`/api/dashboard/content/${id}`);
    if (!res.ok) throw new Error('Error al obtener el contenido');
    return res.json();
  },

  create: async (data) => {
    const res = await fetch('/api/dashboard/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al crear el contenido');
    return res.json();
  },

  update: async (id, data) => {
    const res = await fetch(`/api/dashboard/content/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar el contenido');
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`/api/dashboard/content/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error al eliminar el contenido');
    return true;
  },

  updateOrder: async (orderedItems) => {
    const res = await fetch('/api/dashboard/content/order', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderedItems)
    });
    if (!res.ok) throw new Error('Error al actualizar el orden');
    return res.json();
  }
};
