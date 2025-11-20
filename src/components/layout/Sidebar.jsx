import React from 'react';
import { 
  LayoutDashboard, Target, Users, Calendar, CreditCard, 
  Download, Package, Settings, LogOut, Menu, X, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getInitials } from '../../utils/helpers';
import { PAGES } from '../../utils/constants';

const Sidebar = ({ currentPage, onPageChange }) => {
  const { profile, signOut, hasAccess } = useAuth();
  const { sidebarOpen, toggleSidebar } = useApp();

  const allMenuItems = [
    { id: PAGES.DASHBOARD, label: 'Tableau de Bord', icon: LayoutDashboard },
    { id: PAGES.PROSPECTS, label: 'Prospects', icon: Target },
    { id: PAGES.CLIENTS, label: 'Clients', icon: Users },
    { id: PAGES.INSTALLATIONS, label: 'Installations', icon: Download },
    { id: PAGES.ABONNEMENTS, label: 'Abonnements', icon: Calendar },
    { id: PAGES.PAIEMENTS, label: 'Paiements', icon: CreditCard },
    { id: PAGES.SUPPORT, label: 'Support', icon: Settings },
    { id: PAGES.INTERVENTIONS, label: 'Interventions', icon: Settings },
    { id: PAGES.APPLICATIONS, label: 'Applications', icon: Package },
    { id: PAGES.UTILISATEURS, label: 'Utilisateurs', icon: Users },
  ];

  // Filtrer les pages accessibles selon les permissions de l'utilisateur
  const menuItems = allMenuItems.filter(item => hasAccess(item.id));

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  return (
    <>
      {/* Bouton menu mobile */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 bg-primary text-white p-2 rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-primary text-white
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-primary-light">
          <div className="flex items-center gap-3">
            <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center">
              <span className="text-primary text-xl font-bold">A2S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">A2S Gestion</h1>
              <p className="text-sm text-blue-200">{profile?.role}</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={`
                  w-full flex items-center gap-3 px-6 py-3 
                  transition-colors duration-200
                  ${isActive 
                    ? 'bg-white bg-opacity-20 border-l-4 border-white' 
                    : 'hover:bg-white hover:bg-opacity-10'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-primary-light">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center font-bold">
              {getInitials(profile?.nom || 'User')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{profile?.nom}</p>
              <p className="text-sm text-blue-200 truncate">Utilisateur</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;