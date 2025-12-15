import React, { useState, useRef } from 'react';
import { AudioWaveform, Check } from 'lucide-react';
import { InstrumentType, setInstrument } from '@/engines/toneEngine';
import DropdownOverlay, { DropdownItem, DropdownTrigger } from './Menus/DropdownOverlay';

interface InstrumentSelectorProps {
  selectedInstrument: InstrumentType;
  onInstrumentChange: (instrument: InstrumentType) => void;
  samplerLoaded: boolean;
  height?: string;
}

const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({
  selectedInstrument,
  onInstrumentChange,
  samplerLoaded,
  height = 'h-9',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const options = [
    { id: 'bright' as InstrumentType, name: 'Bright Synth' },
    { id: 'mellow' as InstrumentType, name: 'Mellow Synth' },
    { id: 'organ' as InstrumentType, name: 'Organ Synth' },
    {
      id: 'piano' as InstrumentType,
      name: samplerLoaded ? 'Piano Samples' : 'Piano (Loading...)',
      loading: !samplerLoaded,
    },
  ];

  const selectedOption = options.find((o) => o.id === selectedInstrument) || options[0];

  const handleSelect = (id: InstrumentType) => {
    onInstrumentChange(id);
    setInstrument(id);
    setIsOpen(false);
  };

  // Calculate dropdown position
  const getPosition = () => {
    if (!buttonRef.current) return { x: 0, y: 0 };
    const rect = buttonRef.current.getBoundingClientRect();
    return { x: rect.left, y: rect.bottom + 4 };
  };

  return (
    <div className="relative">
      <DropdownTrigger
        ref={buttonRef}
        label={selectedOption.name}
        icon={<AudioWaveform size={14} />}
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        height={height}
      />

      {isOpen && (
        <DropdownOverlay
          onClose={() => setIsOpen(false)}
          position={getPosition()}
          triggerRef={buttonRef as React.RefObject<HTMLElement>}
          width={176}
        >
          <div className="p-1">
            {options.map((option) => (
              <DropdownItem
                key={option.id}
                onClick={() => handleSelect(option.id)}
                isSelected={option.id === selectedInstrument}
              >
                <span className="flex items-center justify-between w-full">
                  <span>{option.name}</span>
                  {option.id === selectedInstrument && (
                    <Check size={12} className="text-green-600" />
                  )}
                </span>
              </DropdownItem>
            ))}
          </div>
        </DropdownOverlay>
      )}
    </div>
  );
};

export default InstrumentSelector;
