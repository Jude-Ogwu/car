/**
 * Vehicle Dealers Hub — API: Cars
 * ─────────────────────────────────────────────────────────────
 * Simple data-access module for car inventory.
 * Your colleague can include this file and use the functions below.
 *
 * USAGE:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="api/cars.js"></script>
 *   <script>
 *     CarsAPI.getAll().then(function(cars) { console.log(cars); });
 *     CarsAPI.getById(1).then(function(car) { console.log(car); });
 *   </script>
 *
 * DIRECT SUPABASE REST (no JS needed):
 *   GET  https://krrmrowmfkfcdycnfvjg.supabase.co/rest/v1/cars?select=*
 *   GET  https://krrmrowmfkfcdycnfvjg.supabase.co/rest/v1/cars?id=eq.1&select=*
 *   GET  https://krrmrowmfkfcdycnfvjg.supabase.co/rest/v1/cars?status=eq.Available&select=*
 *   Headers: { "apikey": "sb_publishable_a2BPr-FHkue1wQx46vnCwA__vU_oeqM" }
 */

const CarsAPI = (function() {
  const URL = 'https://krrmrowmfkfcdycnfvjg.supabase.co/rest/v1/cars';
  const KEY = 'sb_publishable_a2BPr-FHkue1wQx46vnCwA__vU_oeqM';

  const headers = {
    'apikey': KEY,
    'Authorization': 'Bearer ' + KEY,
    'Content-Type': 'application/json'
  };

  return {
    /** Get all published (non-draft) cars */
    async getAll(filters) {
      filters = filters || {};
      var params = new URLSearchParams({ select: '*', order: 'id.desc' });
      if (filters.status)   params.set('status', 'eq.' + filters.status);
      if (filters.category) params.set('category', 'eq.' + filters.category);
      if (filters.brand)    params.set('brand', 'eq.' + filters.brand);
      const res = await fetch(URL + '?' + params.toString(), { headers });
      if (!res.ok) throw new Error('Cars fetch failed: ' + res.status);
      return res.json();
    },

    /** Get a single car by ID */
    async getById(id) {
      const res = await fetch(URL + '?id=eq.' + id + '&select=*&limit=1', { headers });
      if (!res.ok) throw new Error('Car fetch failed: ' + res.status);
      const data = await res.json();
      return data[0] || null;
    },

    /** Get only available cars (for public Catalogue) */
    async getAvailable() {
      return this.getAll({ status: 'Available' });
    },

    /** Get cars by category */
    async getByCategory(category) {
      return this.getAll({ category, status: 'Available' });
    }
  };
})();

// Also expose as module export if using a bundler
if (typeof module !== 'undefined') module.exports = CarsAPI;
