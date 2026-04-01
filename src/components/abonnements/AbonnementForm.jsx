import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import SearchableSelect from '../common/SearchableSelect';
import { installationService } from '../../services/installationService';

const AbonnementForm = ({ abonnement, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        installation_id: '',
        client_id: '',
        date_debut: new Date().toISOString().split('T')[0],
        date_fin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        statut: 'actif'
    });

    const [allInstallations, setAllInstallations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInstInfo, setSelectedInstInfo] = useState(null);

    useEffect(() => {
        loadAllInstallations();
    }, []);

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

    const loadAllInstallations = async () => {
        try {
            setLoading(true);
            const data = await installationService.getAll();
            setAllInstallations(data || []);
        } catch (error) {
            console.error('Erreur chargement installations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInstallationChange = (e) => {
        const instId = e.target.value;
        const inst = allInstallations.find(i => String(i.id) === String(instId));
        setFormData(prev => ({
            ...prev,
            installation_id: instId,
            client_id: inst?.client_id || inst?.client?.id || ''
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
                {/* Champ Installation cherchable par application ou par nom client */}
                <div className="md:col-span-2">
                    <SearchableSelect
                        label="🖥️ Application / Installation *"
                        value={formData.installation_id}
                        onChange={handleInstallationChange}
                        options={allInstallations.map(inst => ({
                            value: inst.id,
                            label: inst.application_installee,
                            description: `${inst.client?.raison_sociale || 'Client inconnu'} — Installée le : ${new Date(inst.date_installation).toLocaleDateString('fr-FR')}`
                        }))}
                        placeholder={loading ? "Chargement des applications..." : "Rechercher une application ou un client..."}
                        required
                        disabled={loading || !!abonnement}
                    />
                </div>

                {/* Bandeau d'info sur le client auto-détecté */}
                {selectedInstInfo && (
                    <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-3">
                        <span className="text-2xl">👤</span>
                        <div>
                            <p className="text-xs text-blue-500 font-bold uppercase">Client sélectionné automatiquement</p>
                            <p className="font-bold text-gray-800">
                                {selectedInstInfo.client?.raison_sociale || 'Client inconnu'}
                            </p>
                            <p className="text-xs text-gray-500">
                                Montant abonnement :{' '}
                                {selectedInstInfo.montant_abonnement
                                    ? `${Number(selectedInstInfo.montant_abonnement).toLocaleString('fr-DZ')} DA`
                                    : 'Non défini'}
                            </p>
                        </div>
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
