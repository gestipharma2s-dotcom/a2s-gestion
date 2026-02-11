import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, User, CheckCircle, XCircle, Plus } from 'lucide-react';
import Button from '../common/Button';
import { installationService } from '../../services/installationService';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const InstallationPlanning = ({ prospect, onAddInstallation }) => {
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    loadInstallations();
  }, [prospect?.id]);

  const loadInstallations = async () => {
    try {
      setLoading(true);
      if (prospect?.id) {
        const data = await installationService.getByClient(prospect.id);
        setInstallations(data || []);
      }
    } catch (error) {
      console.error('Erreur chargement installations:', error);
      setInstallations([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Planification des Installations</h3>
        <Button
          size="sm"
          variant="primary"
          onClick={onAddInstallation}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Nouvelle Installation
        </Button>
      </div>

      {installations.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
          <p className="text-gray-600 mb-3">Aucune installation planifiée</p>
          <Button
            size="sm"
            variant="primary"
            onClick={onAddInstallation}
          >
            Ajouter une installation
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {installations.map((installation) => (
            <div key={installation.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Prospect */}
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 font-semibold uppercase">Prospect</p>
                  <p className="text-sm font-medium text-gray-800">{prospect?.raison_sociale}</p>
                </div>

                {/* Contact */}
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 font-semibold uppercase flex items-center gap-1">
                    <User size={14} /> Contact
                  </p>
                  <p className="text-sm text-gray-700">{prospect?.contact}</p>
                </div>

                {/* Secteur */}
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 font-semibold uppercase">Secteur</p>
                  <p className="text-sm text-gray-700">{prospect?.secteur || '-'}</p>
                </div>

                {/* Wilaya */}
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 font-semibold uppercase flex items-center gap-1">
                    <MapPin size={14} /> Wilaya
                  </p>
                  <p className="text-sm text-gray-700">{prospect?.wilaya || '-'}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-3 pt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date Début */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 font-semibold uppercase flex items-center gap-1">
                      <Calendar size={14} /> Début Installation
                    </p>
                    <p className="text-sm font-medium text-blue-600">
                      {installation?.date_installation ? formatDate(installation.date_installation) : '-'}
                    </p>
                  </div>

                  {/* Date Fin - On utilise date_installation comme référence, en attendant une date de fin */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 font-semibold uppercase flex items-center gap-1">
                      <Calendar size={14} /> Fin Installation
                    </p>
                    <p className="text-sm text-gray-700">-</p>
                  </div>

                  {/* Chef de Mission */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 font-semibold uppercase">Chef de Mission</p>
                    <p className="text-sm text-gray-700">-</p>
                  </div>

                  {/* Conversion */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 font-semibold uppercase">Conversion</p>
                    <div className="flex items-center gap-2">
                      {prospect?.statut === 'actif' ? (
                        <>
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-sm font-medium text-green-600">Oui</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} className="text-red-600" />
                          <span className="text-sm font-medium text-red-600">Non</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Application et Type */}
              <div className="border-t border-gray-200 mt-3 pt-3 flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-gray-600">Application: </span>
                  <span className="font-medium text-gray-800">{installation?.application_installee}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  installation?.type === 'acquisition'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {installation?.type === 'acquisition' ? 'Acquisition' : 'Abonnement'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstallationPlanning;
