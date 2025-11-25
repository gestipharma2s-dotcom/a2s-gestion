import React, { useState } from 'react';
import { Upload, File, Trash2, Download, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../common/Button';

const JustificatifsUpload = ({ missionId, onFilesUploaded }) => {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    const errors = [];

    if (file.size > maxFileSize) {
      errors.push(`Fichier trop volumineux (max: 10MB, reçu: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`Format de fichier non accepté: ${file.type}`);
    }

    return errors;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    processFiles(e.target.files);
  };

  const processFiles = (fileList) => {
    const newFiles = [];

    Array.from(fileList).forEach(file => {
      const errors = validateFile(file);

      newFiles.push({
        id: Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        errors,
        uploadDate: new Date().toISOString(),
        status: errors.length > 0 ? 'error' : 'pending'
      });
    });

    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleUpload = async () => {
    try {
      setUploading(true);

      // Simuler l'upload (en production, utiliser Supabase storage)
      const validFiles = files.filter(f => f.status === 'pending' && f.errors.length === 0);

      if (validFiles.length === 0) {
        alert('❌ Aucun fichier valide à télécharger');
        return;
      }

      // Simuler l'upload
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Marquer comme uploadés
      const uploaded = validFiles.map(f => ({
        ...f,
        status: 'uploaded',
        uploadedAt: new Date().toISOString(),
        storageUrl: `/uploads/missions/${missionId}/${f.name}`
      }));

      setUploadedFiles(prev => [...prev, ...uploaded]);

      // Supprimer des fichiers en attente
      setFiles(prev => prev.filter(f => f.status !== 'pending' || f.errors.length > 0));

      if (onFilesUploaded) {
        onFilesUploaded(uploaded);
      }

      alert(`✅ ${uploaded.length} fichier(s) téléchargé(s) avec succès!`);
    } catch (error) {
      alert(`❌ Erreur lors du téléchargement: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (id, isUploaded = false) => {
    if (isUploaded) {
      setUploadedFiles(prev => prev.filter(f => f.id !== id));
    } else {
      setFiles(prev => prev.filter(f => f.id !== id));
    }
  };

  const getFileIcon = (type) => {
    if (type === 'application/pdf') return '📄';
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('spreadsheet') || type.includes('excel')) return '📊';
    if (type.includes('word') || type.includes('document')) return '📝';
    return '📎';
  };

  return (
    <div className="space-y-4">
      {/* Zone de drag & drop */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
          dragActive
            ? 'border-primary bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-primary'
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload size={32} className="text-primary" />
          <p className="font-semibold text-gray-900">Glissez-déposez des fichiers ici</p>
          <p className="text-sm text-gray-600">ou</p>
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx,.doc,.docx"
              className="hidden"
            />
            <span className="text-primary font-medium hover:underline">parcourez vos fichiers</span>
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Max 10MB par fichier • PDF, Images, Excel, Word
          </p>
        </div>
      </div>

      {/* Files en attente */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900">Fichiers en attente ({files.length})</h4>
          {files.map(file => (
            <div key={file.id} className="bg-white p-3 rounded border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getFileIcon(file.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-600">
                    {(file.size / 1024 / 1024).toFixed(2)}MB
                  </p>
                  {file.errors.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {file.errors.map((error, idx) => (
                        <div key={idx} className="flex items-start gap-1 text-red-600 text-xs">
                          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                          <span>{error}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-red-600 hover:text-red-900 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {/* Bouton upload */}
          <Button
            onClick={handleUpload}
            disabled={uploading || files.filter(f => f.errors.length === 0).length === 0}
            className={`w-full py-2 rounded font-medium flex items-center justify-center gap-2 ${
              uploading
                ? 'bg-gray-400 text-white'
                : 'bg-primary hover:bg-primary-dark text-white'
            }`}
          >
            <Upload size={18} />
            {uploading ? 'Téléchargement...' : 'Télécharger les fichiers'}
          </Button>
        </div>
      )}

      {/* Fichiers uploadés */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2 bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={20} className="text-green-600" />
            <h4 className="font-semibold text-green-900">
              Fichiers téléchargés ({uploadedFiles.length})
            </h4>
          </div>
          {uploadedFiles.map(file => (
            <div key={file.id} className="bg-white p-3 rounded border border-green-200">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getFileIcon(file.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-600">
                    Uploadé le {new Date(file.uploadedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    className="text-primary hover:text-primary-dark p-1"
                    title="Télécharger"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => removeFile(file.id, true)}
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Info:</strong> Les justificatifs sont stockés de manière sécurisée et peuvent être
          téléchargés à tout moment.
        </p>
      </div>
    </div>
  );
};

export default JustificatifsUpload;
