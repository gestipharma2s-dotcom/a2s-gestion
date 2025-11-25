-- Migration: Ajouter les colonnes de permissions granulaires à la table users
-- Date: 2025-11-23
-- Description: Ajouter les colonnes can_create_*, can_edit_*, can_delete_* pour toutes les pages

-- Prospects
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_create_prospects BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_edit_prospects BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_delete_prospects BOOLEAN DEFAULT false;

-- Clients
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_create_clients BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_edit_clients BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_delete_clients BOOLEAN DEFAULT false;

-- Installations
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_create_installations BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_edit_installations BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_delete_installations BOOLEAN DEFAULT false;

-- Abonnements
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_create_abonnements BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_edit_abonnements BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_delete_abonnements BOOLEAN DEFAULT false;

-- Paiements
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_create_paiements BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_edit_paiements BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_delete_paiements BOOLEAN DEFAULT false;

-- Support (Interventions)
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_create_support BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_edit_support BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_delete_support BOOLEAN DEFAULT false;

-- Missions
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_create_missions BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_edit_missions BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_delete_missions BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_close_missions BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_validate_missions BOOLEAN DEFAULT false;

-- Alertes
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_create_alertes BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_edit_alertes BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_delete_alertes BOOLEAN DEFAULT false;

-- Applications
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_create_applications BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_edit_applications BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS can_delete_applications BOOLEAN DEFAULT false;

-- Exécuter dans la console Supabase SQL
-- Cette migration ajoute toutes les colonnes de permissions granulaires à la table users
-- Chaque colonne a une valeur par défaut de false
