import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const InternationalPhoneInput = ({
  value,
  onChange,
  onBlur,
  disabled = false,
  error = false,
  name = 'phone',
  required = false,
  country = 'in',
  enableSearch = true,
  searchPlaceholder = 'Search country...',
  variant = 'standard',
  ariaLabel = 'Phone number',
  ariaInvalid,
  ariaDescribedby,
  ...props
}) => {
  return (
    <div className="relative flex items-center international-phone-wrapper">
      <PhoneInput
        country={country}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        enableSearch={enableSearch}
        searchPlaceholder={searchPlaceholder}
        inputProps={{
          name,
          required,
          'aria-label': ariaLabel,
          'aria-invalid': ariaInvalid || error,
          'aria-describedby': ariaDescribedby,
        }}
        inputStyle={{
          width: '100%',
          height: variant === 'compact' ? '38px' : '42px',
          paddingLeft: '48px',
          paddingRight: variant === 'compact' ? '14px' : '16px',
          paddingTop: variant === 'compact' ? '8px' : '12px',
          paddingBottom: variant === 'compact' ? '8px' : '12px',
          backgroundColor: '#f8fafc',
          border: error ? '1px solid #ef4444' : '1px solid #e2e8f0',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: variant === 'compact' ? '600' : '500',
          fontFamily: 'inherit',
          transition: 'all 0.2s',
        }}
        buttonStyle={{
          border: 'none',
          background: 'transparent',
          paddingLeft: '8px',
        }}
        dropdownStyle={{
          backgroundColor: '#ffffff',
          color: '#334155',
          fontSize: '0.75rem',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        }}
        {...props}
      />
    </div>
  );
};

export default InternationalPhoneInput;
