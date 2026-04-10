import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const ModuleForm = ({ module, applicationId, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        nom: '',
        prix_acquisition: '',
        prix_abonnement: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (module) {
            setFormData({
                nom: module.nom || '',
                prix_acquisition: module.prix_acquisition || '',
                prix_abonnement: module.prix_abonnement || ''
            });
        }
    }, [module]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nom?.trim()) {
            setErrors({ nom: 'Le nom du module est requis' });
            return;
        }

        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            await onSubmit({
                ...formData,
                application_id: applicationId
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Nom du Module"
                value={formData.nom}
                onChange={(e) => handleChange('nom', e.target.value)}
                placeholder="Ex: GESTION COMMERCIALE, WMS, PAIE..."
                error={errors.nom}
                required
                disabled={isSubmitting}
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Prix Acquisition (DA) - Optionnel"
                    type="number"
                    value={formData.prix_acquisition}
                    onChange={(e) => handleChange('prix_acquisition', e.target.value)}
                    placeholder="0"
                    disabled={isSubmitting}
                />
                <Input
                    label="Prix Abonnement (DA) - Optionnel"
                    type="number"
                    value={formData.prix_abonnement}
                    onChange={(e) => handleChange('prix_abonnement', e.target.value)}
                    placeholder="0"
                    disabled={isSubmitting}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                    Annuler
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? 'En cours...' : module ? 'Modifier' : 'Ajouter Module'}
                </Button>
            </div>
        </form>
    );
};

export default ModuleForm;
