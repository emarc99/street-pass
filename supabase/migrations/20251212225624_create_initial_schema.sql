/*
  # StreetPass Initial Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `wallet_address` (text, unique, not null) - User's wallet address
      - `username` (text, unique) - Display name
      - `level` (integer, default 1) - User level based on activity
      - `total_points` (integer, default 0) - Accumulated points
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `locations`
      - `id` (uuid, primary key)
      - `name` (text, not null) - Location name
      - `description` (text) - Location description
      - `address` (text) - Physical address
      - `latitude` (numeric, not null) - GPS latitude
      - `longitude` (numeric, not null) - GPS longitude
      - `category` (text, not null) - Location category (cafe, landmark, park, etc.)
      - `base_rarity` (integer, default 1) - Base rarity tier (1-4)
      - `created_at` (timestamptz) - Creation timestamp

    - `check_ins`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users) - User who checked in
      - `location_id` (uuid, references locations) - Location checked into
      - `timestamp` (timestamptz, not null) - Check-in time
      - `nft_token_id` (text) - Minted NFT token ID
      - `rarity_score` (integer) - Calculated rarity at check-in
      - `transaction_hash` (text) - Blockchain transaction hash

    - `quests`
      - `id` (uuid, primary key)
      - `title` (text, not null) - Quest title
      - `description` (text, not null) - Quest description
      - `quest_type` (text, not null) - Type: visit_count, visit_category, visit_specific
      - `requirements` (jsonb, not null) - Quest requirements as JSON
      - `reward_amount` (integer, not null) - Reward tokens
      - `active_from` (timestamptz, not null) - Quest start time
      - `active_until` (timestamptz, not null) - Quest end time
      - `created_at` (timestamptz) - Creation timestamp

    - `user_quests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users) - User attempting quest
      - `quest_id` (uuid, references quests) - Quest being attempted
      - `progress` (integer, default 0) - Current progress
      - `status` (text, default 'active') - Status: active, completed, expired
      - `completed_at` (timestamptz) - Completion timestamp
      - `created_at` (timestamptz) - Start timestamp

    - `location_stats`
      - `location_id` (uuid, primary key, references locations) - Location reference
      - `total_check_ins` (integer, default 0) - Total check-ins at location
      - `last_check_in` (timestamptz) - Most recent check-in
      - `updated_at` (timestamptz) - Last update

  2. Security
    - Enable RLS on all tables
    - Users can read all public data (locations, quests)
    - Users can only modify their own data (check-ins, user_quests)
    - Users can read other users' public profiles
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  username text UNIQUE,
  level integer DEFAULT 1,
  total_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  address text,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  category text NOT NULL,
  base_rarity integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create check_ins table
CREATE TABLE IF NOT EXISTS check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE NOT NULL,
  timestamp timestamptz DEFAULT now() NOT NULL,
  nft_token_id text,
  rarity_score integer,
  transaction_hash text,
  UNIQUE(user_id, location_id, timestamp)
);

-- Create quests table
CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  quest_type text NOT NULL,
  requirements jsonb NOT NULL,
  reward_amount integer NOT NULL,
  active_from timestamptz NOT NULL,
  active_until timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_quests table
CREATE TABLE IF NOT EXISTS user_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  quest_id uuid REFERENCES quests(id) ON DELETE CASCADE NOT NULL,
  progress integer DEFAULT 0,
  status text DEFAULT 'active',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, quest_id)
);

-- Create location_stats table
CREATE TABLE IF NOT EXISTS location_stats (
  location_id uuid PRIMARY KEY REFERENCES locations(id) ON DELETE CASCADE,
  total_check_ins integer DEFAULT 0,
  last_check_in timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_location_id ON check_ins(location_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_timestamp ON check_ins(timestamp);
CREATE INDEX IF NOT EXISTS idx_locations_coordinates ON locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_user_quests_user_id ON user_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_quest_id ON user_quests(quest_id);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read all profiles"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- RLS Policies for locations table (public read)
CREATE POLICY "Anyone can read locations"
  ON locations FOR SELECT
  USING (true);

-- RLS Policies for check_ins table
CREATE POLICY "Users can read all check-ins"
  ON check_ins FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own check-ins"
  ON check_ins FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
  ));

-- RLS Policies for quests table (public read)
CREATE POLICY "Anyone can read quests"
  ON quests FOR SELECT
  USING (true);

-- RLS Policies for user_quests table
CREATE POLICY "Users can read all user quests"
  ON user_quests FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own quest progress"
  ON user_quests FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
  ));

CREATE POLICY "Users can update own quest progress"
  ON user_quests FOR UPDATE
  USING (user_id IN (
    SELECT id FROM users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
  ))
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
  ));

-- RLS Policies for location_stats table (public read)
CREATE POLICY "Anyone can read location stats"
  ON location_stats FOR SELECT
  USING (true);

-- Function to update user level based on points
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level := FLOOR(NEW.total_points / 100) + 1;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_level
  BEFORE UPDATE OF total_points ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_level();

-- Function to update location stats after check-in
CREATE OR REPLACE FUNCTION update_location_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO location_stats (location_id, total_check_ins, last_check_in, updated_at)
  VALUES (NEW.location_id, 1, NEW.timestamp, now())
  ON CONFLICT (location_id)
  DO UPDATE SET
    total_check_ins = location_stats.total_check_ins + 1,
    last_check_in = NEW.timestamp,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_location_stats
  AFTER INSERT ON check_ins
  FOR EACH ROW
  EXECUTE FUNCTION update_location_stats();