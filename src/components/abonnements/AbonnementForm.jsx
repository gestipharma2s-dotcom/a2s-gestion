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
    const [willCreateInstallation, setWillCreateInstallation] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingInstallations, setLoadingInstallations] = useState(false);

    useEffect(() => {
        Promise.all([loadClients(), loadApplications()]);
    }, []);

    // Quand le client change, charger ses installations
    useEffect(() => {
        if (formData.client_id) {
            loadClientInstallations(formData.client_id);
        } else {
            setClientInstallations([]);
        }
        setSelectedAppId('');
        setMatchedInstallation(null);
        setWillCreateInstallation(false);
        setFormData(prev => ({ ...prev, installation_id: '' }));
    }, [formData.client_id]);

    // Quand l'application change, chercher l'installation correspondante
    useEffect(() => {
        if (!selectedAppId || !formData.client_id) {
            setMatchedInstallation(null);
            setWillCreateInstallation(false);
            setFormData(prev => ({ ...prev, installation_id: '' }));
            return;
        }

        const app = applications.find(a => String(a.id) === String(selectedAppId));
        if (!app) return;

        // Chercher une installation existante pour ce client + cette app
        const inst = clientInstallations.find(
            i => i.application_installee?.toLowerCase().trim() === app.nom?.toLowerCase().trim()
        );

        if (inst) {
            // Installation trouvée → la lier directement
            setMatchedInstallation(inst);
            setWillCreateInstallation(false);
            setFormData(prev => ({ ...prev, installation_id: inst.id }));
        } else {
            // Pas d'installation → on va en créer une automatiquement au submit
            setMatchedInstallation(null);
            setWillCreateInstallation(true);
            // installation_id sera résolu au submit (après création auto)
            setFormData(prev => ({ ...prev, installation_id: '__to_create__' }));
        }
    }, [selectedAppId, clientInstallations]);

    const loadClients = async () => {
        try {
            const data = await prospectService.getAll();
            setClients(data.filter(c => c.statut === 'actif'));
        } catch (err) {
            console.error('Erreur chargement clients:', err);
        }
    };

    const loadApplications = async () => {
        try {
            setLoading(true);
            const data = await applicationService.getAll();
            setApplications(data || []);
        } catch (err) {
            console.error('Erreur chargement applications:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadClientInstallations = async (clientId) => {
        try {
            setLoadingInstallations(true);
            const data = await installationService.getByClient(clientId);
            setClientInstallations(data || []);
        } catch (err) {
            console.error('Erreur chargement installations client:', err);
            setClientInstallations([]);
        } finally {
            setLoadingInstallations(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.client_id || !selectedAppId) return;

        const app = applications.find(a => String(a.id) === String(selectedAppId));

        // Si pas d'installation existante → créer une installation de type abonnement
        if (willCreateInstallation && app) {
            try {
                const newInst = await installationService.createSimple({
                    client_id: formData.client_id,
                    application_installee: app.nom,
                    date_installation: formData.date_debut,
                    montant: 0,
                    montant_abonnement: app.prix_abonnement || app.prix || 0,
                    type: 'abonnement'
                });
                // Soumettre le formulaire avec le nouvel installation_id
                onSubmit({ ...formData, installation_id: newInst.id });
            } catch (err) {
                console.error('Erreur création installation auto:', err);
                alert('Erreur lors de la création de l\'installation automatique');
            }
        } else {
            onSubmit(formData);
        }
    };

    const selectedApp = applications.find(a => String(a.id) === String(selectedAppId));

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Client */}
                <div className="md:col-span-2">
                    <SearchableSelect
                        label="👤 Client *"
                        value={formData.client_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
                        options={clients.map(c => ({
                            value: c.id,
                            label: c.raison_sociale,
                            description: `${c.ville || ''} (${c.wilaya || ''}) — ${c.contact || ''}`
                        }))}
                        placeholder="Rechercher un client..."
                        required
                        disabled={!!abonnement}
                    />
                </div>

                {/* 2. Application depuis le catalogue */}
                <div className="md:col-span-2">
                    <SearchableSelect
                        label="📦 Application *"
                        value={selectedAppId}
                        onChange={(e) => setSelectedAppId(e.target.value)}
                        options={applications.map(app => ({
                            value: app.id,
                            label: app.nom,
                            description: `Abonnement : ${app.prix_abonnement ? Number(app.prix_abonnement).toLocaleString('fr-DZ') + ' DA/an' : 'N/D'}`
                        }))}
                        placeholder={loading ? "Chargement du catalogue..." : "Rechercher une application..."}
                        required
                        disabled={loading || !!abonnement || !formData.client_id}
                    />
                    {!formData.client_id && (
                        <p className="text-xs text-gray-400 mt-1">← Sélectionnez d'abord un client</p>
                    )}
                    {loadingInstallations && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <span className="inline-block animate-spin">⏳</span> Vérification des installations...
                        </p>
                    )}
                </div>

                {/* Résultat du matching */}
                {selectedApp && formData.client_id && (
                    matchedInstallation ? (
                        <div className="md:col-span-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-start gap-3">
                            <span className="text-xl mt-0.5">✅</span>
                            <div>
                                <p className="text-xs text-green-600 font-bold uppercase">Installation existante trouvée</p>
                                <p className="font-bold text-gray-800">{matchedInstallation.application_installee}</p>
                                <p className="text-xs text-gray-500">
                                    Montant abonnement :{' '}
                                    <strong>{matchedInstallation.montant_abonnement ? `${Number(matchedInstallation.montant_abonnement).toLocaleString('fr-DZ')} DA` : 'Non défini'}</strong>
                                </p>
                            </div>
                        </div>
                    ) : willCreateInstallation ? (
                        <div className="md:col-span-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3">
                            <span className="text-xl mt-0.5">🆕</span>
                            <div>
                                <p className="text-xs text-amber-700 font-bold uppercase">Nouveau client abonnement</p>
                                <p className="font-bold text-gray-800">{selectedApp.nom}</p>
                                <p className="text-xs text-gray-600">
                                    Une installation de type <strong>Abonnement</strong> sera créée automatiquement.
                                    Montant : <strong>{selectedApp.prix_abonnement ? `${Number(selectedApp.prix_abonnement).toLocaleString('fr-DZ')} DA/an` : 'Non défini'}</strong>
                                </p>
                            </div>
                        </div>
                    ) : null
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Début *</label>
                    <input type="date" name="date_debut" value={formData.date_debut} onChange={handleChange} className="input w-full" required />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Fin (Échéance) *</label>
                    <input type="date" name="date_fin" value={formData.date_fin} onChange={handleChange} className="input w-full" required />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select name="statut" value={formData.statut} onChange={handleChange} className="input w-full">
                        <option value="actif">Actif</option>
                        <option value="en_alerte">En Alerte</option>
                        <option value="expire">Expiré</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || !formData.client_id || !selectedAppId}
                >
                    {abonnement ? 'Mettre à jour' : 'Enregistrer'}
                </Button>
            </div>
        </form>
    );
};

export default AbonnementForm;
