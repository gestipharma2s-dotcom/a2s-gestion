import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { installationPlanningService } from '../../services/installationPlanningService';
import { userService } from '../../services/userService';
import { installationService } from '../../services/installationService';
import { missionService } from '../../services/missionService';
import { prospectService } from '../../services/prospectService';
import { Calendar, User, MapPin, Monitor, CheckCircle, Clock, AlertCircle, Briefcase, Trash2, Edit2, X, Save, RefreshCw } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const InstallationPlanningList = () => {
    const navigate = useNavigate();
    const [installations, setInstallations] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, upcoming, ongoing, completed
    const [stats, setStats] = useState({ total: 0, aVenir: 0, enCours: 0, terminees: 0 });
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [allUsers, setAllUsers] = useState([]);

    const getMissionStatusLabel = (item) => {
        // Support pour l'objet mission directement ou via mission_id
        let mission = item.mission;

        // Supabase peut parfois retourner un tableau pour les jointures
        if (Array.isArray(mission)) mission = mission[0];

        if (!mission) {
            // Fallback si on a un ID mais pas l'objet mission
            if (item.mission_id && item.mission_id !== "null" && item.mission_id !== 0) {
                return { label: 'PLANIFIÉE', class: 'bg-blue-100 text-blue-800' };
            }
            return { label: '-', class: 'text-gray-400' };
        }

        switch (mission.statut) {
            case 'creee':
            case 'planifiee':
                return { label: 'À VENIR', class: 'bg-blue-100 text-blue-800' };
            case 'en_cours':
                return { label: 'EN COURS', class: 'bg-amber-100 text-amber-800' };
            case 'cloturee':
            case 'validee':
                return { label: 'TERMINÉE', class: 'bg-green-100 text-green-800' };
            default:
                return { label: mission.statut?.toUpperCase() || '-', class: 'bg-gray-100 text-gray-800' };
        }
    };

    const getEffectiveStatus = (item) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Travailler sur des dates sans heure pour la comparaison

        const start = new Date(item.date_debut);
        start.setHours(0, 0, 0, 0);

        const end = new Date(item.date_fin);
        end.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Priorité 1: Statut de la mission si elle existe
        let mission = item.mission;
        if (Array.isArray(mission)) mission = mission[0];

        if (mission && mission.statut) {
            const s = mission.statut.toLowerCase();
            if (s === 'cloturee' || s === 'validee' || s === 'terminée' || s === 'terminé') return 'completed';
            if (s === 'en_cours' || s === 'en cours') return 'ongoing';
            if (s === 'creee' || s === 'planifiee' || s === 'à venir') return 'upcoming';
        }

        // Priorité 2: Cas de l'installation annulée
        if (item.is_cancelled) return 'upcoming'; // Ou un statut spécifique si besoin

        // Priorité 3: Dates (fallback si pas de mission ou mission en attente de démarrage)
        if (end < today) return 'completed';
        if (start > today) return 'upcoming';

        // Si c'est aujourd'hui mais pas de mission, on considère ça comme "À Venir/Planifié" tant que ce n'est pas "En cours" via une mission
        return 'ongoing';
    };

    const handleToggleCancelInstallation = async (item, e) => {
        if (e && e.stopPropagation) e.stopPropagation();

        const newStatus = !item.is_cancelled;
        const confirmMsg = newStatus
            ? 'Voulez-vous marquer cette installation comme ANNULÉE ou REPORTÉE ?\nLe bouton de génération de mission sera grisé.'
            : 'Voulez-vous RÉTABLIR cette planification ?';

        if (window.confirm(confirmMsg)) {
            try {
                await installationPlanningService.update(item.id, { is_cancelled: newStatus });
                loadData();
            } catch (error) {
                console.error("Erreur mise à jour statut installation:", error);
                alert("Erreur lors de la mise à jour");
            }
        }
    };

    const handleDeletePlanning = async (item, e) => {
        if (e && e.stopPropagation) e.stopPropagation();

        if (window.confirm("❗ Voulez-vous vraiment SUPPRIMER cette planification ?\nCette action est irréversible.")) {
            try {
                // Utilise prospectService pour nettoyer aussi le JSON legacy si besoin
                await prospectService.deleteAction(item.prospect_id, item);
                loadData();
            } catch (error) {
                console.error("Erreur suppression:", error);
                alert("Erreur lors de la suppression");
            }
        }
    };

    const openEditModal = (item, e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        setSelectedAction({ ...item });
        setShowEditModal(true);
    };

    const handleUpdatePlanning = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { id, ...updateData } = selectedAction;
            await installationPlanningService.update(id, {
                application: updateData.application,
                date_debut: updateData.date_debut,
                date_fin: updateData.date_fin,
                chef_mission: updateData.chef_mission,
                description: updateData.description,
                conversion: updateData.conversion
            });
            setShowEditModal(false);
            loadData();
        } catch (error) {
            console.error("Erreur update:", error);
            alert("Erreur lors de la mise à jour");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelMission = async (item, e) => {
        if (e && e.stopPropagation) e.stopPropagation();

        if (window.confirm('Voulez-vous vraiment annuler la mission liée à cette installation ?\nCela supprimera la mission définitivement.')) {
            try {
                // 1. Supprimer la mission si l'ID existe
                if (item.mission_id) {
                    await missionService.delete(item.mission_id);
                }

                // 2. Mettre à jour la PLANIFICATION (casser le lien dans prospect_history)
                await installationPlanningService.update(item.id, { mission_id: null });

                // 3. Vérifier et corriger le statut du prospect (si c'était la seule mission/installation)
                await prospectService.checkAndFixProspectStatus(item.prospect_id);

                // 4. Rafraîchir l'interface
                loadData();

            } catch (error) {
                console.error("Erreur annulation mission:", error);
                alert("Erreur lors de l'annulation de la mission");
            }
        }
    };

    const handleGenerateMission = (item, e) => {
        if (e && e.stopPropagation) e.stopPropagation();

        console.log('🚀 Navigation vers Missions avec:', item);

        const missionData = {
            titre: `Installation ${item.application || 'Logiciel'} - ${item.prospect?.raison_sociale || 'Client'}`,
            description: `Mission d'installation générée depuis le planning.\n\nDétails:\n- Application: ${item.application || 'N/A'}\n- Conversion: ${item.conversion}\n- Migration: ${item.anciens_logiciels?.join(', ') || 'Non'}\n\n${item.description || ''}`,
            clientId: item.prospect?.id,
            wilaya: item.prospect?.wilaya,
            dateDebut: item.date_debut ? item.date_debut.split('T')[0] : '',
            dateFin: item.date_fin ? item.date_fin.split('T')[0] : '',
            type: 'Installation',
            chefMissionId: item.chef_mission,
            priorite: 'moyenne',
            installationId: item.id,
            prospectData: item.prospect
        };

        // SAUVEGARDE ROBUSTE dans localStorage pour passer à travers les redirections
        localStorage.setItem('temp_mission_create', JSON.stringify(missionData));

        navigate('/missions', { state: { createMission: missionData } });
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [data, usersData] = await Promise.all([
                installationPlanningService.getAllPlanned(),
                userService.getAll()
            ]);

            setInstallations(data);

            // Mapper les users par ID pour un accès rapide
            const usersMap = {};
            if (usersData && Array.isArray(usersData)) {
                setAllUsers(usersData);
                usersData.forEach(u => usersMap[u.id] = u.nom);
            }
            setUsers(usersMap);

            // Calcul des stats
            const now = new Date();
            const statsCalc = {
                total: data.length,
                aVenir: 0,
                enCours: 0,
                terminees: 0
            };

            data.forEach(inst => {
                const effectiveStatus = getEffectiveStatus(inst);
                if (effectiveStatus === 'completed') statsCalc.terminees++;
                else if (effectiveStatus === 'upcoming') statsCalc.aVenir++;
                else if (effectiveStatus === 'ongoing') statsCalc.enCours++;
            });

            setStats(statsCalc);
        } catch (error) {
            console.error("Erreur chargement planning:", error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredInstallations = () => {
        return installations.filter(inst => {
            const effectiveStatus = getEffectiveStatus(inst);

            if (filter === 'upcoming') return effectiveStatus === 'upcoming';
            if (filter === 'ongoing') return effectiveStatus === 'ongoing';
            if (filter === 'completed') return effectiveStatus === 'completed';
            return true;
        });
    };

    const filteredData = getFilteredInstallations();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div
                    onClick={() => setFilter('all')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${filter === 'all' ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-100 hover:border-blue-100'}`}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Planifié</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
                        </div>
                        <div className={`p-2 rounded-lg ${filter === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                            <Calendar size={20} />
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => setFilter('ongoing')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${filter === 'ongoing' ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-white border-gray-100 hover:border-amber-100'}`}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-amber-600">En Cours</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.enCours}</h3>
                        </div>
                        <div className={`p-2 rounded-lg ${filter === 'ongoing' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                            <Clock size={20} />
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => setFilter('upcoming')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${filter === 'upcoming' ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-100 hover:border-blue-100'}`}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-blue-600">À Venir</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.aVenir}</h3>
                        </div>
                        <div className={`p-2 rounded-lg ${filter === 'upcoming' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                            <Calendar size={20} />
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => setFilter('completed')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${filter === 'completed' ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white border-gray-100 hover:border-green-100'}`}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-green-600">Terminées</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.terminees}</h3>
                        </div>
                        <div className={`p-2 rounded-lg ${filter === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            <CheckCircle size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tableau Journal des Installations */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Prospect
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Secteur
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Application
                                </th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Conversion
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Wilaya
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date Début
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date Fin
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Chef de Mission
                                </th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut Mission
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <Calendar className="h-12 w-12 text-gray-300 mb-3" />
                                            <p className="text-lg">Aucune installation trouvée pour ce filtre</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        {/* Prospect */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                {item.prospect?.raison_sociale || 'Inconnu'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {item.prospect?.contact}
                                            </div>
                                        </td>

                                        {/* Secteur */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {item.prospect?.secteur || '-'}
                                            </span>
                                        </td>

                                        {/* Application */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            <div className="flex items-center">
                                                <Monitor size={16} className="text-gray-400 mr-2" />
                                                {item.application || '-'}
                                            </div>
                                        </td>

                                        {/* Conversion */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {item.conversion === 'oui' ? (
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Oui
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                    Non
                                                </span>
                                            )}
                                        </td>

                                        {/* Wilaya */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            <div className="flex items-center">
                                                <MapPin size={16} className="text-gray-400 mr-2" />
                                                {item.prospect?.wilaya || '-'}
                                            </div>
                                        </td>

                                        {/* Date Début */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                            {formatDate(item.date_debut)}
                                        </td>

                                        {/* Date Fin */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {formatDate(item.date_fin)}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <User size={16} className="text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900 font-medium">
                                                    {users[item.chef_mission] || 'Non assigné'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Statut Mission */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {(() => {
                                                const status = getMissionStatusLabel(item);
                                                return (
                                                    <span className={`px-2.5 py-1 inline-flex text-[10px] leading-4 font-bold rounded-full border ${status.class}`}>
                                                        {status.label}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {item.mission_id && item.mission_id !== "null" && item.mission_id !== 0 && item.mission_id !== "0" ? (
                                                <div className="flex flex-col gap-1 items-end">
                                                    <span className="inline-flex items-center px-3 py-1.5 rounded text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
                                                        <CheckCircle size={14} className="mr-1.5" />
                                                        MISSION GÉNÉRÉE
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-1.5 items-end">
                                                    <button
                                                        disabled={item.is_cancelled}
                                                        onClick={(e) => handleGenerateMission(item, e)}
                                                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-bold rounded-md text-white shadow-sm transition-all ${item.is_cancelled
                                                            ? 'bg-gray-300 cursor-not-allowed opacity-75'
                                                            : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                                                            }`}
                                                        title={item.is_cancelled ? "L'installation a été annulée ou reportée" : "Créer une mission à partir de cette installation"}
                                                    >
                                                        <Briefcase size={14} className="mr-1.5" />
                                                        {item.is_cancelled ? 'ANNULÉE / REPORTÉE' : 'GÉNÉRER MISSION !'}
                                                    </button>

                                                    <button
                                                        onClick={(e) => handleToggleCancelInstallation(item, e)}
                                                        className={`text-[10px] font-bold uppercase tracking-tighter transition-colors ${item.is_cancelled
                                                            ? 'text-blue-500 hover:text-blue-700 underline'
                                                            : 'text-gray-400 hover:text-red-500'
                                                            }`}
                                                    >
                                                        {item.is_cancelled ? 'Rétablir Planning' : 'Annuler l\'installation ?'}
                                                    </button>

                                                    <div className="flex gap-2 mt-1">
                                                        <button
                                                            onClick={(e) => openEditModal(item, e)}
                                                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                            title="Modifier les détails"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDeletePlanning(item, e)}
                                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                            title="Supprimer définitivement"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DE MODIFICATION */}
            {showEditModal && selectedAction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 font-sans">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-primary p-4 text-white flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2">
                                <Edit2 size={18} />
                                Modifier Planification
                            </h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="hover:bg-white/20 p-1 rounded-full transition-colors"
                                title="Fermer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdatePlanning} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Application</label>
                                <input
                                    type="text"
                                    required
                                    value={selectedAction.application || ''}
                                    onChange={(e) => setSelectedAction({ ...selectedAction, application: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Date Début</label>
                                    <input
                                        type="date"
                                        required
                                        value={selectedAction.date_debut ? selectedAction.date_debut.split('T')[0] : ''}
                                        onChange={(e) => setSelectedAction({ ...selectedAction, date_debut: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Date Fin</label>
                                    <input
                                        type="date"
                                        required
                                        value={selectedAction.date_fin ? selectedAction.date_fin.split('T')[0] : ''}
                                        onChange={(e) => setSelectedAction({ ...selectedAction, date_fin: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Chef de Mission</label>
                                <select
                                    required
                                    value={selectedAction.chef_mission || ''}
                                    onChange={(e) => setSelectedAction({ ...selectedAction, chef_mission: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    <option value="">Sélectionner...</option>
                                    {allUsers.map(u => (
                                        <option key={u.id} value={u.id}>{u.nom}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Commentaires</label>
                                <textarea
                                    value={selectedAction.description || ''}
                                    onChange={(e) => setSelectedAction({ ...selectedAction, description: e.target.value })}
                                    rows="3"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="conversion_edit"
                                    checked={selectedAction.conversion === 'oui'}
                                    onChange={(e) => setSelectedAction({ ...selectedAction, conversion: e.target.checked ? 'oui' : 'non' })}
                                    className="w-4 h-4 text-primary"
                                />
                                <label htmlFor="conversion_edit" className="text-sm font-medium text-gray-700">
                                    Client converti (Avance payée)
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-600 hover:bg-gray-50"
                                    disabled={isSaving}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 flex items-center justify-center gap-2"
                                    disabled={isSaving}
                                >
                                    {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstallationPlanningList;
