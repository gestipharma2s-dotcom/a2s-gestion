import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import SearchableSelect from '../common/SearchableSelect';
import { installationService } from '../../services/installationService';
import { prospectService } from '../../services/prospectService';
import { applicationService } from '../../services/applicationService';

const AbonnementForm = ({ abonnement, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        installation_id: '',
        client_id: '',
        date_debut: new Date().toISOString().split('T')[0],
        date_fin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        statut: 'actif'
    });

    const [clients, setClients] = useState([]);
    const [applications, setApplications] = useState([]);
    const [clientInstallations, setClientInstallations] = useState([]);
    const [selectedAppId, setSelectedAppId] = useState('');
    const [matchedInstallation, setMatchedInstallation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingInstallations, setLoadingInstallations] = useState(false);
    const [error, setError] = useState('');

    // Charger clients + catalogue d'applications
    useEffect(() => {
        Promise.all([loadClients(), loadApplications()]);
    }, []);

    // Quand le client change, charger ses installations
    useEffect(() => {
        if (formData.client_id) {
            loadClientInstallations(formData.client_id);
        } else {
            setClientInstallations([]);
            setMatchedInstallation(null);
        }
        setSelectedAppId('');
        setFormData(prev => ({ ...prev, installation_id: '' }));
        setError('');
    }, [formData.client_id]);

    // Quand l'application change, trouver l'installation correspondante
    useEffect(() => {
        if (selectedAppId && clientInstallations.length > 0) {
            const app = applications.find(a => String(a.id) === String(selectedAppId));
            const inst = clientInstallations.find(
                i => i.application_installee?.toLowerCase() === app?.nom?.toLowerCase()
            );
            if (inst) {
                setMatchedInstallation(inst);
                setFormData(prev => ({ ...prev, installation_id: inst.id }));
                setError('');
            } else {
                setMatchedInstallation(null);
                setFormData(prev => ({ ...prev, installation_id: '' }));
                setError(`⚠️ Ce client n'a pas d'installation pour "${app?.nom}". Vérifiez les installations existantes.`);
            }
        } else {
            setMatchedInstallation(null);
            if (!selectedAppId) {
                setFormData(prev => ({ ...prev, installation_id: '' }));
            }
        }
    }, [selectedAppId, clientInstallations]);

    // Pré-remplir si modification
    useEffect(() => {
        if (abonnement) {
            setFormData({
                installation_id: abonnement.installation_id || '',
                client_id: abonnement.installation?.client_id || '',
                date_debut: abonnement.date_debut ? new Date(abonnement.date_debut).toISOString().split('T')[0] : '',
                date_fin: abonnement.date_fin ? new Date(abonnement.date_fin).toISOString().split('T')[0] : '',
                statut: abonnement.statut || 'actif'
            });
        }
    }, [abonnement]);

    const loadClients = async () => {
        try {
            const data = await prospectService.getAll();
            setClients(data.filter(c => c.statut === 'actif'));
        } catch (error) {
            console.error('Erreur chargement clients:', error);
        }
    };

    const loadApplications = async () => {
        try {
            setLoading(true);
            const data = await applicationService.getAll();
            setApplications(data || []);
        } catch (error) {
            console.error('Erreur chargement applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadClientInstallations = async (clientId) => {
        try {
            setLoadingInstallations(true);
            const data = await installationService.getByClient(clientId);
            setClientInstallations(data || []);
        } catch (error) {
            console.error('Erreur chargement installations client:', error);
            setClientInstallations([]);
        } finally {
            setLoadingInstallations(false);
        }
    };

    const handleClientChange = (clientId) => {
        setFormData(prev => ({ ...prev, client_id: clientId, installation_id: '' }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.installation_id) {
            alert('Impossible de créer l\'abonnement : aucune installation trouvée pour cette combinaison client/application.');
            return;
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Sélection du Client */}
                <div className="md:col-span-2">
                    <SearchableSelect
                        label="👤 Client *"
                        value={formData.client_id}
                        onChange={(e) => handleClientChange(e.target.value)}
                        options={clients.map(client => ({
                            value: client.id,
                            label: client.raison_sociale,
                            description: `${client.ville || ''} (${client.wilaya || ''}) — ${client.contact || ''}`
                        }))}
                        placeholder="Rechercher un client..."
                        required
                        disabled={!!abonnement}
                    />
                </div>

                {/* 2. Sélection de l'Application depuis le catalogue */}
                <div className="md:col-span-2">
                    <SearchableSelect
                        label="📦 Application (depuis le catalogue) *"
                        value={selectedAppId}
                        onChange={(e) => setSelectedAppId(e.target.value)}
                        options={applications.map(app => ({
                            value: app.id,
                            label: app.nom,
                            description: `Abonnement : ${app.prix_abonnement ? Number(app.prix_abonnement).toLocaleString('fr-DZ') + ' DA/an' : 'N/D'} — Acquisition : ${app.prix_acquisition ? Number(app.prix_acquisition).toLocaleString('fr-DZ') + ' DA' : 'N/D'}`
                        }))}
                        placeholder={loading ? "Chargement du catalogue..." : "Rechercher une application..."}
                        required
                        disabled={loading || !!abonnement || !formData.client_id}
                    />
                    {!formData.client_id && (
                        <p className="text-xs text-gray-400 mt-1">← Sélectionnez d'abord un client</p>
                    )}
                </div>

                {/* Résultat : Installation trouvée ou erreur */}
                {error && (
                    <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}
                {matchedInstallation && (
                    <div className="md:col-span-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-start gap-3">
                        <span className="text-green-600 text-xl mt-0.5">✅</span>
                        <div>
                            <p className="text-xs text-green-500 font-bold uppercase">Installation trouvée</p>
                            <p className="font-bold text-gray-800">{matchedInstallation.application_installee}</p>
                            <p className="text-xs text-gray-500">
                                Montant abonnement :{' '}
                                <strong>
                                    {matchedInstallation.montant_abonnement
                                        ? `${Number(matchedInstallation.montant_abonnement).toLocaleString('fr-DZ')} DA`
                                        : 'Non défini'}
                                </strong>
                                {' — '}Installée le : {new Date(matchedInstallation.date_installation).toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                    </div>
                )}
                {loadingInstallations && (
                    <div className="md:col-span-2 text-xs text-gray-400 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
                        Chargement des installations du client...
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Début *</label>
                    <input
                        type="date"
                        name="date_debut"
                        value={formData.date_debut}
                        onChange={handleChange}
                        className="input w-full"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Fin (Échéance) *</label>
                    <input
                        type="date"
                        name="date_fin"
                        value={formData.date_fin}
                        onChange={handleChange}
                        className="input w-full"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select
                        name="statut"
                        value={formData.statut}
                        onChange={handleChange}
                        className="input w-full"
                    >
                        <option value="actif">Actif</option>
                        <option value="en_alerte">En Alerte</option>
                        <option value="expire">Expiré</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Annuler
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || !formData.installation_id || !!error}
                >
                    {abonnement ? 'Mettre à jour' : 'Enregistrer'}
                </Button>
            </div>
        </form>
    );
};

export default AbonnementForm;
