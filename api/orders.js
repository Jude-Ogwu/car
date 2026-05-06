/**
 * Vehicle Dealers Hub — API: Orders / Inquiries
 * ─────────────────────────────────────────────────────────────
 * Use this to submit a customer inquiry from any frontend page.
 *
 * USAGE:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="api/orders.js"></script>
 *   <script>
 *     OrdersAPI.submit({
 *       car_id:        1,
 *       car_name:      '2024 Tesla Model 3',
 *       customer_name: 'John Doe',
 *       email:         'john@example.com',
 *       phone:         '+1 555 123 4567',
 *       message:       'I am interested in this car.',
 *       total_price:   42500
 *     }).then(function(result) { console.log(result); });
 *   </script>
 *
 * DIRECT SUPABASE REST:
 *   POST https://krrmrowmfkfcdycnfvjg.supabase.co/rest/v1/orders
 *   Headers: { "apikey": "...", "Content-Type": "application/json", "Prefer": "return=representation" }
 *   Body:    { "car_id": 1, "car_name": "...", "customer_name": "...", ... }
 */

const OrdersAPI = (function() {
  const URL = 'https://krrmrowmfkfcdycnfvjg.supabase.co/rest/v1/orders';
  const KEY = 'sb_publishable_a2BPr-FHkue1wQx46vnCwA__vU_oeqM';

  const headers = {
    'apikey': KEY,
    'Authorization': 'Bearer ' + KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  return {
    /**
     * Submit a customer inquiry.
     * @param {Object} data - Required: customer_name, email. Optional: car_id, car_name, phone, message, total_price
     * @returns {Promise<Object|null>} - The created order record, or null on error
     */
    async submit(data) {
      const payload = {
        car_id:        data.car_id        || data.carId        || null,
        car_name:      data.car_name      || data.carName      || '',
        customer_name: data.customer_name || data.customerName || '',
        email:         data.email         || '',
        phone:         data.phone         || '',
        message:       data.message       || '',
        total_price:   Number(data.total_price || data.totalPrice || 0),
        status:        data.status        || 'New'
      };

      if (!payload.customer_name || !payload.email) {
        console.error('OrdersAPI: customer_name and email are required');
        return null;
      }

      const res = await fetch(URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(function() { return {}; });
        console.error('OrdersAPI submit failed:', err);
        return null;
      }
      const result = await res.json();
      return Array.isArray(result) ? result[0] : result;
    }
  };
})();

if (typeof module !== 'undefined') module.exports = OrdersAPI;
