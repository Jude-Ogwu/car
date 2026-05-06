
/**
 * Vehicle Dealers Hub — Data Layer

﻿/**
 * CarVoyage — Data Layer

 * Central data access layer for Cars, Orders, and Categories via Supabase.
 * All CRUD operations live here. Import data.js before using any Store.
 */

// ─── SUPABASE CONFIGURATION ──────────────────────────────────────────────────
// Credentials loaded from assets/js/config.js (gitignored)
const SUPABASE_URL      = (window.CARVOYAGE_CONFIG || {}).SUPABASE_URL      || '';
const SUPABASE_ANON_KEY = (window.CARVOYAGE_CONFIG || {}).SUPABASE_ANON_KEY || '';

// Lazy initialiser — safe even if CDN script loads slightly after this file
let _supabaseClient = null;
function getSupabase() {
  if (_supabaseClient) return _supabaseClient;
  // Supabase CDN exposes a global `supabase` object.
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return _supabaseClient;
  }
  console.error('Supabase SDK not loaded yet. Ensure the CDN <script> comes before data.js.');
  return null;
}


// ─── ADMIN AUTH ───────────────────────────────────────────────────────────────
const AdminAuth = {
  CREDENTIALS: { username: 'admin', password: 'carvoyage2024' },
  login(username, password) {
    if (username === this.CREDENTIALS.username && password === this.CREDENTIALS.password) {
      sessionStorage.setItem('cv_admin', 'true');
      return true;
    }
    return false;
  },
  isLoggedIn()  { return sessionStorage.getItem('cv_admin') === 'true'; },
  logout()      { sessionStorage.removeItem('cv_admin'); },
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
    }
  }
};

// ─── CAR STORE ────────────────────────────────────────────────────────────────
const CarStore = {

  async getAll() {
    const sb = getSupabase(); if (!sb) return [];
    const { data, error } = await sb
      .from('cars')
      .select('*')
      .order('id', { ascending: false });
    if (error) { console.error('getAll cars:', error); return []; }
    return data || [];
  },

  async getById(id) {
    const sb = getSupabase(); if (!sb) return null;
    const { data, error } = await sb
      .from('cars')
      .select('*')
      .eq('id', parseInt(id))
      .single();
    if (error) { console.error('getById car:', error); return null; }
    return data;
  },

  async save(car) {
    const sb = getSupabase(); if (!sb) return null;

    // Strip any undefined / null keys that might conflict with DB defaults
    const clean = {};
    const allowed = [
      'name','brand','category','year','price','mileage','fuel','transmission',
      'color','engine','horsepower','seats','condition','status','rating','reviews',
      'description','features','images','thumbnail','badge'
    ];
    allowed.forEach(k => { if (car[k] !== undefined && car[k] !== '') clean[k] = car[k]; });

    // Ensure numeric fields are numbers, not strings
    ['year','price','mileage','horsepower','seats','reviews'].forEach(k => {
      if (clean[k] !== undefined) clean[k] = Number(clean[k]) || 0;
    });
    if (clean.rating !== undefined) clean.rating = parseFloat(clean.rating) || 4.5;

    // Ensure images is always an array
    if (!Array.isArray(clean.images)) {
      clean.images = clean.thumbnail ? [clean.thumbnail] : [];
    }

    const isNew = !car.id;

    if (isNew) {
      // INSERT — do NOT send id at all; let the DB auto-generate it
      const { data, error } = await sb
        .from('cars')
        .insert([clean])
        .select()
        .single();
      if (error) { console.error('insert car error:', error); alert('Error saving car: ' + error.message); return null; }
      return data;
    } else {
      // UPDATE — send only the data fields, filter by id
      const { data, error } = await sb
        .from('cars')
        .update(clean)
        .eq('id', parseInt(car.id))
        .select()
        .single();
      if (error) { console.error('update car error:', error); alert('Error updating car: ' + error.message); return null; }
      return data;
    }
  },

  async delete(id) {
    const sb = getSupabase(); if (!sb) return;
    const { error } = await sb.from('cars').delete().eq('id', parseInt(id));
    if (error) { console.error('delete car:', error); }
  },

  async updateStatus(id, status) {
    const sb = getSupabase(); if (!sb) return;
    const { error } = await sb.from('cars').update({ status }).eq('id', parseInt(id));
    if (error) { console.error('updateStatus car:', error); }
  },

  async getStats() {
    const cars = await this.getAll();
    return {
      total:     cars.length,
      available: cars.filter(c => c.status === 'Available').length,
      sold:      cars.filter(c => c.status === 'Sold').length,
      avgPrice:  cars.length > 0
        ? Math.round(cars.reduce((a, c) => a + Number(c.price), 0) / cars.length)
        : 0
    };
  },

  async getBrands()     { const c = await this.getAll(); return [...new Set(c.map(x => x.brand))].sort(); },
  async getCategories() { const c = await this.getAll(); return [...new Set(c.map(x => x.category))].sort(); }
};

