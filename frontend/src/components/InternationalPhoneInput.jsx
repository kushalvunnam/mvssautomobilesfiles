import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

const countries = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰' },
  { code: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵' },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴' },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮' },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰' },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪' },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷' },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '🇭🇰' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳' }
];

export const parsePhone = (phoneVal) => {
  if (!phoneVal) return { country: null, nationalNumber: '' };
  
  // Sort countries by dialCode length descending to match longer dial codes first (e.g. +971 vs +9)
  const sortedCountries = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);
  
  for (const c of sortedCountries) {
    if (phoneVal.startsWith(c.dialCode)) {
      return {
        country: c,
        nationalNumber: phoneVal.slice(c.dialCode.length)
      };
    }
  }
  
  const cleanVal = phoneVal.startsWith('+') ? phoneVal : '+' + phoneVal;
  for (const c of sortedCountries) {
    if (cleanVal.startsWith(c.dialCode)) {
      return {
        country: c,
        nationalNumber: cleanVal.slice(c.dialCode.length)
      };
    }
  }

  return { country: null, nationalNumber: phoneVal };
};

export const CountryFlag = ({ country, className = "w-5 h-3.5 shrink-0" }) => {
  const [imgError, setImgError] = useState(false);
  
  if (!country) return null;
  
  if (imgError) {
    return <span className="text-sm shrink-0 leading-none">{country.flag}</span>;
  }
  
  return (
    <img 
      src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`} 
      alt={country.name}
      className={`${className} object-cover rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.15)] border border-slate-200/50 dark:border-slate-800/50`}
      onError={() => setImgError(true)}
    />
  );
};

export const PhoneWithFlag = ({ phone, className = "", textClassName = "" }) => {
  if (!phone) return null;
  const { country, nationalNumber } = parsePhone(phone);
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {country ? (
        <CountryFlag country={country} className="w-4 h-3 shrink-0" />
      ) : (
        <span className="text-sm shrink-0">🌐</span>
      )}
      <span className={textClassName}>{phone}</span>
    </span>
  );
};

export { countries };

const InternationalPhoneInput = ({
  value = '',
  onChange,
  onBlur,
  disabled = false,
  error = false,
  name = 'phone',
  required = false,
  country = 'IN',
  variant = 'standard',
  ariaLabel = 'Phone number',
  ariaInvalid,
  ariaDescribedby,
  ...props
}) => {
  const defaultCountryObj = countries.find(c => c.code === (country || 'IN')) || countries[0];
  const [selectedCountry, setSelectedCountry] = useState(defaultCountryObj);
  const [nationalNum, setNationalNum] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Synchronize external value changes
  useEffect(() => {
    if (value) {
      const { country: matchedCountry, nationalNumber } = parsePhone(value);
      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
        setNationalNum(nationalNumber);
      } else {
        setNationalNum(value);
      }
    } else {
      setNationalNum('');
    }
  }, [value]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setSearchText('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [dropdownOpen]);

  const handleNationalNumberChange = (e) => {
    const inputVal = e.target.value.replace(/[^\d]/g, ''); // only digits
    setNationalNum(inputVal);
    
    // Notify parent
    const fullVal = selectedCountry.dialCode + inputVal;
    if (onChange) {
      onChange(fullVal);
    }
  };

  const handleCountrySelect = (countryObj) => {
    setSelectedCountry(countryObj);
    setDropdownOpen(false);
    setSearchText('');
    
    // Notify parent
    const fullVal = countryObj.dialCode + nationalNum;
    if (onChange) {
      onChange(fullVal);
    }
  };

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchText.toLowerCase()) ||
    c.dialCode.includes(searchText) ||
    c.code.toLowerCase().includes(searchText.toLowerCase())
  );

  const isCompact = variant === 'compact';
  
  const containerClass = `relative flex items-center w-full bg-slate-50 dark:bg-slate-950 border rounded-xl transition-all duration-200 ${
    error 
      ? 'border-red-500 focus-within:ring-red-500/15 focus-within:border-red-500' 
      : 'border-slate-200 dark:border-slate-800 focus-within:ring-indigo-600/10 focus-within:border-indigo-600 focus-within:bg-white dark:focus-within:bg-slate-900'
  } ${isCompact ? 'h-[38px]' : 'h-[42px]'}`;

  const countryButtonClass = `flex items-center gap-1 px-2.5 h-full border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-l-xl transition-colors cursor-pointer select-none shrink-0 ${
    isCompact ? 'text-[11px]' : 'text-xs'
  }`;

  const inputClass = `w-full h-full px-3 bg-transparent text-slate-800 dark:text-slate-100 outline-none border-none ring-0 focus:ring-0 focus:outline-none font-medium ${
    isCompact ? 'text-[11px]' : 'text-xs'
  }`;

  return (
    <div className="relative w-full text-left" ref={dropdownRef}>
      <div className={containerClass}>
        {/* Country Picker Toggle Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={countryButtonClass}
          aria-label="Select Country Code"
        >
          <CountryFlag country={selectedCountry} className="w-5 h-3.5 shrink-0 rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.15)]" />
          <span className="font-semibold">{selectedCountry.dialCode}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>

        {/* National Number Input */}
        <input
          type="tel"
          name={name}
          value={nationalNum}
          onChange={handleNationalNumberChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          aria-label={ariaLabel}
          aria-invalid={ariaInvalid || error}
          aria-describedby={ariaDescribedby}
          placeholder="Phone number"
          className={inputClass}
          {...props}
        />
      </div>

      {/* Searchable Dropdown List */}
      {dropdownOpen && (
        <div className="absolute left-0 mt-1 w-72 max-w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in flex flex-col">
          {/* Search Header */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              ref={searchInputRef}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search country or code..."
              className="w-full bg-transparent border-none text-[11px] font-semibold text-slate-800 dark:text-slate-100 outline-none focus:outline-none focus:ring-0 p-0"
            />
            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText('')}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Country List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/30">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleCountrySelect(c)}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                    selectedCountry.code === c.code ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CountryFlag country={c} className="w-5 h-3.5 shrink-0 rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.15)]" />
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {c.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-mono shrink-0">
                    {c.dialCode}
                  </span>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-[10px] font-semibold text-slate-400">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InternationalPhoneInput;
