/**
 * CarVoyage - Data Layer
 * Car inventory + orders managed via Supabase
 */

// ─── SUPABASE CONFIGURATION ────────────────────────────────────────────────
const SUPABASE_URL = 'https://krrmrowmfkfcdycnfvjg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_a2BPr-FHkue1wQx46vnCwA__vU_oeqM';

// Lazy getter - only initializes when first called, so data.js never crashes on load
let _supabaseClient = null;
function getSupabase() {
  if (_supabaseClient) return _supabaseClient;
  if (window.supabase && window.supabase.createClient) {
    _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return _supabaseClient;
  }
  console.error('Supabase SDK not available. Check CDN script tag.');
  return null;
}

// ─── Car Store ─────────────────────────────────────────────────────────────
const CarStore = {
  async getAll() {
    const { data, error } = await getSupabase()
      .from('cars')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching cars:', error);
      return [];
    }
    return data || [];
  },

  async getById(id) {
    const { data, error } = await getSupabase()
      .from('cars')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (error) {
      console.error('Error fetching car details:', error);
      return null;
    }
    return data;
  },

  async save(car) {
    let payload = { ...car };
    if (!payload.id) {
      const { data, error } = await getSupabase()
        .from('cars')
        .insert([payload])
        .select()
        .single();
      if (error) {
        console.error('Error adding car:', error);
        return null;
      }
      return data;
    } else {
      const { id, ...updateData } = payload;
      const { data, error } = await getSupabase()
        .from('cars')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) {
        console.error('Error updating car:', error);
        return null;
      }
      return data;
    }
  },

  async delete(id) {
    const { error } = await getSupabase()
      .from('cars')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      console.error('Error deleting car:', error);
    }
  },

  async updateStatus(id, status) {
    const { error } = await getSupabase()
      .from('cars')
      .update({ status: status })
      .eq('id', parseInt(id));

    if (error) {
      console.error('Error updating status:', error);
    }
  },

  async getStats() {
    const cars = await this.getAll();
    return {
      total: cars.length,
      available: cars.filter(c => c.status === 'Available').length,
      sold: cars.filter(c => c.status === 'Sold').length,
      avgPrice: cars.length > 0 ? Math.round(cars.reduce((a, c) => a + c.price, 0) / cars.length) : 0
    };
  },

  async getBrands() {
    const cars = await this.getAll();
    return [...new Set(cars.map(c => c.brand))].sort();
  },

  async getCategories() {
    const cars = await this.getAll();
    return [...new Set(cars.map(c => c.category))].sort();
  }
};

// ─── Order Store ───────────────────────────────────────────────────────────
const OrderStore = {
  async getAll() {
    const { data, error } = await getSupabase()
      .from('orders')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
    return data || [];
  },

  async getById(id) {
    const { data, error } = await getSupabase()
      .from('orders')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (error) {
      console.error('Error fetching order details:', error);
      return null;
    }
    return data;
  },

  async submit(orderData) {
    const { data, error } = await getSupabase()
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) {
      console.error('Error submitting order:', error);
      return null;
    }
    return data;
  },

  async updateStatus(id, status) {
    const { error } = await getSupabase()
      .from('orders')
      .update({ status: status })
      .eq('id', parseInt(id));

    if (error) {
      console.error('Error updating order status:', error);
    }
  },

  async delete(id) {
    const { error } = await getSupabase()
      .from('orders')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      console.error('Error deleting order:', error);
    }
  },

  async getStats() {
    const orders = await this.getAll();
    const closed = orders.filter(o => o.status === 'Closed');
    return {
      total: orders.length,
      newOrders: orders.filter(o => o.status === 'New').length,
      inProgress: orders.filter(o => o.status === 'In Progress').length,
      closed: closed.length,
      revenue: closed.reduce((a, o) => a + (Number(o.totalPrice) || 0), 0)
    };
  }
};

// ─── Newsletter Store ──────────────────────────────────────────────────────
const NewsletterStore = {
  async subscribe(email) {
    const { error } = await getSupabase()
      .from('newsletter_subscribers')
      .insert([{ email: email }]);

    if (error) {
      if (error.code === '23505') {
        return false;
      }
      console.error('Error subscribing to newsletter:', error);
      return false;
    }
    return true;
  },

  async getAll() {
    const { data, error } = await getSupabase()
      .from('newsletter_subscribers')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching subscribers:', error);
      return [];
    }
    return data || [];
  }
};

