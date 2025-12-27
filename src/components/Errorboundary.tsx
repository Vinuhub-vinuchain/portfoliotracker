import React from 'react';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error('Error in child component:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <p className="text-red-500 text-center mt-4">Something went wrong in PortfolioTable.</p>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
