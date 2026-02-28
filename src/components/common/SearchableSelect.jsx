import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

const SearchableSelect = ({
    options = [],
    value,
    onChange,
    placeholder = 'Sélectionner...',
    label,
    name,
    error,
    required = false,
    disabled = false,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = useMemo(() =>
        options.find(opt => opt.value === value),
        [options, value]
    );

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        const lowerSearch = searchTerm.toLowerCase();
        return options.filter(opt =>
            opt.label.toLowerCase().includes(lowerSearch) ||
            (opt.description && opt.description.toLowerCase().includes(lowerSearch))
        );
    }, [options, searchTerm]);

    const triggerChange = (val) => {
        // Pass the same event structure as standard HTML select for compatibility with existing handleChange functions
        onChange({
            target: {
                name: name,
                value: val
            }
        });
    };

    const handleOpen = () => {
        if (disabled) return;
        setIsOpen(true);
        // Autofocus search input when opening
        setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
        }, 100);
    };

    return (
        <div ref={containerRef} className={`w-full relative ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
                    disabled={disabled}
                    className={`
            w-full px-4 py-2 text-left bg-white border rounded-lg flex items-center justify-between transition-all duration-200
            ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'text-gray-900 hover:border-gray-400'}
          `}
                >
                    <span className={`block truncate ${!selectedOption ? 'text-gray-500' : ''}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown
                        size={18}
                        className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] overflow-hidden">
                        {/* Search Input */}
                        <div className="p-2 border-b border-gray-100 bg-gray-50">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="Rechercher..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Options List */}
                        <div className="max-h-64 overflow-y-auto py-1">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            triggerChange(option.value);
                                            setIsOpen(false);
                                            setSearchTerm('');
                                        }}
                                        className={`
                      w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors
                      ${option.value === value ? 'bg-primary/5 text-primary font-semibold' : 'text-gray-700 hover:bg-gray-50'}
                    `}
                                    >
                                        <div className="flex flex-col">
                                            <span className="block truncate">{option.label}</span>
                                            {option.description && (
                                                <span className="text-[10px] text-gray-400 font-normal truncate">{option.description}</span>
                                            )}
                                        </div>
                                        {option.value === value && <Check size={14} className="text-primary shrink-0" />}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center">
                                    <p className="text-sm text-gray-400 italic">Aucun résultat trouvé pour "{searchTerm}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
            )}
        </div>
    );
};

export default SearchableSelect;
