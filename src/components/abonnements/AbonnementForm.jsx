import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import SearchableSelect from '../common/SearchableSelect';
import { installationService } from '../../services/installationService';
import { prospectService } from '../../services/prospectService';

const AbonnementForm = ({ abonnement, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        installation_id: '',
        client_id: '',
        date_debut: new Date().toISOString().split('T')[0],
        date_fin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        statut: 'actif'
    });

    const [clients, setClients] = useState([]);
    const [allInstallations, setAllInstallations] = useState([]);
    const [filteredInstallations, setFilteredInstallations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInstInfo, setSelectedInstInfo] = useState(null);

    // Charger les clients ET toutes les installations dès l'ouverture
    useEffect(() => {
        Promise.all([loadClients(), loadAllInstallations()]);
    }, []);

    // Quand le client change, filtrer les installations (ou afficher toutes si aucun client)
    useEffect(() => {
        if (formData.client_id) {
            setFilteredInstallations(
                allInstallations.filter(i => String(i.client_id) === String(formData.client_id))
            );
        } else {
            setFilteredInstallations(allInstallations);
        }
    }, [formData.client_id, allInstallations]);

    useEffect(() => {
        if (abonnement && allInstallations.length > 0) {
            setFormData({
                installation_id: abonnement.installation_id || '',
                client_id: abonnement.installation?.client_id || '',
                date_debut: abonnement.date_debut ? new Date(abonnement.date_debut).toISOString().split('T')[0] : '',
                date_fin: abonnement.date_fin ? new Date(abonnement.date_fin).toISOString().split('T')[0] : '',
                statut: abonnement.statut || 'actif'
            });
            const inst = allInstallations.find(i => i.id === abonnement.installation_id);
            if (inst) setSelectedInstInfo(inst);
        }
    }, [abonnement, allInstallations]);

    const loadClients = async () => {
        try {
            const data = await prospectService.getAll();
            setClients(data.filter(c => c.statut === 'actif'));
        } catch (error) {
            console.error('Erreur chargement clients:', error);
        }
    };

    const loadAllInstallations = async () => {
        try {
            setLoading(true);
            const data = await installationService.getAll();
            setAllInstallations(data || []);
            setFilteredInstallations(data || []);
        } catch (error) {
            console.error('Erreur chargement installations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClientChange = (clientId) => {
        // Réinitialiser l'installation si on change de client
        setFormData(prev => ({ ...prev, client_id: clientId, installation_id: '' }));
        setSelectedInstInfo(null);
    };

    const handleInstallationChange = (e) => {
        const instId = e.target.value;
        const inst = allInstallations.find(i => String(i.id) === String(instId));
        // Auto-remplir le client si pas encore sélectionné
        const clientId = inst?.client_id || inst?.client?.id || formData.client_id;
        setFormData(prev => ({
            ...prev,
            installation_id: instId,
            client_id: clientId
        }));
        setSelectedInstInfo(inst || null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.installation_id) {
            alert('Veuillez sélectionner une installation');
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

                {/* 2. Sélection de l'Application (toutes les apps, filtrées par client si sélectionné) */}
                <div className="md:col-span-2">
                    <SearchableSelect
                        label={`🖥️ Application / Installation * ${formData.client_id ? `(${filteredInstallations.length} app${filteredInstallations.length > 1 ? 's' : ''} pour ce client)` : `(${filteredInstallations.length} apps au total)`}`}
                        value={formData.installation_id}
                        onChange={handleInstallationChange}
                        options={filteredInstallations.map(inst => ({
                            value: inst.id,
                            label: inst.application_installee,
                            description: `${inst.client?.raison_sociale || 'Client inconnu'} — Installée le : ${new Date(inst.date_installation).toLocaleDateString('fr-FR')}`
                        }))}
                        placeholder={loading ? "Chargement des applications..." : "Rechercher une application..."}
                        required
                        disabled={loading || !!abonnement}
                    />
                </div>

                {/* Info montant abonnement */}
                {selectedInstInfo && selectedInstInfo.montant_abonnement > 0 && (
                    <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 flex items-center gap-3">
                        <span className="text-blue-600 text-xl">💰</span>
                        <p className="text-sm text-blue-800">
                            Montant abonnement :{' '}
                            <strong>{Number(selectedInstInfo.montant_abonnement).toLocaleString('fr-DZ')} DA</strong>
                        </p>
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
                <Button type="submit" variant="primary" disabled={loading || !formData.installation_id}>
                    {abonnement ? 'Mettre à jour' : 'Enregistrer'}
                </Button>
            </div>
        </form>
    );
};

export default AbonnementForm;
