import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export { supabaseUrl, supabaseAnonKey };

// Configuration des tables
export const TABLES = {
  PROSPECTS: 'prospects',
  INSTALLATIONS: 'installations',
  ABONNEMENTS: 'abonnements',
  PAIEMENTS: 'paiements',
  INTERVENTIONS: 'interventions',
  USERS: 'users',
  APPLICATIONS: 'applications',
  HISTORIQUE_ACTIONS: 'prospect_history'  // ✅ CORRIGÉ: 'prospect_history' au lieu de 'historique_actions'
};