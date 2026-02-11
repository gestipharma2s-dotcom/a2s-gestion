-- Migration: Add montant_abonnement to installations table
-- Date: 2026-02-10
-- Description: Add montant_abonnement field to allow per-installation subscription amounts

-- 1. Add montant_abonnement column to installations table
ALTER TABLE installations
ADD COLUMN IF NOT EXISTS montant_abonnement NUMERIC(12, 2) DEFAULT 0;

-- 2. Add comment for clarity
COMMENT ON COLUMN installations.montant_abonnement IS 'Montant mensuel de l''abonnement spécifique pour cette installation';

-- 3. Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'installations' 
AND column_name = 'montant_abonnement';

-- 4. Set existing montant_abonnement values to 0 (already done by DEFAULT)
-- UPDATE installations SET montant_abonnement = 0 WHERE montant_abonnement IS NULL;

-- Migration complete!
-- Usage: 
--   - When creating an installation, provide both montant (acquisition cost) and montant_abonnement (monthly subscription cost)
--   - When creating a subscription from an installation, it will use the installation's montant_abonnement instead of the application's prix_abonnement
