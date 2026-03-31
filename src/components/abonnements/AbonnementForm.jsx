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
    const [installations, setInstallations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadClients();
        if (abonnement) {
            setFormData({
                installation_id: abonnement.installation_id || '',
                client_id: abonnement.installation?.client_id || '',
                date_debut: abonnement.date_debut ? new Date(abonnement.date_debut).toISOString().split('T')[0] : '',
                date_fin: abonnement.date_fin ? new Date(abonnement.date_fin).toISOString().split('T')[0] : '',
                statut: abonnement.statut || 'actif'
            });
            if (abonnement.installation?.client_id) {
                loadInstallations(abonnement.installation.client_id);
            }
        }
    }, [abonnement]);

    const loadClients = async () => {
        try {
            const data = await prospectService.getAll();
            // Filtrer pour n'avoir que les clients actifs
            setClients(data.filter(c => c.statut === 'actif'));
        } catch (error) {
            console.error('Erreur chargement clients:', error);
        }
    };

    const loadInstallations = async (clientId) => {
        try {
            setLoading(true);
            const data = await installationService.getByClient(clientId);
            setInstallations(data);
        } catch (error) {
            console.error('Erreur chargement installations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClientChange = (clientId) => {
        setFormData(prev => ({ ...prev, client_id: clientId, installation_id: '' }));
        setInstallations([]);
        if (clientId) loadInstallations(clientId);
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
                <div className="md:col-span-2">
                    <SearchableSelect
                        label="Client *"
                        value={formData.client_id}
                        onChange={(e) => handleClientChange(e.target.value)}
                        options={clients.map(client => ({
                            value: client.id,
                            label: client.raison_sociale,
                            description: `${client.ville || ''} (${client.wilaya || ''}) - ${client.contact || ''}`
                        }))}
                        placeholder="Rechercher un client..."
                        required
                        disabled={!!abonnement}
                    />
                </div>

                <div>
                    <SearchableSelect
                        label="Installation *"
                        name="installation_id"
                        value={formData.installation_id}
                        onChange={handleChange}
                        options={installations.map(inst => ({
                            value: inst.id,
                            label: inst.application_installee,
                            description: `Installée le: ${new Date(inst.date_installation).toLocaleDateString()} - Type: ${inst.type || 'N/A'}`
                        }))}
                        placeholder={loading ? "Chargement..." : "Rechercher une installation..."}
                        required
                        disabled={loading || !formData.client_id || !!abonnement}
                    />
                </div>

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
                <Button type="submit" variant="primary">
                    {abonnement ? 'Mettre à jour' : 'Enregistrer'}
                </Button>
            </div>
        </form>
    );
};

export default AbonnementForm;
