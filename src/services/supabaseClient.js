import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Gestion des événements d'authentification
let unsubscribe = null;

export function setupAuthListener() {
  unsubscribe = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      console.log('🔑 Utilisateur déconnecté');
      // Ne pas rediriger automatiquement - laisser le composant gérer
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('🔑 Token actualisé');
    } else if (event === 'USER_UPDATED') {
      console.log('🔑 Utilisateur mis à jour');
    } else if (event === 'SIGNED_IN') {
      console.log('🔑 Utilisateur connecté');
    }
  });
}

export function cleanupAuthListener() {
  if (unsubscribe) {
    unsubscribe();
  }
}

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