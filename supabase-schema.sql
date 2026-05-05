-- ═══════════════════════════════════════════════════════════
-- CarVoyage — Supabase Database Schema
-- Run this entire file in your Supabase SQL Editor once.
-- ═══════════════════════════════════════════════════════════

-- ── 1. CARS TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cars (
    id           BIGSERIAL PRIMARY KEY,
    name         TEXT        NOT NULL,
    brand        TEXT        NOT NULL,
    category     TEXT        NOT NULL,
    year         INTEGER     NOT NULL,
    price        NUMERIC     NOT NULL,
    mileage      INTEGER     DEFAULT 0,
    fuel         TEXT,
    transmission TEXT,
    color        TEXT,
    engine       TEXT,
    horsepower   INTEGER,
    seats        INTEGER     DEFAULT 5,
    condition    TEXT        DEFAULT 'New',
    status       TEXT        DEFAULT 'Available',
    rating       NUMERIC     DEFAULT 4.5,
    reviews      INTEGER     DEFAULT 0,
    description  TEXT,
    features     TEXT[]      DEFAULT '{}',
    images       TEXT[]      DEFAULT '{}',
    thumbnail    TEXT,
    badge        TEXT,
    date_added   DATE        DEFAULT CURRENT_DATE,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. ORDERS / INQUIRIES TABLE ───────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
    id              BIGSERIAL PRIMARY KEY,
    car_id          BIGINT REFERENCES public.cars(id) ON DELETE SET NULL,
    car_name        TEXT,
    customer_name   TEXT NOT NULL,
    email           TEXT NOT NULL,
    phone           TEXT,
    message         TEXT,
    status          TEXT    DEFAULT 'New',
    total_price     NUMERIC DEFAULT 0,
    date_submitted  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. NEWSLETTER TABLE ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.newsletter (
    id            BIGSERIAL PRIMARY KEY,
    email         TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. ROW LEVEL SECURITY (RLS) ───────────────────────────
ALTER TABLE public.cars       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;

-- CARS: anyone can read; anon key can also write (admin uses same key client-side)
CREATE POLICY "Public read cars"       ON public.cars FOR SELECT USING (true);
CREATE POLICY "Anon insert cars"       ON public.cars FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update cars"       ON public.cars FOR UPDATE USING (true);
CREATE POLICY "Anon delete cars"       ON public.cars FOR DELETE USING (true);

-- ORDERS: anyone can insert (submit inquiry); anyone can read/update/delete (admin)
CREATE POLICY "Public insert orders"   ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon read orders"       ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anon update orders"     ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Anon delete orders"     ON public.orders FOR DELETE USING (true);

-- NEWSLETTER: anyone can subscribe
CREATE POLICY "Public subscribe"       ON public.newsletter FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon read newsletter"   ON public.newsletter FOR SELECT USING (true);

-- ── 5. SEED DATA — Initial Car Inventory ──────────────────
INSERT INTO public.cars
    (name, brand, category, year, price, mileage, fuel, transmission, color, engine, horsepower, seats, condition, status, rating, reviews, description, features, images, thumbnail, badge)
VALUES
(
    '2024 Tesla Model 3', 'Tesla', 'Sedan', 2024, 42500, 12000,
    'Electric', 'Automatic', 'Pearl White', 'Dual Motor AWD', 358, 5,
    'New', 'Available', 4.9, 28,
    'The Tesla Model 3 is the world''s best-selling electric vehicle. With over 350 miles of range, Autopilot capability, and a stunning minimalist interior, it''s the perfect blend of performance and sustainability.',
    ARRAY['Autopilot', 'Wireless Charging', 'Premium Sound', 'Glass Roof', 'OTA Updates', 'FSD Ready'],
    ARRAY['assets/media/blog/blog-1.jpg', 'assets/media/popular-cars/full-img-1.png'],
    'assets/media/blog/blog-1.jpg', 'Hot Deal'
),
(
    '2024 Jeep Cherokee', 'Jeep', 'SUV', 2024, 38900, 8500,
    'Petrol', 'Automatic', 'Granite Crystal', '2.0L Turbo I4', 270, 5,
    'New', 'Available', 4.7, 15,
    'The 2024 Jeep Cherokee combines legendary off-road capability with modern comfort and technology. Perfect for adventure seekers who refuse to compromise on luxury.',
    ARRAY['4WD', 'Apple CarPlay', 'Heated Seats', 'Blind Spot Monitor', 'Tow Package', 'Sunroof'],
    ARRAY['assets/media/blog/blog-2.jpg', 'assets/media/popular-cars/full-img-2.png'],
    'assets/media/blog/blog-2.jpg', 'Popular'
),
(
    '2024 Ford Escape', 'Ford', 'SUV', 2024, 31200, 5000,
    'Hybrid', 'Automatic', 'Iconic Silver', '2.5L Atkinson Cycle I4', 200, 5,
    'New', 'Available', 4.6, 22,
    'The 2024 Ford Escape Hybrid delivers exceptional fuel economy without sacrificing performance. With its spacious cargo area and advanced driver assistance, it''s the smart family choice.',
    ARRAY['Hybrid Powertrain', 'Ford Co-Pilot 360', 'Wireless CarPlay', 'Adaptive Cruise', 'Parking Assist'],
    ARRAY['assets/media/blog/blog-3.jpg', 'assets/media/popular-cars/full-img-3.png'],
    'assets/media/blog/blog-3.jpg', NULL
),
(
    'Subaru Outback', 'Subaru', 'Wagon', 2023, 34500, 22000,
    'Petrol', 'Automatic', 'Autumn Green', '2.5L BOXER H4', 182, 5,
    'Used', 'Available', 4.8, 41,
    'The Subaru Outback is the original crossover — rugged enough for the trails, refined enough for the city. With standard AWD and 8.7 inches of ground clearance, adventure is always within reach.',
    ARRAY['Symmetrical AWD', 'EyeSight Safety', 'X-Mode', 'StarTex Upholstery', 'Dual-Zone Climate'],
    ARRAY['assets/media/blog/blog-4.jpg', 'assets/media/popular-cars/full-img-4.png'],
    'assets/media/blog/blog-4.jpg', 'Best Value'
),
(
    '2024 Acura MDX', 'Acura', 'SUV', 2024, 57000, 3200,
    'Petrol', 'Automatic', 'Majestic Black Pearl', '3.5L V6 SOHC VTEC', 290, 7,
    'New', 'Available', 4.9, 17,
    'The 2024 Acura MDX is the pinnacle of three-row luxury SUVs. With a bespoke 25-speaker audio system and Type S performance DNA, it redefines what a family SUV can be.',
    ARRAY['Super Handling-AWD', '25-Speaker ELS Studio 3D', 'Head-Up Display', 'Wireless Charging', '3 Rows'],
    ARRAY['assets/media/blog/blog-5.jpg', 'assets/media/popular-cars/full-img-5.png'],
    'assets/media/blog/blog-5.jpg', 'Luxury'
),
(
    '2024 Honda Accord', 'Honda', 'Sedan', 2024, 29800, 7800,
    'Hybrid', 'eCVT', 'Sonic Gray Pearl', '2.0L DOHC i-VTEC', 204, 5,
    'New', 'Available', 4.7, 34,
    'The 2024 Honda Accord Hybrid sets the bar for midsize sedans. With 46 mpg combined, an elegant interior, and Honda Sensing safety suite standard, it''s efficiency without compromise.',
    ARRAY['Honda Sensing', 'Google Built-In', 'Heated Seats', 'Remote Start', 'Traffic Jam Assist'],
    ARRAY['assets/media/blog/blog-6.jpg', 'assets/media/popular-cars/full-img-1.png'],
    'assets/media/blog/blog-6.jpg', NULL
),
(
    '2024 Porsche Macan', 'Porsche', 'SUV', 2024, 68500, 1500,
    'Electric', 'Automatic', 'Frozen Blue Metallic', 'Dual Motor Electric', 603, 5,
    'New', 'Available', 5.0, 9,
    'The all-new 2024 Porsche Macan is the first fully electric Macan. With 603 hp in Turbo guise, 0-60 in 3.1 seconds, and iconic Porsche driving dynamics, this SUV makes no concessions.',
    ARRAY['800V Architecture', 'Porsche Active Suspension', 'Augmented Reality HUD', 'Matrix LED', 'Rear-Wheel Steering'],
    ARRAY['assets/media/blog/blog-7.jpg', 'assets/media/popular-cars/full-img-2.png'],
    'assets/media/blog/blog-7.jpg', 'New Arrival'
),
(
    '2024 Kia Sportage', 'Kia', 'SUV', 2024, 27900, 11000,
    'Petrol', 'Automatic', 'Interstellar Gray', '1.6L Turbo I4', 180, 5,
    'New', 'Available', 4.5, 28,
    'The 2024 Kia Sportage is bold, stylish, and packed with technology at an outstanding price. With segment-first dual panoramic displays and available plug-in hybrid powertrain, it punches above its price point.',
    ARRAY['Dual Panoramic Screen', 'Harman Kardon Audio', 'Ventilated Seats', 'Highway Driving Assist', 'Wireless CarPlay'],
    ARRAY['assets/media/blog/blog-8.jpg', 'assets/media/popular-cars/full-img-3.png'],
    'assets/media/blog/blog-8.jpg', NULL
),
(
    '2024 Toyota Camry', 'Toyota', 'Sedan', 2024, 32100, 6200,
    'Hybrid', 'Automatic', 'Midnight Black Metallic', '2.5L 4-Cylinder Hybrid', 225, 5,
    'New', 'Available', 4.8, 52,
    'The 2024 Toyota Camry has been completely redesigned with a bold new look. Standard hybrid powertrain delivers remarkable fuel efficiency with no compromise in performance.',
    ARRAY['Toyota Safety Sense 3.0', '8-inch Touchscreen', 'JBL Audio', 'Digital Rearview Mirror', 'AWD Hybrid'],
    ARRAY['assets/media/blog/blog-1.jpg', 'assets/media/popular-cars/full-img-4.png'],
    'assets/media/blog/blog-1.jpg', 'Editor''s Choice'
),
(
    '2024 Mazda CX-5', 'Mazda', 'SUV', 2024, 36700, 4300,
    'Petrol', 'Automatic', 'Soul Red Crystal', '2.5L Turbocharged I4', 256, 5,
    'New', 'Available', 4.8, 44,
    'The 2024 Mazda CX-5 is a premium compact SUV that delivers car-like handling with SUV practicality. With its stunning Soul Red Crystal paint and hand-crafted interior, it''s a driver''s SUV like no other.',
    ARRAY['Skyactiv-G Turbo', 'Bose 10-Speaker Audio', 'Head-Up Display', 'Driver Attention Alert', '360° View Monitor'],
    ARRAY['assets/media/blog/blog-2.jpg', 'assets/media/popular-cars/full-img-5.png'],
    'assets/media/blog/blog-2.jpg', NULL
);

-- ── 6. SEED SAMPLE ORDERS ─────────────────────────────────
INSERT INTO public.orders (car_id, car_name, customer_name, email, phone, message, status, total_price)
VALUES
(1, '2024 Tesla Model 3',  'James Anderson', 'james@example.com',        '+1 (555) 234-5678', 'I''m very interested in the Tesla Model 3. Can we arrange a test drive this weekend?', 'New',         42500),
(5, '2024 Acura MDX',      'Sarah Collins',  'sarah.collins@email.com',  '+1 (555) 876-5432', 'Looking for a 3-row family SUV. The MDX seems perfect. What financing options are available?', 'In Progress', 57000),
(7, '2024 Porsche Macan',  'Michael Torres', 'm.torres@business.com',    '+1 (555) 123-9876', 'I want to purchase the Porsche Macan EV. I can pay cash. What''s the fastest way to complete the deal?', 'Closed', 68500);

-- ── 7. CATEGORIES TABLE ────────────────────────────────────────────────────────
-- Run this in your Supabase SQL Editor to add category management support.

CREATE TABLE IF NOT EXISTS public.categories (
    id          BIGSERIAL    PRIMARY KEY,
    name        TEXT         UNIQUE NOT NULL,
    description TEXT         DEFAULT '',
    created_at  TIMESTAMPTZ  DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Anyone can read; anon key can write (admin manages categories client-side)
CREATE POLICY "Anyone can read categories"  ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anon can insert categories"  ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon can delete categories"  ON public.categories FOR DELETE USING (true);
CREATE POLICY "Anon can update categories"  ON public.categories FOR UPDATE USING (true);

-- Seed default categories (skip if already exist due to UNIQUE constraint)
INSERT INTO public.categories (name, description) VALUES
    ('Sedan',       'Standard four-door car with separate trunk')
   ,('SUV',         'Sport Utility Vehicle — spacious and versatile')
   ,('Coupe',       'Sleek two-door body style')
   ,('Wagon',       'Estate/Station wagon with extended cargo area')
   ,('Sports',      'High-performance sports and muscle cars')
   ,('Truck',       'Pickup trucks and commercial vehicles')
   ,('Van',         'Minivans and passenger vans')
   ,('Hatchback',   'Compact car with rear hatch door')
   ,('Convertible', 'Open-top / cabriolet body style')
   ,('Electric',    'Fully electric powered vehicles')
   ,('Hybrid',      'Combined petrol and electric powertrain')
   ,('Luxury',      'Premium and luxury segment vehicles')
ON CONFLICT (name) DO NOTHING;
