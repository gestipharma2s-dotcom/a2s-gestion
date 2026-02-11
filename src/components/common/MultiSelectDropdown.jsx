import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

const MultiSelectDropdown = ({ 
  options = [], 
  selectedValues = [], 
  onChange, 
  placeholder = 'Sélectionner...',
  label,
  icon: Icon,
  displayFormat = (count, total) => `${placeholder} (${total})`
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const checkboxRef = useRef(null);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mettre à jour l'indeterminate state du checkbox "Tous"
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = selectedValues.length > 0 && selectedValues.length < options.length;
    }
  }, [selectedValues, options.length]);

  const handleToggleOption = (option) => {
    // Extraire la vraie valeur (au cas où option est un objet)
    const value = typeof option === 'string' ? option : option.value;
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newSelected);
  };

  const handleClearAll = () => {
    onChange([]);
    setIsOpen(false);
  };

  const handleToggleAll = (e) => {
    if (e.target.checked) {
      const allValues = options.map(opt => typeof opt === 'string' ? opt : opt.value);
      onChange(allValues);
    } else {
      onChange([]);
    }
  };

  // Extraire les vraies valeurs pour la comparaison
  const optionValues = options.map(opt => typeof opt === 'string' ? opt : opt.value);

  // Formater l'affichage d'une option (avec label et compteur si disponible)
  const formatOptionDisplay = (option) => {
    if (typeof option === 'string') {
      return option;
    }
    if (option.label && option.count !== undefined) {
      return `${option.label} (${option.count})`;
    }
    if (option.label) {
      return option.label;
    }
    return option.value;
  };

  const getOptionValue = (option) => {
    return typeof option === 'string' ? option : option.value;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Bouton dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-2 flex-1">
          {Icon && <Icon size={18} className="text-gray-400" />}
          <span className="text-gray-700">
            {selectedValues.length > 0 
              ? `${selectedValues.length} sélectionné${selectedValues.length > 1 ? 's' : ''}` 
              : displayFormat(0, options.length)}
          </span>
        </div>
        <ChevronDown 
          size={18} 
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Menu dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          {/* Header avec "Tous/Aucun" */}
          <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer flex-1">
              <input
                ref={checkboxRef}
                type="checkbox"
                checked={selectedValues.length === options.length && options.length > 0}
                onChange={handleToggleAll}
                className="w-4 h-4 rounded cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">
                Tous ({options.length})
              </span>
            </label>
            {selectedValues.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                title="Réinitialiser la sélection"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Liste des options */}
          <div className="max-h-60 overflow-y-auto">
            {options.length > 0 ? (
              options.map((option) => {
                const value = getOptionValue(option);
                const display = formatOptionDisplay(option);
                return (
                  <label 
                    key={value}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(value)}
                      onChange={() => handleToggleOption(option)}
                      className="w-4 h-4 rounded cursor-pointer accent-blue-500"
                    />
                    <span className="text-sm text-gray-700 flex-1">{display}</span>
                  </label>
                );
              })
            ) : (
              <div className="px-4 py-3 text-center text-gray-500 text-sm">
                Aucune option disponible
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
