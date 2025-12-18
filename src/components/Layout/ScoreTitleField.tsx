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
  scale?: number;
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
  theme,
  scale = 1,
}: ScoreTitleFieldProps) {
  // Base font size is 1.875rem (text-3xl), scaled by the zoom factor
  const fontSize = `calc(1.875rem * ${scale})`;

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={buffer}
        onChange={(e) => setBuffer(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        className="ScoreTitleFieldInput font-bold font-serif px-1 mx-[1.5rem] py-0 rounded outline-none bg-transparent"
        style={{ color: theme.text, borderColor: theme.border, borderWidth: '1px', fontSize }}
      />
    );
  }

  return (
    <h2
      onClick={() => setIsEditing(true)}
      className="ScoreTitleField font-bold font-serif px-[1.75rem] py-0 rounded hover:bg-white/10 cursor-pointer transition-colors inline-block"
      style={{ color: theme.text, borderColor: 'transparent', borderWidth: '1px', fontSize }}
    >
      {title}
    </h2>
  );
}
