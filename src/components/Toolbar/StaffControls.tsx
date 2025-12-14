import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import ClefIcon from '../Assets/ClefIcon';
import { CLEF_TYPES, KEY_SIGNATURES } from '@/constants';
import ClefOverlay from './Menus/ClefOverlay';
import KeySignatureOverlay from './Menus/KeySignatureOverlay';
import TimeSignatureOverlay from './Menus/TimeSignatureOverlay';
import ToolbarButton from './ToolbarButton';

interface StaffControlsProps {
  clef: string;
  onClefChange: (clef: string) => void;
  keySignature: string;
  onKeySignatureChange: (key: string) => void;
  timeSignature: string;
  onTimeSignatureChange: (time: string) => void;
  variant?: 'default' | 'ghost';
}

export interface StaffControlsHandle {
  openClefMenu: () => void;
  openKeySigMenu: () => void;
  openTimeSigMenu: () => void;
  isMenuOpen: () => boolean;
}

const StaffControls = forwardRef<StaffControlsHandle, StaffControlsProps>(({
  clef,
  onClefChange,
  keySignature,
  onKeySignatureChange,
  timeSignature,
  onTimeSignatureChange,
  variant = "default"
}, ref) => {
  const [showClefMenu, setShowClefMenu] = useState(false);
  const [showKeySig, setShowKeySig] = useState(false);
  const [showTimeSig, setShowTimeSig] = useState(false);
  
  const clefBtnRef = useRef<HTMLButtonElement>(null);
  const keySigBtnRef = useRef<HTMLButtonElement>(null);
  const timeSigBtnRef = useRef<HTMLButtonElement>(null);

  useImperativeHandle(ref, () => ({
    openClefMenu: () => setShowClefMenu(true),
    openKeySigMenu: () => setShowKeySig(true),
    openTimeSigMenu: () => setShowTimeSig(true),
    isMenuOpen: () => showClefMenu || showKeySig || showTimeSig
  }), [showClefMenu, showKeySig, showTimeSig]);

  const currentClef = CLEF_TYPES[clef] || CLEF_TYPES['treble'];

  return (
    <div className="flex items-center gap-2">
        {/* Clef Selection */}
        <ToolbarButton
            ref={clefBtnRef}
            label={currentClef.label}
            showLabel={false}
            onClick={() => setShowClefMenu(!showClefMenu)}
            icon={
              <ClefIcon clef={clef || 'treble'} className="w-6 h-6" />
            }
            variant={variant}
        />
        {showClefMenu && (
            <ClefOverlay
                current={clef}
                onSelect={(c: string) => {
                    onClefChange(c);
                    setShowClefMenu(false);
                }}
                onClose={() => setShowClefMenu(false)}
                position={{ 
                    x: clefBtnRef.current?.getBoundingClientRect().left || 0, 
                    y: (clefBtnRef.current?.getBoundingClientRect().bottom || 0) + 5
                }}
                triggerRef={clefBtnRef as React.RefObject<HTMLElement>}
            />
        )}

        {/* Key Signature */}
        <ToolbarButton
            ref={keySigBtnRef}
            label={KEY_SIGNATURES[keySignature]?.label || keySignature}
            showLabel={true}
            onClick={() => setShowKeySig(!showKeySig)}
            className="text-xs font-bold"
            variant={variant}
        />
        {showKeySig && (
            <KeySignatureOverlay
                current={keySignature}
                clef={clef}
                onSelect={(k: string) => {
                    onKeySignatureChange(k);
                    setShowKeySig(false);
                }}
                onClose={() => setShowKeySig(false)}
            />
        )}

        {/* Time Signature */}
        <ToolbarButton
            ref={timeSigBtnRef}
            label={timeSignature}
            showLabel={true}
            onClick={() => setShowTimeSig(!showTimeSig)}
            className="text-xs font-bold"
            variant={variant}
        />
        {showTimeSig && (
            <TimeSignatureOverlay
                current={timeSignature}
                onSelect={(ts: string) => {
                    onTimeSignatureChange(ts);
                    setShowTimeSig(false);
                }}
                onClose={() => setShowTimeSig(false)}
                position={{ 
                    x: timeSigBtnRef.current?.getBoundingClientRect().left || 0, 
                    y: (timeSigBtnRef.current?.getBoundingClientRect().bottom || 0) + 5
                }}
                triggerRef={timeSigBtnRef as React.RefObject<HTMLElement>}
            />
        )}
    </div>
  );
});

StaffControls.displayName = 'StaffControls';

export default StaffControls;
