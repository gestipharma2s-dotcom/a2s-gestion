import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Calendar, Briefcase, Users, LayoutDashboard, ChevronRight } from 'lucide-react';
import { PAGES } from '../../utils/constants';

const WelcomePage = ({ setCurrentPage }) => {
    const { profile } = useAuth();

    // Extraire le prénom ou afficher 'Utilisateur'
    const displayName = profile?.nom ? profile.nom.split(' ')[0] : (profile?.email?.split('@')[0] || 'Utilisateur');

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 animation-fade-in">
            <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary-dark p-10 text-white text-center relative overflow-hidden">
                    {/* Cercles décoratifs */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>

                    <Sparkles size={48} className="mx-auto mb-4 opacity-90" />
                    <h1 className="text-4xl font-bold mb-2">Bienvenue, {displayName} !</h1>
                    <p className="text-primary-light text-lg">
                        Votre espace de travail A2S Gestion est prêt.
                    </p>
                </div>

                <div className="p-10 text-center">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Que souhaitez-vous faire aujourd'hui ?</h2>

                    <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                        Sélectionnez un module dans le menu de gauche pour commencer vos tâches, ou utilisez l'un de vos accès rapides ci-dessous.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {profile?.pages_visibles && profile.pages_visibles.map((pageStr, index) => {
                            // Limiter à 4 raccourcis max
                            if (index > 3) return null;

                            const pageKey = Object.values(PAGES).find(p => p.toLowerCase() === pageStr.toLowerCase());
                            if (!pageKey) return null;

                            // Configuration de l'icône selon la page
                            let Icon = LayoutDashboard;
                            let title = pageStr;
                            let desc = "Accéder au module";
                            let color = "bg-blue-50 text-blue-600";

                            switch (pageKey) {
                                case PAGES.PROSPECTS: Icon = Users; title = "Prospects"; desc = "Gérer vos prospects"; color = "bg-purple-50 text-purple-600"; break;
                                case PAGES.CLIENTS: Icon = Briefcase; title = "Clients"; desc = "Gérer vos clients"; color = "bg-green-50 text-green-600"; break;
                                case PAGES.MISSIONS: Icon = Sparkles; title = "Missions"; desc = "Suivi des missions"; color = "bg-amber-50 text-amber-600"; break;
                                case PAGES.SUPPORT: Icon = Calendar; title = "Support"; desc = "Tickets et interventions"; color = "bg-rose-50 text-rose-600"; break;
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => setCurrentPage(pageKey)}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary hover:shadow-md transition-all text-left group"
                                >
                                    <div className={"w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform " + color}>
                                        <Icon size={24} />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-gray-900 capitalize">{title}</h3>
                                        <p className="text-sm text-gray-500">{desc}</p>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-400 group-hover:text-primary transition-colors" />
                                </button>
                            );
                        })}
                    </div>

                    {(!profile?.pages_visibles || profile.pages_visibles.length === 0) && (
                        <div className="p-6 bg-red-50 border border-red-200 rounded-xl max-w-lg mx-auto">
                            <p className="text-red-700 font-medium">
                                ⚠️ Il semble que vous n'ayez accès à aucun module pour le moment. Veuillez contacter votre administrateur.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 text-sm text-gray-400">
                SARL Advanced Software Solution © {new Date().getFullYear()}
            </div>
        </div>
    );
};

export default WelcomePage;
