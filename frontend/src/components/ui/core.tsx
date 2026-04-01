import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  className = '', 
  disabled,
  ...props 
}) => {
  const sizes = {
    xs: "px-2.5 py-1.5 text-xs",
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  const variants = {
    primary: `
      bg-brand-500 text-white 
      hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/25 hover:-translate-y-0.5
      focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:outline-none
      active:scale-[0.98] active:translate-y-0
    `,
    secondary: `
      bg-primary-500 text-white 
      hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5
      focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none
      active:scale-[0.98] active:translate-y-0
    `,
    success: `
      bg-success-500 text-white 
      hover:bg-success-600 hover:shadow-lg hover:shadow-success-500/25 hover:-translate-y-0.5
      focus:ring-2 focus:ring-success-500 focus:ring-offset-2 focus:outline-none
      active:scale-[0.98] active:translate-y-0
    `,
    danger: `
      bg-danger-500 text-white 
      hover:bg-danger-600 hover:shadow-lg hover:shadow-danger-500/25 hover:-translate-y-0.5
      focus:ring-2 focus:ring-danger-500 focus:ring-offset-2 focus:outline-none
      active:scale-[0.98] active:translate-y-0
    `,
    outline: `
      border-2 border-secondary-300 text-text-primary bg-surface 
      hover:bg-secondary-50 hover:border-secondary-400 hover:shadow-sm hover:-translate-y-0.5
      focus:ring-2 focus:ring-secondary-400 focus:ring-offset-2 focus:outline-none
      active:scale-[0.98] active:translate-y-0
    `,
    ghost: `
      text-text-secondary bg-transparent 
      hover:bg-secondary-100 hover:text-text-primary
      focus:ring-2 focus:ring-secondary-300 focus:ring-offset-2 focus:outline-none
    `,
  };

  return (
    <button 
      className={`
        font-medium rounded-xl 
        transition-all duration-200 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none
        inline-flex items-center justify-center gap-2
        ${sizes[size]} 
        ${variants[variant]} 
        ${className}
      `} 
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
};

export const Spinner: React.FC<{ size?: 'xs' | 'sm' | 'md' | 'lg'; className?: string }> = ({ size = 'md', className = '' }) => {
  const sizes = { xs: 'w-3 h-3', sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  return (
    <svg className={`animate-spin ${sizes[size]} ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, error, helperText, hint, className = '', ...props }, ref) => (
  <div className="w-full space-y-1.5">
    {label && (
      <label className="block text-sm font-medium text-text-primary transition-colors duration-200">
        {label}
      </label>
    )}
    <input 
      ref={ref}
      className={`
        w-full px-4 py-2.5 bg-surface border rounded-xl 
        text-text-primary placeholder:text-text-tertiary 
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:shadow-lg focus:shadow-brand-500/10
        hover:border-secondary-300
        disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-secondary-50
        ${error 
          ? 'border-danger-500 focus:ring-danger-500/30 focus:border-danger-500 focus:shadow-danger-500/10 hover:border-danger-400' 
          : 'border-secondary-200'
        } 
        ${className}
      `} 
      {...props} 
    />
    {error && (
      <p className="text-xs text-danger-600 flex items-center gap-1.5 animate-fade-in">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </p>
    )}
    {helperText && !error && <p className="text-xs text-text-tertiary">{helperText}</p>}
    {hint && <p className="text-xs text-text-tertiary">{hint}</p>}
  </div>
));
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, helperText, className = '', ...props }, ref) => (
  <div className="w-full space-y-1.5">
    {label && (
      <label className="block text-sm font-medium text-text-primary transition-colors duration-200">
        {label}
      </label>
    )}
    <textarea 
      ref={ref}
      className={`
        w-full px-4 py-3 bg-surface border rounded-xl 
        text-text-primary placeholder:text-text-tertiary 
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:shadow-lg focus:shadow-brand-500/10
        hover:border-secondary-300
        resize-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-secondary-50
        ${error 
          ? 'border-danger-500 focus:ring-danger-500/30 focus:border-danger-500 focus:shadow-danger-500/10 hover:border-danger-400' 
          : 'border-secondary-200'
        } 
        ${className}
      `} 
      {...props} 
    />
    {error && (
      <p className="text-xs text-danger-600 flex items-center gap-1.5 animate-fade-in">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </p>
    )}
    {helperText && !error && <p className="text-xs text-text-tertiary">{helperText}</p>}
  </div>
));
Textarea.displayName = 'Textarea';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false, 
  onClick,
  variant = 'default',
  padding = 'md'
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const interactive = hover || onClick;

  const variants = {
    default: 'bg-white border border-secondary-200 shadow-sm',
    elevated: 'bg-white border border-secondary-200 shadow-md',
    flat: 'bg-secondary-50 border border-transparent',
  };

  return (
    <div 
      className={`
        rounded-xl transition-all duration-200 ease-out
        ${variants[variant]} 
        ${paddingStyles[padding]} 
        ${interactive 
          ? `
            cursor-pointer 
            hover:shadow-lg hover:border-secondary-300 hover:-translate-y-1
            active:translate-y-0 active:shadow-md
            focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none
          ` 
          : ''
        } 
        ${className}
      `}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
};

interface BadgeProps {
  children?: React.ReactNode;
  status?: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, status = 'PENDING', variant, size = 'sm' }) => {
  const statusColors: Record<string, string> = {
    PENDING: 'bg-secondary-100 text-secondary-700 border-secondary-200',
    DRAFT: 'bg-secondary-100 text-secondary-700 border-secondary-200',
    SUBMITTED: 'bg-warning-50 text-warning-700 border-warning-200',
    UNDER_REVIEW: 'bg-primary-50 text-primary-700 border-primary-200',
    APPROVED: 'bg-success-50 text-success-700 border-success-200',
    FUNDS_RELEASED: 'bg-success-50 text-success-700 border-success-200',
    DISPUTED: 'bg-danger-50 text-danger-700 border-danger-200',
    CONTRACT_REVIEW: 'bg-primary-50 text-primary-700 border-primary-200',
    AWAITING_DEPOSIT: 'bg-accent-50 text-accent-700 border-accent-200',
    ACTIVE: 'bg-success-50 text-success-700 border-success-200',
    COMPLETED: 'bg-success-50 text-success-700 border-success-200',
    CANCELLED: 'bg-secondary-100 text-secondary-700 border-secondary-200',
    OPEN: 'bg-primary-50 text-primary-700 border-primary-200',
    AWAITING_RESPONSE: 'bg-warning-50 text-warning-700 border-warning-200',
    IN_MEDIATION: 'bg-accent-50 text-accent-700 border-accent-200',
    RESOLVED: 'bg-success-50 text-success-700 border-success-200',
  };

  const variantColors: Record<string, string> = {
    success: 'bg-success-50 text-success-700 border-success-200',
    warning: 'bg-warning-50 text-warning-700 border-warning-200',
    danger: 'bg-danger-50 text-danger-700 border-danger-200',
    info: 'bg-primary-50 text-primary-700 border-primary-200',
    neutral: 'bg-secondary-100 text-secondary-700 border-secondary-200',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const classes = variant ? variantColors[variant] : (statusColors[status] || statusColors.PENDING);
  return (
    <span className={`
      inline-flex items-center font-semibold rounded-full border 
      transition-colors duration-200
      ${sizeStyles[size]} ${classes}
    `}>
      {children || status}
    </span>
  );
};

interface AlertProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ children, variant = 'info', title, dismissible = false, onDismiss }) => {
  const variants = {
    success: 'bg-success-50/90 border-success-200 text-success-800 backdrop-blur-sm',
    warning: 'bg-warning-50/90 border-warning-200 text-warning-800 backdrop-blur-sm',
    danger: 'bg-danger-50/90 border-danger-200 text-danger-800 backdrop-blur-sm',
    info: 'bg-primary-50/90 border-primary-200 text-primary-800 backdrop-blur-sm',
  };
  
  const icons = {
    success: (
      <svg className="w-5 h-5 text-success-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-warning-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    danger: (
      <svg className="w-5 h-5 text-danger-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-primary-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className={`
      p-4 rounded-xl border flex gap-3 shadow-sm
      transition-all duration-200 ease-out
      ${variants[variant]}
    `}>
      <span className="mt-0.5">{icons[variant]}</span>
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>
      {dismissible && onDismiss && (
        <button 
          onClick={onDismiss} 
          className="
            flex-shrink-0 text-current opacity-50 
            hover:opacity-100 hover:scale-110 
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-1 rounded
          "
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: 'default' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  max = 100, 
  label, 
  showValue = true,
  variant = 'default',
  size = 'md'
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const variants = {
    default: 'bg-gradient-to-r from-primary-500 to-primary-600',
    success: 'bg-gradient-to-r from-success-500 to-success-600',
    warning: 'bg-gradient-to-r from-warning-500 to-warning-600',
  };

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const bgColors = {
    sm: 'bg-secondary-100',
    md: 'bg-secondary-100',
    lg: 'bg-secondary-100',
  };
  
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between mb-2 text-sm">
          {label && <span className="font-medium text-text-primary">{label}</span>}
          {showValue && <span className="text-text-tertiary font-medium">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`w-full ${bgColors[size]} rounded-full overflow-hidden ${sizes[size]} shadow-inner`}>
        <div 
          className={`
            h-full rounded-full 
            transition-all duration-500 ease-out
            ${variants[variant]}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, name, size = 'md', className = '', onClick }) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const interactive = !!onClick;

  if (src) {
    return (
      <img 
        src={src} 
        alt={alt || name || 'Avatar'} 
        onClick={onClick}
        className={`
          rounded-full object-cover 
          transition-all duration-200 ease-out
          ${sizes[size]} 
          ${interactive ? 'cursor-pointer hover:ring-2 hover:ring-brand-500 hover:ring-offset-2' : ''}
          ${className}
        `}
      />
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`
        rounded-full 
        bg-gradient-to-br from-brand-400 to-brand-600 
        text-white font-semibold 
        flex items-center justify-center 
        transition-all duration-200 ease-out
        ${sizes[size]} 
        ${interactive ? 'cursor-pointer hover:shadow-lg hover:shadow-brand-500/25 hover:scale-105' : ''}
        ${className}
      `}
    >
      {name ? getInitials(name) : '?'}
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'text',
  width,
  height 
}) => {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div 
      className={`
        bg-secondary-200 animate-pulse
        transition-opacity duration-500
        ${variants[variant]} 
        ${className}
      `}
      style={style}
    />
  );
};

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, position = 'top' }) => {
  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative group inline-block">
      {children}
      <div className={`
        absolute ${positionStyles[position]} 
        px-2.5 py-1.5 text-xs text-white bg-secondary-800/95 backdrop-blur-sm 
        rounded-lg shadow-lg
        opacity-0 invisible 
        group-hover:opacity-100 group-hover:visible 
        transition-all duration-200 ease-out
        whitespace-nowrap z-50
        pointer-events-none
        group-hover:translate-y-0
        ${position === 'top' ? '-translate-y-1 group-hover:translate-y-0' : ''}
        ${position === 'bottom' ? 'translate-y-1 group-hover:translate-y-0' : ''}
      `}>
        {content}
      </div>
    </div>
  );
};

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ orientation = 'horizontal', className = '' }) => {
  if (orientation === 'vertical') {
    return <div className={`w-px bg-border h-full ${className}`} />;
  }
  return <div className={`w-full h-px bg-border ${className}`} />;
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className = '' }) => (
  <div className={`text-center py-12 ${className}`}>
    {icon && (
      <div className="
        w-16 h-16 rounded-2xl 
        bg-secondary-100 
        flex items-center justify-center mx-auto mb-4 
        text-secondary-400
        transition-transform duration-200
        group-hover:scale-110
      ">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
    {description && <p className="text-sm text-text-secondary max-w-sm mx-auto mb-6">{description}</p>}
    {action && <div className="flex justify-center">{action}</div>}
  </div>
);

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ label, error, className = '', ...props }, ref) => (
  <label className="inline-flex items-center gap-3 cursor-pointer group">
    <div className="relative">
      <input
        ref={ref}
        type="checkbox"
        className={`
          peer w-5 h-5 rounded border-2 border-secondary-300
          appearance-none cursor-pointer
          transition-all duration-200 ease-out
          checked:bg-brand-500 checked:border-brand-500
          focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-danger-500' : ''}
          ${className}
        `}
        {...props}
      />
      <svg 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    {label && (
      <span className="text-sm text-text-primary group-hover:text-text-secondary transition-colors duration-200">
        {label}
      </span>
    )}
  </label>
));
Checkbox.displayName = 'Checkbox';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ label, error, options, className = '', ...props }, ref) => (
  <div className="w-full space-y-1.5">
    {label && (
      <label className="block text-sm font-medium text-text-primary transition-colors duration-200">
        {label}
      </label>
    )}
    <div className="relative">
      <select
        ref={ref}
        className={`
          w-full px-4 py-2.5 pr-10 bg-surface border rounded-xl 
          text-text-primary appearance-none cursor-pointer
          transition-all duration-200 ease-out
          focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:shadow-lg focus:shadow-brand-500/10
          hover:border-secondary-300
          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-secondary-50
          ${error 
            ? 'border-danger-500 focus:ring-danger-500/30 focus:border-danger-500' 
            : 'border-secondary-200'
          } 
          ${className}
        `}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg 
        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary pointer-events-none transition-transform duration-200"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
    {error && (
      <p className="text-xs text-danger-600 flex items-center gap-1.5 animate-fade-in">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </p>
    )}
  </div>
));
Select.displayName = 'Select';
