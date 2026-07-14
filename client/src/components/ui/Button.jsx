import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-sky-700 hover:shadow-md',
    outline: 'border border-border-subtle bg-white hover:bg-slate-50 text-accent',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 hover:shadow-md',
  };

  const combinedClasses = `${baseClasses} ${variants[variant]} ${className} py-2 px-4`;

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