// ─── Admin Auth ────────────────────────────────────────────────────────────
const AdminAuth = {
  CREDENTIALS: { username: 'admin', password: 'carvoyage2024' },
  SESSION_KEY: 'carvoyage_admin_session',

  login(username, password) {
    if (username === this.CREDENTIALS.username && password === this.CREDENTIALS.password) {
      sessionStorage.setItem(this.SESSION_KEY, 'true');
      return true;
    }
    return false;
  },

  isAuthenticated() {
    return sessionStorage.getItem(this.SESSION_KEY) === 'true';
  },

  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
  },

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
    }
  }
};

// ─── Utility Helpers ───────────────────────────────────────────────────────
const Utils = {
  formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0);
  },

  formatNumber(n) {
    return new Intl.NumberFormat('en-US').format(n || 0);
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  },

  getQueryParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  },

  renderStars(rating) {
    const r = Number(rating) || 0;
    const full = Math.floor(r);
    const half = r % 1 >= 0.5;
    let html = '';
    for (let i = 0; i < full; i++) html += '<i class="fa-solid fa-star text-warning"></i>';
    if (half) html += '<i class="fa-solid fa-star-half-stroke text-warning"></i>';
    for (let i = Math.ceil(r); i < 5; i++) html += '<i class="fa-regular fa-star text-warning"></i>';
    return html;
  },

  badgeClass(badge) {
    const map = {
      'Hot Deal': 'bg-danger',
      'Popular': 'bg-primary',
      'Best Value': 'bg-success',
      'Luxury': 'bg-warning text-dark',
      'New Arrival': 'bg-info text-dark',
      "Editor's Choice": 'bg-secondary'
    };
    return map[badge] || 'bg-primary';
  },

  carCardHTML(car) {
    const price = Utils.formatPrice(car.price);
    const mileage = Utils.formatNumber(car.mileage);
    const badge = car.badge ? `<span class="car-badge ${Utils.badgeClass(car.badge)}">${car.badge}</span>` : '';
    const statusClass = car.status === 'Sold' ? 'sold-overlay' : '';
    const soldBadge = car.status === 'Sold' ? '<div class="sold-stamp">SOLD</div>' : '';
    const images = Array.isArray(car.images) ? car.images : (typeof car.images === 'string' ? JSON.parse(car.images || '[]') : []);
    const thumbnail = car.thumbnail || (images.length > 0 ? images[0] : 'assets/media/blog/blog-1.jpg');

    return `
      <div class="col-xxl-3 col-xl-4 col-sm-6">
        <div class="blog-1 car-card">
          <div class="blog-img ${statusClass}">
            ${badge}
            ${soldBadge}
            <a href="car-details.html?id=${car.id}">
              <img src="${thumbnail}" alt="${car.name}" onerror="this.src='assets/media/blog/blog-1.jpg'">
            </a>
          </div>
          <div class="blog-content">
            <p class="subtitle black mb-4">${car.category} · ${car.year}</p>
            <div class="d-flex align-items-center justify-content-between mb-36">
              <a href="car-details.html?id=${car.id}" class="h6 hover-content fw-500 black">${car.name}</a>
              <h5 class="fw-600 color-primary">${price}</h5>
            </div>
            <div class="d-flex align-items-center justify-content-between mb-36">
              <div>
                <div class="d-flex align-items-center gap-16 mb-16">
                  <img src="assets/media/icons/manual-transmission.png" alt="">
                  <p class="fw-600 black">${car.transmission}</p>
                </div>
                <div class="d-flex align-items-center gap-16">
                  <img src="assets/media/icons/fuel.png" alt="">
                  <p class="fw-600 black">${car.fuel}</p>
                </div>
              </div>
              <div>
                <div class="d-flex align-items-center gap-16 mb-16">
                  <img src="assets/media/icons/speedometer.png" alt="">
                  <p class="fw-600 black">${mileage} Km</p>
                </div>
                <div class="d-flex align-items-center gap-16">
                  <img src="assets/media/icons/disc-brake.png" alt="">
                  <p class="fw-600 black">${car.condition}</p>
                </div>
              </div>
            </div>
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <p class="black">Rating: <span class="h6 fw-500">${car.rating} </span>
                <span class="h6 color-primary"><i class="fa-solid fa-star"></i></span></p>
              </div>
              <div>
                <a href="car-details.html?id=${car.id}" class="text-decoration-underline p hover-content">View Details</a>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }
};
