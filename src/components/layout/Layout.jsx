import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import MissionsDashboard from '../missions/MissionsDashboard';
import AlertesList from '../alertes/AlertesList';
import ApplicationsList from '../applications/ApplicationsList';
import UsersList from '../utilisateurs/UsersList';
import ProtectedRoute from '../auth/ProtectedRoute';
import WelcomePage from './WelcomePage';
import ChangePassword from '../auth/ChangePassword';
import { PAGES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const [currentPage, setCurrentPage] = useState(PAGES.DASHBOARD);
  const { hasAccess, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  // Ref to prevent the two sync effects from triggering each other
  const isNavigatingRef = React.useRef(false);

  // 🔄 SYNC: URL -> State (Navigation externe, e.g. browser back/forward)
  useEffect(() => {
    if (isNavigatingRef.current) {
      isNavigatingRef.current = false;
      return;
    }
    const path = location.pathname.substring(1);
    if (path === '') return;
    const foundPage = Object.values(PAGES).find(p => p === path);
    if (foundPage && foundPage !== currentPage) {
      setCurrentPage(foundPage);
    }
  }, [location.pathname]);

  // 🔄 SYNC: State -> URL (Navigation Sidebar)
  useEffect(() => {
    if (!currentPage) return;
    const currentPath = location.pathname.substring(1);
    if (currentPath !== currentPage) {
      isNavigatingRef.current = true;
      navigate(`/${currentPage}`, { replace: true });
    }
  }, [currentPage]);

  // 📍 Initialiser sur la bonne page au chargement
  useEffect(() => {
    if (profile) {
      if (profile.role === 'admin' || profile.role === 'super_admin') {
        setCurrentPage(PAGES.DASHBOARD);
      }
      // Autres rôles → restent sur PAGES.DASHBOARD et verront la page de Bienvenue
    }
  }, [profile?.id, profile?.role]); // Dépend seulement de l'ID/rôle, pas de l'objet entier

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
      title: '🎧 Support Technique',
      subtitle: 'Interventions et tickets',
      component: InterventionsList
    },
    [PAGES.MISSIONS]: {
      title: '📊 Tableau de Bord Missions',
      subtitle: 'Suivi statistique et financier en temps réel',
      component: MissionsDashboard
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
    },
    [PAGES.CHANGE_PASSWORD]: {
      title: 'Mon Compte',
      subtitle: 'Changer mon mot de passe',
      component: ChangePassword
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

          <div className="flex-1 flex flex-col h-full w-full overflow-x-hidden relative">
            <Header title={config.title} subtitle={config.subtitle} />

            <main className="flex-1 overflow-y-auto p-3 md:p-6 bg-gray-50">
              <PageComponent />
            </main>
          </div>
        </div>
      </>
    );
  }

  // ✅ Vérifier l'accès à la page actuelle pour les autres rôles (Accès libre pour changer le mot de passe)
  if (!hasAccess(currentPage) && currentPage !== PAGES.CHANGE_PASSWORD) {
    // Si on est sur le Dashboard et qu'on n'y a pas accès, on affiche la page de Bienvenue
    if (currentPage === PAGES.DASHBOARD) {
      return (
        <>
          <NotificationContainer />
          <div className="flex h-screen bg-gray-50">
            <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
            <div className="flex-1 flex flex-col h-full w-full overflow-x-hidden relative">
              <Header title="Bienvenue" subtitle="Modules A2S Gestion" />
              <main className="flex-1 overflow-y-auto bg-gray-50">
                <WelcomePage setCurrentPage={setCurrentPage} />
              </main>
            </div>
          </div>
        </>
      );
    }

    // Afficher "Accès Refusé" pour toutes les autres pages
    return (
      <>
        <NotificationContainer />
        <div className="flex h-screen bg-gray-50">
          <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

          <div className="flex-1 flex flex-col h-full w-full overflow-x-hidden relative">
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

        <div className="flex-1 flex flex-col h-full w-full overflow-x-hidden relative">
          <Header title={config.title} subtitle={config.subtitle} />

          <main className="flex-1 overflow-y-auto p-3 md:p-6 bg-gray-50">
            <PageComponent />
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;