import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const CustomDatePicker = ({ value, onChange, placeholder = 'Pilih Tanggal', disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Parse initial date
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  useEffect(() => {
    if (value && value !== '-') {
      const parts = value.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        setCurrentMonth(month);
        setCurrentYear(year);
      }
    }
  }, [value, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDay = (day) => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const newDateStr = `${currentYear}-${monthStr}-${dayStr}`;
    onChange(newDateStr);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('-');
    setIsOpen(false);
  };

  const handleToday = () => {
    const t = new Date();
    const monthStr = String(t.getMonth() + 1).padStart(2, '0');
    const dayStr = String(t.getDate()).padStart(2, '0');
    const newDateStr = `${t.getFullYear()}-${monthStr}-${dayStr}`;
    onChange(newDateStr);
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const days = [];

  for (let i = 0; i < firstDay; i++) days.push({ empty: true });
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ day: i, dateStr });
  }

  // Format display text
  const getDisplayText = () => {
    if (!value || value === '-') return placeholder;
    const parts = value.split('-');
    if (parts.length !== 3) return value;
    const day = parseInt(parts[2], 10);
    const month = monthNames[parseInt(parts[1], 10) - 1];
    const year = parts[0];
    return `${day} ${month} ${year}`;
  };

  return (
    <div className={`relative w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={dropdownRef}>
      <div 
        className="w-full bg-forest-bg border border-white/10 rounded-lg px-3 py-2 text-sm outline-none cursor-pointer flex justify-between items-center hover:border-emerald-500/50 transition-colors animate-fade-in"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value && value !== '-' ? "text-emerald-400 font-semibold text-sm" : "text-gray-400 text-sm"}>
          {getDisplayText()}
        </span>
        <Calendar size={16} className="text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-[110] w-[280px] mt-1 bg-[#0a1a12]/95 border border-emerald-500/30 rounded-xl shadow-2xl p-4 right-0 md:left-0 backdrop-blur-md animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold text-gray-200">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-gray-400 mb-2 uppercase">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => <div key={d}>{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {days.map((d, index) => {
              if (d.empty) return <div key={`empty-${index}`} className="h-6"></div>;
              
              const isSelected = value === d.dateStr;
              const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, d.day).toDateString();
              
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectDay(d.day)}
                  className={`h-7 w-7 text-xs font-semibold rounded-lg flex items-center justify-center transition-all
                    ${isSelected ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-gray-300 hover:bg-white/5 hover:text-white'}
                    ${isToday && !isSelected ? 'border border-emerald-500/40 text-emerald-400 font-bold' : ''}
                  `}
                >
                  {d.day}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between mt-4 pt-3 border-t border-white/10 text-xs font-medium">
            <button type="button" onClick={handleClear} className="text-red-400 hover:text-red-300 transition-colors">
              Hapus
            </button>
            <button type="button" onClick={handleToday} className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Hari ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
