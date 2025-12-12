import React, { useState, useRef, useEffect } from 'react';
import { Volume2, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { InstrumentType, getInstrumentOptions, setInstrument, getSelectedInstrument } from '../../engines/toneEngine';

interface InstrumentSelectorProps {
    selectedInstrument: InstrumentType;
    onInstrumentChange: (instrument: InstrumentType) => void;
    samplerLoaded: boolean;
}

const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({
    selectedInstrument,
    onInstrumentChange,
    samplerLoaded
}) => {
    const { theme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const options = [
        { id: 'bright' as InstrumentType, name: 'Bright Synth' },
        { id: 'mellow' as InstrumentType, name: 'Mellow Synth' },
        { id: 'organ' as InstrumentType, name: 'Organ Synth' },
        { 
            id: 'piano' as InstrumentType, 
            name: samplerLoaded ? 'Piano Samples' : 'Piano (Loading...)',
            loading: !samplerLoaded
        }
    ];

    const selectedOption = options.find(o => o.id === selectedInstrument) || options[0];

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSelect = (id: InstrumentType) => {
        onInstrumentChange(id);
        setInstrument(id);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-medium transition-colors"
                style={{
                    backgroundColor: theme.buttonBackground,
                    borderColor: isOpen ? theme.accent : theme.border,
                    color: theme.secondaryText
                }}
            >
                <Volume2 size={12} />
                <span className="max-w-24 truncate">{selectedOption.name}</span>
                <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div 
                    className="absolute top-full left-0 mt-1 w-44 rounded border shadow-lg z-50"
                    style={{
                        backgroundColor: theme.panelBackground,
                        borderColor: theme.border
                    }}
                >
                    {options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleSelect(option.id)}
                            className={`w-full px-3 py-2 text-left text-xs font-medium transition-colors flex items-center justify-between ${
                                option.id === selectedInstrument ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                            }`}
                            style={{
                                backgroundColor: option.id === selectedInstrument ? theme.buttonHoverBackground : 'transparent',
                                color: theme.text
                            }}
                        >
                            <span>{option.name}</span>
                            {option.id === selectedInstrument && (
                                <span style={{ color: theme.accent }}>✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InstrumentSelector;