// ─── CATEGORY STORE ───────────────────────────────────────────────────────────
const CategoryStore = {

  async getAll() {
    const sb = getSupabase(); if (!sb) return [];
    const { data, error } = await sb.from('categories').select('*').order('name',{ascending:true});
    if (error) {
      console.warn('categories fallback:', error.message);
      return (await CarStore.getCategories()).map((name,i)=>({id:i+1,name,status:'Published'}));
    }
    return data || [];
  },

  async add(name, description, thumbnail, status) {
    const sb = getSupabase(); if (!sb) return null;
    const payload = { name: name.trim(), description: description || '', status: status || 'Published' };
    if (thumbnail) payload.thumbnail = thumbnail;
    const { data, error } = await sb.from('categories').insert([payload]).select().single();
    if (error) { console.error('add category:', error); alert('Error: ' + error.message); return null; }
    return data;
  },

  async update(id, fields) {
    const sb = getSupabase(); if (!sb) return null;
    const allowed = ['name','description','thumbnail','status'];
    const payload = {};
    allowed.forEach(k => { if (fields[k] !== undefined) payload[k] = fields[k]; });
    const { data, error } = await sb.from('categories').update(payload).eq('id',parseInt(id)).select().single();
    if (error) { console.error('update category:', error); alert('Error: '+error.message); return null; }
    return data;
  },

  async toggleStatus(id, currentStatus) {
    return this.update(id, { status: currentStatus === 'Published' ? 'Draft' : 'Published' });
  },

  async delete(id) {
    const sb = getSupabase(); if (!sb) return;
    const { error } = await sb.from('categories').delete().eq('id', parseInt(id));
    if (error) console.error('delete category:', error);
  },

  async getCars(categoryName) {
    return (await CarStore.getAll()).filter(c => c.category === categoryName && c.status !== 'Draft');
  }
};

// ─── ORDER STORE ──────────────────────────────────────────────────────────────
const OrderStore = {

  async getAll() {
    const sb = getSupabase(); if (!sb) return [];
    const { data, error } = await sb
      .from('orders')
      .select('*')
      .order('id', { ascending: false });
    if (error) { console.error('getAll orders:', error); return []; }
    return data || [];
  },

  async getById(id) {
    const sb = getSupabase(); if (!sb) return null;
    const { data, error } = await sb
      .from('orders')
      .select('*')
      .eq('id', parseInt(id))
      .single();
    if (error) { console.error('getById order:', error); return null; }
    return data;
  },

  async submit(orderData) {
    const sb = getSupabase(); if (!sb) return null;
    // Always use snake_case to match the DB schema exactly
    const payload = {
      car_id:        orderData.carId        || orderData.car_id        || null,
      car_name:      orderData.carName      || orderData.car_name      || '',
      customer_name: orderData.customerName || orderData.customer_name || '',
      email:         orderData.email        || '',
      phone:         orderData.phone        || '',
      message:       orderData.message      || '',
      total_price:   Number(orderData.totalPrice || orderData.total_price || 0),
      status:        orderData.status       || 'New'
    };
    const { data, error } = await sb
      .from('orders')
      .insert([payload])
      .select()
      .single();
    if (error) { console.error('submit order:', error); return null; }
    return data;
  },

  async delete(id) {
    const sb = getSupabase(); if (!sb) return;
    const { error } = await sb.from('orders').delete().eq('id', parseInt(id));
    if (error) { console.error('delete order:', error); }
  },

  async updateStatus(id, status) {
    const sb = getSupabase(); if (!sb) return;
    const { error } = await sb.from('orders').update({ status }).eq('id', parseInt(id));
    if (error) { console.error('updateStatus order:', error); }
  },

  async getStats() {
    const orders = await this.getAll();
    const closed = orders.filter(o => o.status === 'Closed');
    return {
      total:      orders.length,
      newOrders:  orders.filter(o => o.status === 'New').length,
      inProgress: orders.filter(o => o.status === 'In Progress').length,
      closed:     closed.length,
      revenue:    closed.reduce((a, o) => a + (Number(o.total_price) || 0), 0)
    };
  }
};

// ─── NEWSLETTER STORE ─────────────────────────────────────────────────────────
const NewsletterStore = {
  async subscribe(email) {
    const sb = getSupabase(); if (!sb) return null;
    const { data, error } = await sb
      .from('newsletter')
      .insert([{ email: email.trim().toLowerCase() }])
      .select()
      .single();
    if (error && error.code !== '23505') { // 23505 = unique violation (already subscribed)
      console.error('newsletter subscribe:', error);
      return null;
    }
    return data;
  }
};
