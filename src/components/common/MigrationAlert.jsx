import React from 'react';
import { AlertTriangle, Database, ExternalLink, X } from 'lucide-react';

const MigrationAlert = () => {
  const [dismissed, setDismissed] = React.useState(() => {
    return localStorage.getItem('migration_historique_dismissed') === 'true';
  });

  const handleDismiss = () => {
    localStorage.setItem('migration_historique_dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 mb-6 shadow-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-8 w-8 text-red-600 animate-pulse" />
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-red-900">
              🚨 ACTION REQUISE : Migration Base de Données
            </h3>
            <button
              onClick={handleDismiss}
              className="text-red-600 hover:text-red-800 transition-colors"
              title="Fermer"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="bg-white border-2 border-red-300 rounded-lg p-4 mb-4">
            <p className="text-base font-bold text-red-800 mb-2">
              ⚠️ L'HISTORIQUE DES PROSPECTS N'EST PAS ENREGISTRÉ !
            </p>
            <p className="text-sm text-red-700">
              En attendant la migration SQL, l'historique est stocké <strong>temporairement</strong> dans votre navigateur (LocalStorage). 
              Il sera <strong>perdu</strong> si vous videz le cache ou changez de navigateur.
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="font-bold text-yellow-900 mb-2 text-lg">📋 Solution : Exécuter le Script SQL (5 minutes)</p>
            <ol className="list-decimal ml-5 space-y-2 text-sm text-yellow-800">
              <li>
                <strong>Ouvrir Supabase :</strong>{' '}
                <a 
                  href="https://app.supabase.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  app.supabase.com <ExternalLink size={14} />
                </a>
              </li>
              <li><strong>Sélectionner</strong> le projet : <code className="bg-yellow-200 px-2 py-0.5 rounded font-mono text-xs">ynoxsibapzatlxhmredp</code></li>
              <li><strong>Cliquer</strong> sur <span className="bg-yellow-200 px-2 py-0.5 rounded font-semibold">SQL Editor</span> (menu gauche)</li>
              <li><strong>Cliquer</strong> sur <span className="bg-yellow-200 px-2 py-0.5 rounded font-semibold">+ New Query</span></li>
              <li><strong>Ouvrir</strong> le fichier <code className="bg-yellow-200 px-2 py-0.5 rounded font-mono text-xs">supabase_migration_historique.sql</code></li>
              <li><strong>Copier</strong> TOUT le contenu (Ctrl+A puis Ctrl+C)</li>
              <li><strong>Coller</strong> dans Supabase SQL Editor (Ctrl+V)</li>
              <li><strong>Cliquer</strong> sur le bouton <span className="bg-green-600 text-white px-3 py-1 rounded font-semibold">RUN</span></li>
              <li><strong>Vérifier</strong> le message de succès : "✅ Migration terminée avec succès!"</li>
              <li><strong>Recharger</strong> cette page (F5)</li>
            </ol>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>📖 Documentation détaillée :</strong>
            </p>
            <ul className="mt-2 space-y-1 text-sm text-blue-700">
              <li>• <code className="bg-blue-200 px-2 py-0.5 rounded">GUIDE_RAPIDE.md</code> - Instructions pas à pas</li>
              <li>• <code className="bg-blue-200 px-2 py-0.5 rounded">README_FINAL.md</code> - Vue d'ensemble complète</li>
              <li>• <code className="bg-blue-200 px-2 py-0.5 rounded">MIGRATION_HISTORIQUE.md</code> - Détails techniques</li>
            </ul>
          </div>

          <div className="flex gap-3 mt-4">
            <a
              href="https://app.supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white text-base font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg"
            >
              <Database size={20} />
              Ouvrir Supabase Maintenant
              <ExternalLink size={16} />
            </a>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-red-800 text-sm font-medium hover:bg-red-100 rounded-lg transition-colors border-2 border-red-300"
            >
              Masquer ce message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationAlert;
