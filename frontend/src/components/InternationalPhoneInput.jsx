import React from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const InternationalPhoneInput = ({
  value,
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
  return (
    <div className="relative flex items-center international-phone-wrapper">
      <PhoneInput
        international
        countryCallingCodeEditable={false}
        defaultCountry={country}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        name={name}
        required={required}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid || error}
        aria-describedby={ariaDescribedby}
        className={`phone-input-${variant} ${error ? 'error' : ''}`}
        style={{
          width: '100%',
          height: variant === 'compact' ? '38px' : '42px',
          backgroundColor: '#f8fafc',
          border: error ? '1px solid #ef4444' : '1px solid #e2e8f0',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: variant === 'compact' ? '600' : '500',
          fontFamily: 'inherit',
          transition: 'all 0.2s',
          padding: variant === 'compact' ? '8px 14px' : '12px 16px',
        }}
        {...props}
      />
    </div>
  );
};

export default InternationalPhoneInput;
