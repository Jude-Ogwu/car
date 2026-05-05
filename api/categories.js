/**
 * CarVoyage — API: Categories
 * ─────────────────────────────────────────────────────────────
 * Simple data-access module for car categories.
 *
 * USAGE:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="api/categories.js"></script>
 *   <script>
 *     CategoriesAPI.getAll().then(function(cats) { console.log(cats); });
 *   </script>
 *
 * DIRECT SUPABASE REST:
 *   GET  https://krrmrowmfkfcdycnfvjg.supabase.co/rest/v1/categories?select=*&order=name.asc
 *   Headers: { "apikey": "sb_publishable_a2BPr-FHkue1wQx46vnCwA__vU_oeqM" }
 */

const CategoriesAPI = (function() {
  const URL = 'https://krrmrowmfkfcdycnfvjg.supabase.co/rest/v1/categories';
  const KEY = 'sb_publishable_a2BPr-FHkue1wQx46vnCwA__vU_oeqM';

  const headers = {
    'apikey': KEY,
    'Authorization': 'Bearer ' + KEY,
    'Content-Type': 'application/json'
  };

  return {
    /** Returns all categories sorted A-Z */
    async getAll() {
      const res = await fetch(URL + '?select=*&order=name.asc', { headers });
      if (!res.ok) throw new Error('Categories fetch failed: ' + res.status);
      return res.json();
    },

    /** Returns just an array of category name strings */
    async getNames() {
      const cats = await this.getAll();
      return cats.map(function(c) { return c.name; });
    }
  };
})();

if (typeof module !== 'undefined') module.exports = CategoriesAPI;
