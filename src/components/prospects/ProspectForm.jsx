import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { WILAYAS_SELECT_OPTIONS } from '../../utils/wilayasConstants';

const ProspectForm = ({ prospect, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    raison_sociale: '',
    contact: '',
    secteur: '',
    telephone: '',
    email: '',
    wilaya: '',
    ville: '',
    adresse: '',
    forme_juridique: '',
    rc: '',
    nif: '',
    ai: '',
    nis: '',
    solde_initial: 0,
    commercial_assigned: '',
    temperature: 'froid'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ CORRIGÉ: Initialiser le formulaire quand prospect change
  useEffect(() => {
    if (prospect) {
      setFormData({
        raison_sociale: prospect.raison_sociale || '',
        contact: prospect.contact || '',
        secteur: prospect.secteur || '',
        telephone: prospect.telephone || '',
        email: prospect.email || '',
        wilaya: prospect.wilaya || '',
        ville: prospect.ville || '',
        adresse: prospect.adresse || '',
        forme_juridique: prospect.forme_juridique || '',
        rc: prospect.rc || '',
        nif: prospect.nif || '',
        ai: prospect.ai || '',
        nis: prospect.nis || '',
        solde_initial: prospect.solde_initial || 0,
        commercial_assigned: prospect.commercial_assigned || (user?.nom || user?.email || ''),
        temperature: prospect.temperature || 'froid'
      });
    } else {
      // ✅ Réinitialiser si pas de prospect (mode création)
      // ✅ Commercial assigné = utilisateur connecté
      setFormData({
        raison_sociale: '',
        contact: '',
        secteur: '',
        telephone: '',
        email: '',
        wilaya: '',
        ville: '',
        adresse: '',
        forme_juridique: '',
        rc: '',
        nif: '',
        ai: '',
        nis: '',
        solde_initial: 0,
        commercial_assigned: user?.nom || user?.email || '',
        temperature: 'froid'
      });
    }
    setErrors({});
  }, [prospect, user]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.raison_sociale?.trim()) {
      newErrors.raison_sociale = 'Raison sociale requise';
    }
    if (!formData.contact?.trim()) {
      newErrors.contact = 'Contact requis';
    }
    if (!formData.secteur?.trim()) {
      newErrors.secteur = 'Secteur requis';
    }
    if (!formData.telephone?.trim()) {
      newErrors.telephone = 'Téléphone requis';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email requis';
    }
    if (!formData.wilaya?.trim()) {
      newErrors.wilaya = 'Wilaya requise';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // ✅ CORRIGÉ: Empêcher les soumissions multiples
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Raison Sociale"
        type="text"
        value={formData.raison_sociale}
        onChange={(e) => handleChange('raison_sociale', e.target.value)}
        placeholder="Nom de l'entreprise"
        error={errors.raison_sociale}
        required
        disabled={isSubmitting}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Forme Juridique</label>
        <select
          value={formData.forme_juridique}
          onChange={(e) => handleChange('forme_juridique', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isSubmitting}
        >
          <option value="">Sélectionner...</option>
          <option value="SARL">SARL</option>
          <option value="EURL">EURL</option>
          <option value="SPA">SPA</option>
          <option value="SNC">SNC</option>
          <option value="PERSONNE PHYSIQUE">PERSONNE PHYSIQUE</option>
          <option value="AUTRE">AUTRE</option>
        </select>
      </div>

      <Input
        label="Contact"
        type="text"
        value={formData.contact}
        onChange={(e) => handleChange('contact', e.target.value)}
        placeholder="Nom du contact"
        error={errors.contact}
        required
        disabled={isSubmitting}
      />

      <Input
        label="Téléphone"
        type="tel"
        value={formData.telephone}
        onChange={(e) => handleChange('telephone', e.target.value)}
        placeholder="+213 XXX XXX XXX"
        error={errors.telephone}
        required
        disabled={isSubmitting}
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        placeholder="email@example.com"
        error={errors.email}
        required
        disabled={isSubmitting}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Secteur <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.secteur}
          onChange={(e) => handleChange('secteur', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isSubmitting}
          required
        >
          <option value="">Sélectionner un secteur</option>
          <option value="GROSSISTE PHARM">GROSSISTE PHARM</option>
          <option value="GROSSISTE PARA">GROSSISTE PARA</option>
          <option value="PARA SUPER GROS">PARA SUPER GROS</option>
          <option value="LABO PROD">LABO PROD</option>
          <option value="AUTRE">AUTRE</option>
        </select>
        {errors.secteur && (
          <p className="text-sm text-red-600 mt-1">{errors.secteur}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          📍 Wilaya <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.wilaya}
          onChange={(e) => handleChange('wilaya', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isSubmitting}
          required
        >
          <option value="">Sélectionner une wilaya</option>
          {WILAYAS_SELECT_OPTIONS.map(wilaya => (
            <option key={wilaya.value} value={wilaya.value}>
              {wilaya.label}
            </option>
          ))}
        </select>
        {errors.wilaya && (
          <p className="text-sm text-red-600 mt-1">{errors.wilaya}</p>
        )}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Ville"
          type="text"
          value={formData.ville}
          onChange={(e) => handleChange('ville', e.target.value)}
          placeholder="Ville"
          disabled={isSubmitting}
        />
        <Input
          label="Adresse"
          type="text"
          value={formData.adresse}
          onChange={(e) => handleChange('adresse', e.target.value)}
          placeholder="Adresse complète"
          disabled={isSubmitting}
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <Input
          label="RC"
          type="text"
          value={formData.rc}
          onChange={(e) => handleChange('rc', e.target.value)}
          placeholder="Registre Commerce"
          disabled={isSubmitting}
        />
        <Input
          label="NIF"
          type="text"
          value={formData.nif}
          onChange={(e) => handleChange('nif', e.target.value)}
          placeholder="ID Fiscal"
          disabled={isSubmitting}
        />
        <Input
          label="AI"
          type="text"
          value={formData.ai}
          onChange={(e) => handleChange('ai', e.target.value)}
          placeholder="Article Imposition"
          disabled={isSubmitting}
        />
        <Input
          label="NIS"
          type="text"
          value={formData.nis}
          onChange={(e) => handleChange('nis', e.target.value)}
          placeholder="ID Statistique"
          disabled={isSubmitting}
        />
      </div>

      <Input
        label="Commercial Assigné"
        type="text"
        value={formData.commercial_assigned}
        disabled={true}
        placeholder="Assigné automatiquement"
      />

      <Input
        label="Solde Initial (Dette historique)"
        type="number"
        step="0.01"
        value={formData.solde_initial}
        onChange={(e) => handleChange('solde_initial', e.target.value)}
        placeholder="0.00 DA"
        disabled={isSubmitting}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          🌡️ Degré d'intérêt (Température)
        </label>
        <select
          value={formData.temperature}
          onChange={(e) => handleChange('temperature', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isSubmitting}
        >
          <option value="froid">❄️ Froid (Peu intéressé)</option>
          <option value="tiede">☁️ Tiède (En réflexion)</option>
          <option value="chaud">🔥 Chaud (Très intéressé)</option>
          <option value="brulant">🚀 Brûlant (Prêt à signer)</option>
          <option value="acquis">✅ Acquis (Client historique)</option>
        </select>
        <p className="text-xs text-gray-500">Permet de classer le prospect selon son niveau d'intérêt actuel.</p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Création en cours...' : prospect ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default ProspectForm;