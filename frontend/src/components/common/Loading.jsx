import React from 'react';

export const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const colorClasses = {
    primary: 'text-primary-600',
    white: 'text-white',
    gray: 'text-gray-400',
  };

  return (
    <div className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent ${sizeClasses[size]} ${colorClasses[color]}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const Loading = ({ message = 'Loading...', centered = false }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${centered ? 'min-h-[200px]' : 'py-8'}`}>
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
};

export const PageLoading = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xl" color="primary" />
        <p className="mt-4 text-lg font-medium text-gray-900">Loading...</p>
        <p className="mt-2 text-sm text-gray-600">Please wait while we prepare your workspace</p>
      </div>
    </div>
  );
};

export const ButtonLoading = ({ children, loading, disabled, ...props }) => {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        loading || disabled ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'
      } ${props.className || ''}`}
    >
      {loading && <LoadingSpinner size="sm" color="white" className="mr-2" />}
      {children}
    </button>
  );
};

export default LoadingSpinner;