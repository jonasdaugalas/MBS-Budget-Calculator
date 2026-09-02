import React, { useState, useEffect, useRef } from 'react';

export interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number | string;
  decimals?: number;
  fallbackValue?: number;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onValueChange,
  min,
  max,
  step,
  decimals,
  fallbackValue,
  className = '',
  onFocus,
  onBlur,
  ...props
}) => {
  const [localString, setLocalString] = useState<string>(() => (value === undefined || isNaN(value) ? '0' : value.toString()));
  const isFocusedRef = useRef(false);

  // Synchronize when external value changes while NOT actively focused by the user
  useEffect(() => {
    if (!isFocusedRef.current) {
      setLocalString(value === undefined || isNaN(value) ? '0' : value.toString());
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Standardize European comma to dot for friendly localized numpad entry
    let valStr = e.target.value.replace(',', '.');

    // Only allow numeric / partial float characters (optional minus, digits, optional decimal)
    if (!/^-?\d*\.?\d*$/.test(valStr)) {
      return;
    }

    setLocalString(valStr);

    // If it's a complete valid number, dispatch change without prematurely clamping or forcing "0"
    if (valStr !== '' && valStr !== '-' && valStr !== '.' && valStr !== '-.') {
      const parsed = parseFloat(valStr);
      if (!isNaN(parsed) && isFinite(parsed)) {
        onValueChange(parsed);
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = true;
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = false;

    let finalNum: number;
    const trimmed = localString.trim();

    if (trimmed === '' || trimmed === '-' || trimmed === '.' || trimmed === '-.' || isNaN(Number(trimmed))) {
      finalNum = fallbackValue !== undefined ? fallbackValue : (min !== undefined ? min : 0);
    } else {
      finalNum = parseFloat(trimmed);
      if (min !== undefined && finalNum < min) finalNum = min;
      if (max !== undefined && finalNum > max) finalNum = max;
      if (decimals !== undefined) {
        finalNum = Number(finalNum.toFixed(decimals));
      }
    }

    setLocalString(finalNum.toString());
    onValueChange(finalNum);

    if (onBlur) onBlur(e);
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={localString}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className}
      {...props}
    />
  );
};
