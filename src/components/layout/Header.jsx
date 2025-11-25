import React, { useState } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import AbonnementAlerts from '../abonnements/AbonnementAlerts';

const Header = ({ title, subtitle }) => {
  const { toggleSidebar } = useApp();
  const [showAlerts, setShowAlerts] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-gray-600 hover:text-gray-800"
            >
              <Menu size={24} />
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
              <Search size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="bg-transparent outline-none text-sm w-64"
              />
            </div>

            {/* Bouton Notifications avec Badge */}
            <button 
              onClick={() => setShowAlerts(!showAlerts)}
              className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Widget Alertes */}
      {showAlerts && <AbonnementAlerts onClose={() => setShowAlerts(false)} />}
    </>
  );
};

export default Header;