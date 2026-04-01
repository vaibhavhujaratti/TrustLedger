import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }: any) => {
  const baseStyle = "px-4 py-2 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50";
  const variants = {
    primary: "bg-trust-blue text-white hover:bg-blue-600 focus:ring-trust-blue",
    success: "bg-trust-green text-white hover:bg-green-600 focus:ring-trust-green",
    danger: "bg-trust-red text-white hover:bg-red-600 focus:ring-trust-red",
    outline: "border-2 border-trust-blue text-trust-blue hover:bg-blue-50 focus:ring-trust-blue",
    destructiveOutline: "border-2 border-trust-red text-trust-red hover:bg-red-50 focus:ring-trust-red",
  };
  return <button className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`} {...props}>{children}</button>;
};

export const Input = ({ label, error, ...props }: any) => (
  <div className="flex flex-col space-y-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <input className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-trust-blue bg-white" {...props} />
    {error && <span className="text-xs text-trust-red">{error}</span>}
  </div>
);

export const Card = ({ children, className = '' }: any) => (
  <div className={`bg-card text-card-foreground shadow-sm rounded-lg border border-border p-6 ${className}`}>
    {children}
  </div>
);

export const Badge = ({ children, status = 'PENDING' }: any) => {
  const maps: Record<string, string> = {
    PENDING: "bg-gray-100 text-gray-800",
    SUBMITTED: "bg-trust-amber text-white",
    UNDER_REVIEW: "bg-trust-amber text-white",
    APPROVED: "bg-trust-green text-white",
    FUNDS_RELEASED: "bg-trust-green text-white",
    DISPUTED: "bg-trust-red text-white",
    DRAFT: "bg-gray-100 text-gray-800",
    CONTRACT_REVIEW: "bg-trust-blue text-white",
  };
  return <span className={`px-2 py-1 text-xs font-bold rounded-full ${maps[status] || maps.PENDING}`}>{children}</span>;
}
