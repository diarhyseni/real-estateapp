import React from "react";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ options, value, onChange, placeholder }) => {
  const [open, setOpen] = React.useState(false);
  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };
  const display =
    value.length === 0
      ? placeholder || "Zgjidh opsionet"
      : options.filter(o => value.includes(o.value)).map(o => o.label).join(", ");
  return (
    <div className="relative">
      <button
        type="button"
        className="w-full border rounded px-3 py-2 text-left bg-white"
        onClick={() => setOpen(o => !o)}
      >
        {display}
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto">
          {options.map(option => (
            <label key={option.value} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => toggleOption(option.value)}
                className="mr-2"
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}; 