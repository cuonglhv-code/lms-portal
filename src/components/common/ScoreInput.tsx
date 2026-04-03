import React, { useState, useEffect } from 'react';

interface ScoreInputProps {
  value?: number;
  onChange: (val: number) => void;
}

export const ScoreInput: React.FC<ScoreInputProps> = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value?.toString() || '');

  useEffect(() => {
    setLocalValue(value?.toString() || '');
  }, [value]);

  return (
    <td className="px-6 py-4">
      <input
        type="number"
        min="0"
        max="100"
        step="0.1"
        className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => {
          const val = parseFloat(localValue);
          if (!isNaN(val)) onChange(val);
        }}
      />
    </td>
  );
};
