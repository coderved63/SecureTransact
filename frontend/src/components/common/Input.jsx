import { useState, useId } from 'react';

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  error,
  icon: Icon,
  disabled = false,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  const id = useId();
  const hasValue = value !== undefined && value !== null && value !== '';
  const floated = focused || hasValue;

  const wrapper = {
    position: 'relative',
    width: '100%',
  };

  const iconLeft = Icon ? 40 : 16;

  const inputStyle = {
    width: '100%',
    padding: `22px ${16}px 10px ${iconLeft}px`,
    fontSize: 14,
    fontFamily: 'var(--font-body)',
    fontWeight: 400,
    color: 'var(--text-primary)',
    background: 'var(--bg-card)',
    border: `1.5px solid ${error ? 'var(--danger)' : focused ? 'var(--accent)' : 'var(--border-light)'}`,
    borderRadius: 'var(--radius-md)',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: focused && !error
      ? '0 0 0 3px var(--accent-glow), inset 0 1px 3px rgba(0,0,0,0.04)'
      : error
        ? '0 0 0 3px rgba(214,59,74,0.1)'
        : 'none',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
  };

  const labelStyle = {
    position: 'absolute',
    left: iconLeft,
    top: floated ? 8 : 16,
    fontSize: floated ? 10 : 14,
    fontFamily: 'var(--font-body)',
    fontWeight: floated ? 600 : 400,
    color: error ? 'var(--danger)' : focused ? 'var(--accent)' : 'var(--text-muted)',
    letterSpacing: floated ? '0.05em' : '0',
    textTransform: floated ? 'uppercase' : 'none',
    pointerEvents: 'none',
    transition: 'all 0.2s ease',
    lineHeight: 1,
  };

  const iconStyle = {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: focused ? 'var(--accent)' : 'var(--text-muted)',
    transition: 'color 0.2s',
    pointerEvents: 'none',
  };

  const errorStyle = {
    fontSize: 12,
    color: 'var(--danger)',
    fontFamily: 'var(--font-body)',
    marginTop: 6,
    paddingLeft: 2,
  };

  return (
    <div>
      <div style={wrapper}>
        {Icon && (
          <div style={iconStyle}>
            <Icon size={16} strokeWidth={2} />
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          style={inputStyle}
          {...rest}
        />
        {label && <label htmlFor={id} style={labelStyle}>{label}</label>}
      </div>
      {error && <div style={errorStyle}>{error}</div>}
    </div>
  );
}
