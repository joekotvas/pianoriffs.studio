import React, { useState, useRef } from 'react';
import { Menu, Copy, Check, Download, FileJson, Music, FileCode } from 'lucide-react';
import ToolbarButton from './ToolbarButton';
import DropdownOverlay from './Menus/DropdownOverlay';
import { useTheme } from '@/context/ThemeContext';
import { useExport, ExportFormat } from '@/hooks/useExport';
import { Score } from '@/types';

interface FileMenuProps {
  score: Score;
  bpm: number;
  height?: string;
  variant?: 'default' | 'ghost';
}

// Reusable export action button with hover effect
interface ExportButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  successIcon?: React.ReactNode;
  label: string;
  isSuccess?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onClick,
  icon,
  successIcon = <Check size={14} />,
  label,
  isSuccess = false,
}) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="p-1.5 rounded transition-colors"
      style={{
        backgroundColor: isSuccess
          ? 'transparent'
          : isHovered
            ? theme.buttonHoverBackground
            : theme.buttonBackground,
        color: isSuccess ? '#4ade80' : theme.text,
        borderColor: theme.border,
      }}
      title={label}
    >
      {isSuccess ? successIcon : icon}
    </button>
  );
};

interface ExportRowProps {
  label: string;
  icon: React.ReactNode;
  format: ExportFormat;
  onCopy: (format: ExportFormat) => Promise<void>;
  onDownload: (format: ExportFormat) => Promise<void>;
  feedback: string | null;
}

const ExportRow: React.FC<ExportRowProps> = ({
  label,
  icon,
  format,
  onCopy,
  onDownload,
  feedback,
}) => {
  const { theme } = useTheme();
  const isCopied = feedback === `${format}-copy`;
  const isDownloaded = feedback === `${format}-download`;

  return (
    <div
      className="flex items-center justify-between px-4 py-2 border-b last:border-b-0"
      style={{ borderColor: theme.border }}
    >
      <div className="flex items-center gap-2 text-sm" style={{ color: theme.text }}>
        <span style={{ color: theme.secondaryText }}>{icon}</span>
        {label}
      </div>
      <div className="flex gap-1">
        <ExportButton
          onClick={() => onCopy(format)}
          icon={<Copy size={14} />}
          label="Copy to clipboard"
          isSuccess={isCopied}
        />
        <ExportButton
          onClick={() => onDownload(format)}
          icon={<Download size={14} />}
          label="Download file"
          isSuccess={isDownloaded}
        />
      </div>
    </div>
  );
};

const FileMenu: React.FC<FileMenuProps> = ({ score, bpm, height = 'h-9', variant = 'default' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { theme } = useTheme();
  const { copyToClipboard, downloadFile } = useExport(score, bpm);

  const handleAction = async (format: ExportFormat, action: 'copy' | 'download') => {
    try {
      if (action === 'copy') {
        await copyToClipboard(format);
      } else {
        await downloadFile(format);
      }
      setFeedback(`${format}-${action}`);
      setTimeout(() => {
        setFeedback(null);
        setIsOpen(false);
      }, 1000);
    } catch (error) {
      console.error(`Export failed:`, error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFeedback(null);
  };

  return (
    <div className="relative">
      <ToolbarButton
        ref={buttonRef}
        icon={<Menu size={18} />}
        label="File Menu"
        onClick={() => setIsOpen(!isOpen)}
        isActive={isOpen}
        preventFocus={true}
        height={height}
        variant={variant}
      />

      {isOpen && (
        <DropdownOverlay
          onClose={handleClose}
          triggerRef={buttonRef as React.RefObject<HTMLElement>}
          position={{
            x: buttonRef.current?.getBoundingClientRect().left || 0,
            y: (buttonRef.current?.getBoundingClientRect().bottom || 0) + 5,
          }}
          width={220}
        >
          <div
            className="px-4 py-2 border-b"
            style={{
              backgroundColor: theme.buttonHoverBackground,
              borderColor: theme.border,
            }}
          >
            <h3 className="font-semibold text-sm" style={{ color: theme.text }}>
              Export
            </h3>
          </div>

          <ExportRow
            label="JSON"
            icon={<FileJson size={14} />}
            format="json"
            onCopy={(f) => handleAction(f, 'copy')}
            onDownload={(f) => handleAction(f, 'download')}
            feedback={feedback}
          />
          <ExportRow
            label="ABC Notation"
            icon={<Music size={14} />}
            format="abc"
            onCopy={(f) => handleAction(f, 'copy')}
            onDownload={(f) => handleAction(f, 'download')}
            feedback={feedback}
          />
          <ExportRow
            label="MusicXML"
            icon={<FileCode size={14} />}
            format="musicxml"
            onCopy={(f) => handleAction(f, 'copy')}
            onDownload={(f) => handleAction(f, 'download')}
            feedback={feedback}
          />
        </DropdownOverlay>
      )}
    </div>
  );
};

export default FileMenu;
