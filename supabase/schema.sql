-- =============================================
-- Golf Charity Subscription Platform - Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT CHECK (plan_type IN ('monthly', 'yearly')) DEFAULT 'monthly',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Scores table
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER CHECK (score >= 1 AND score <= 45) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Charities table
CREATE TABLE IF NOT EXISTS public.charities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT
);

-- 4. User charity selections
CREATE TABLE IF NOT EXISTS public.user_charity_selections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  charity_id UUID REFERENCES public.charities(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Draws table
CREATE TABLE IF NOT EXISTS public.draws (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_date DATE DEFAULT CURRENT_DATE,
  numbers INTEGER[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Winners table
CREATE TABLE IF NOT EXISTS public.winners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE,
  match_count INTEGER CHECK (match_count IN (3, 4, 5)) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_charity_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- Subscriptions: users can read/insert/update their own
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Scores: users can manage their own
CREATE POLICY "Users can view own scores" ON public.scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own scores" ON public.scores FOR DELETE USING (auth.uid() = user_id);

-- Charities: everyone can read
CREATE POLICY "Anyone can view charities" ON public.charities FOR SELECT TO authenticated, anon USING (true);

-- User charity selections: users can manage their own
CREATE POLICY "Users can view own charity selection" ON public.user_charity_selections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own charity selection" ON public.user_charity_selections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own charity selection" ON public.user_charity_selections FOR UPDATE USING (auth.uid() = user_id);

-- Draws: everyone can read
CREATE POLICY "Anyone can view draws" ON public.draws FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert draws" ON public.draws FOR INSERT TO authenticated WITH CHECK (true);

-- Winners: users can read their own, admin can read all (handled at API level)
CREATE POLICY "Users can view own winnings" ON public.winners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated can insert winners" ON public.winners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone can view all winners" ON public.winners FOR SELECT TO authenticated USING (true);

-- =============================================
-- Seed: Sample Charities
-- =============================================

INSERT INTO public.charities (name, description, image_url) VALUES
  ('Green Fairways Foundation', 'Dedicated to making golf accessible to underprivileged youth through free coaching programs and equipment donations.', 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop'),
  ('Ocean Conservation Trust', 'Protecting marine ecosystems and coastal habitats through research, cleanup initiatives, and community education.', 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&h=300&fit=crop'),
  ('Children''s Education Fund', 'Providing quality education, school supplies, and scholarships to children in underserved communities worldwide.', 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=300&fit=crop'),
  ('Wildlife Rescue Alliance', 'Rescuing, rehabilitating, and releasing injured wildlife while preserving natural habitats across the globe.', 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=400&h=300&fit=crop'),
  ('Mental Health Awareness', 'Breaking stigma and providing accessible mental health resources, counseling, and support groups for all ages.', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop'),
  ('Clean Water Initiative', 'Building sustainable water systems and purification infrastructure in communities lacking access to clean drinking water.', 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=400&h=300&fit=crop');

-- =============================================
-- Admin: scores select all policy for draw system
-- =============================================
CREATE POLICY "Admin can view all scores" ON public.scores FOR SELECT TO authenticated USING (true);
