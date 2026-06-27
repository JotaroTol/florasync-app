import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, placeholder, className, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className={`relative ${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={dropdownRef}>
      <div 
        className="w-full bg-forest-bg border border-white/10 rounded-lg px-3 py-2 text-sm outline-none cursor-pointer flex justify-between items-center hover:border-emerald-500/50 transition-colors"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? "text-emerald-400 font-semibold" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-[#0a1a12] border border-emerald-500/30 rounded-lg shadow-xl overflow-hidden backdrop-blur-md">
          <div className="max-h-60 overflow-y-auto">
            {options.map((opt, i) => (
              <div 
                key={i}
                className={`px-3 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors
                  ${value === opt.value ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'}
                `}
                onClick={() => {
                  if (opt.disabled) return;
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <span className={opt.disabled ? 'opacity-50' : ''}>{opt.label}</span>
                {value === opt.value && <Check size={16} className="text-emerald-500" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
