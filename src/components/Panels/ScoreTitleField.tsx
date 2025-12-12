import React from 'react';

interface ScoreTitleFieldProps {
  title: string;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  buffer: string;
  setBuffer: (value: string) => void;
  commit: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  theme: {
    text: string;
    border: string;
  };
}

/**
 * Displays the score title as an h2 or an editable input field.
 */
export function ScoreTitleField({
  title,
  isEditing,
  setIsEditing,
  buffer,
  setBuffer,
  commit,
  inputRef,
  theme
}: ScoreTitleFieldProps) {
  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={buffer}
        onChange={(e) => setBuffer(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        className="font-bold font-serif text-3xl px-2 py-0 rounded outline-none bg-transparent"
        style={{ color: theme.text, borderColor: theme.border, borderWidth: '1px' }}
      />
    );
  }

  return (
    <h2 
      onClick={() => setIsEditing(true)}
      className="font-bold font-serif text-3xl px-2 py-0 rounded hover:bg-white/10 cursor-pointer transition-colors inline-block"
      style={{ color: theme.text }}
    >
      {title}
    </h2>
  );
}
