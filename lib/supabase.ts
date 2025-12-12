import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          wallet_address: string;
          username: string | null;
          level: number;
          total_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          username?: string | null;
          level?: number;
          total_points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          username?: string | null;
          level?: number;
          total_points?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          address: string | null;
          latitude: number;
          longitude: number;
          category: string;
          base_rarity: number;
          created_at: string;
        };
      };
      check_ins: {
        Row: {
          id: string;
          user_id: string;
          location_id: string;
          timestamp: string;
          nft_token_id: string | null;
          rarity_score: number | null;
          transaction_hash: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          location_id: string;
          timestamp?: string;
          nft_token_id?: string | null;
          rarity_score?: number | null;
          transaction_hash?: string | null;
        };
      };
      quests: {
        Row: {
          id: string;
          title: string;
          description: string;
          quest_type: string;
          requirements: any;
          reward_amount: number;
          active_from: string;
          active_until: string;
          created_at: string;
        };
      };
      user_quests: {
        Row: {
          id: string;
          user_id: string;
          quest_id: string;
          progress: number;
          status: string;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quest_id: string;
          progress?: number;
          status?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          progress?: number;
          status?: string;
          completed_at?: string | null;
        };
      };
      location_stats: {
        Row: {
          location_id: string;
          total_check_ins: number;
          last_check_in: string | null;
          updated_at: string;
        };
      };
    };
  };
};
