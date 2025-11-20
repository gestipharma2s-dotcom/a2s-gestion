import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationContainer from '../common/NotificationContainer';
import Dashboard from '../dashboard/Dashboard';
import ProspectsList from '../prospects/ProspectsList';
import ClientsList from '../clients/ClientsList';
import InstallationsList from '../installations/InstallationsList';
import AbonnementsList from '../abonnements/AbonnementsList';
import PaiementsList from '../paiements/PaiementsList';
import InterventionsList from '../support/InterventionsList';
import AlertesList from '../alertes/AlertesList';
import ApplicationsList from '../applications/ApplicationsList';
import UsersList from '../utilisateurs/UsersList';
import ProtectedRoute from '../auth/ProtectedRoute';
import { PAGES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const [currentPage, setCurrentPage] = useState(PAGES.DASHBOARD);
  const { hasAccess, profile } = useAuth();

  // 📍 Initialiser sur la bonne page au chargement
  React.useEffect(() => {
    if (profile) {
      // ✅ Admin et Super Admin → toujours sur le dashboard
      if (profile.role === 'admin' || profile.role === 'super_admin') {
        setCurrentPage(PAGES.DASHBOARD);
        console.log(`✅ ${profile.role} → Dashboard`);
        return;
      }

      // ✅ Autres rôles → première page accessible depuis pages_visibles
      if (profile?.pages_visibles && profile.pages_visibles.length > 0) {
        const firstPage = profile.pages_visibles[0];
        
        // Mapper le nom à la clé PAGES
        const pageKey = Object.values(PAGES).find(page => 
          page.toLowerCase() === firstPage.toLowerCase()
        );
        
        if (pageKey) {
          console.log(`✅ Redirection vers: ${pageKey}`);
          setCurrentPage(pageKey);
        }
      }
    }
  }, [profile]);

  const pageConfig = {
    [PAGES.DASHBOARD]: {
      title: 'Tableau de Bord',
      subtitle: 'Vue d\'ensemble de votre activité',
      component: Dashboard
    },
    [PAGES.PROSPECTS]: {
      title: 'Gestion des Prospects',
      subtitle: 'Suivi du pipeline commercial',
      component: ProspectsList
    },
    [PAGES.CLIENTS]: {
      title: 'Clients',
      subtitle: 'Base de clients actifs',
      component: ClientsList
    },
    [PAGES.INSTALLATIONS]: {
      title: 'Installations',
      subtitle: 'Suivi des déploiements',
      component: InstallationsList
    },
    [PAGES.ABONNEMENTS]: {
      title: 'Abonnements',
      subtitle: 'Renouvellements et alertes',
      component: AbonnementsList
    },
    [PAGES.PAIEMENTS]: {
      title: 'Paiements',
      subtitle: 'Historique des transactions',
      component: PaiementsList
    },
    [PAGES.SUPPORT]: {
      title: 'Support Technique',
      subtitle: 'Interventions et tickets',
      component: InterventionsList
    },
    [PAGES.ALERTES]: {
      title: 'Alertes',
      subtitle: 'Notifications importantes',
      component: AlertesList
    },
    [PAGES.APPLICATIONS]: {
      title: 'Applications',
      subtitle: 'Catalogue de logiciels',
      component: ApplicationsList
    },
    [PAGES.UTILISATEURS]: {
      title: 'Utilisateurs',
      subtitle: 'Gestion des comptes',
      component: UsersList
    }
  };

  const config = pageConfig[currentPage];
  const PageComponent = config.component;

  // ✅ Admin et Super Admin voient TOUJOURS le dashboard directement
  if (profile?.role === 'admin' || profile?.role === 'super_admin') {
    return (
      <>
        <NotificationContainer />
        <div className="flex h-screen bg-gray-50">
          <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header title={config.title} subtitle={config.subtitle} />
            
            <main className="flex-1 overflow-y-auto p-6">
              <PageComponent />
            </main>
          </div>
        </div>
      </>
    );
  }

  // ✅ Vérifier l'accès à la page actuelle pour les autres rôles
  if (!hasAccess(currentPage)) {
    // Afficher "Accès Refusé" pour toutes les pages
    return (
      <>
        <NotificationContainer />
        <div className="flex h-screen bg-gray-50">
          <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header title="Accès Refusé" subtitle="Vous n'avez pas accès à cette page" />
            
            <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
              <div className="max-w-md w-full text-center bg-white rounded-lg shadow p-8">
                <div className="text-5xl mb-4">🔒</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Accès Refusé</h2>
                <p className="text-gray-600 mb-4">
                  Vous n'avez pas accès à cette page.
                </p>
                <button
                  onClick={() => {
                    // Rediriger vers la première page accessible
                    if (profile?.pages_visibles && profile.pages_visibles.length > 0) {
                      const firstPage = profile.pages_visibles[0];
                      const pageKey = Object.values(PAGES).find(page => 
                        page.toLowerCase() === firstPage.toLowerCase()
                      );
                      if (pageKey) setCurrentPage(pageKey);
                    }
                  }}
                  className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Retour à ma page d'accueil
                </button>
              </div>
            </main>
          </div>
        </div>
      </>
    );
  }

  // ✅ Si l'utilisateur a accès, afficher la page normalement
  return (
    <>
      <NotificationContainer />
      <div className="flex h-screen bg-gray-50">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={config.title} subtitle={config.subtitle} />
          
          <main className="flex-1 overflow-y-auto p-6">
            <PageComponent />
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;