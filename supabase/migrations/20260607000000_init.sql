-- 1. Table des utilisateurs (profils liés à auth.users)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Active le Row Level Security (RLS)
alter table public.users enable row level security;

-- Création des politiques RLS
create policy "Users can view their own profile" 
  on public.users for select 
  using (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.users for update 
  using (auth.uid() = id);

-- 2. Table des abonnements (Stripe Sync via Webhooks)
create type subscription_status as enum ('active', 'trialing', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid');

create table if not exists public.subscriptions (
  id text primary key, -- Stripe Subscription ID
  user_id uuid references public.users(id) on delete cascade not null,
  status subscription_status not null,
  price_id text,
  cancel_at_period_end boolean default false,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subscriptions enable row level security;

create policy "Users can view their own subscription" 
  on public.subscriptions for select 
  using (auth.uid() = user_id);

-- 3. Table des générations de CV / Lettre de motivation
create table if not exists public.generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  job_title text not null,
  job_description text not null,
  original_resume_text text not null,
  optimized_data jsonb not null, -- Données structurées générées par l'IA stockées en JSONB
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.generations enable row level security;

create policy "Users can view their own generations" 
  on public.generations for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own generations" 
  on public.generations for insert 
  with check (auth.uid() = user_id);

-- 4. Trigger pour créer automatiquement un profil utilisateur lors de l'inscription dans auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
