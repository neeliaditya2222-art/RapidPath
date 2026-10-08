import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in UI component:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F2F5F6] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white border border-[#DCE5E9] rounded-2xl p-8 shadow-sm space-y-4">
            <div className="w-14 h-14 bg-[#FCECEE] rounded-full flex items-center justify-center mx-auto text-[#C73540]">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-[#112B37]">
              Interface Recovery Mode
            </h2>
            <p className="text-xs text-[#617580]">
              An unexpected render issue occurred. Routing calculation services remain online.
            </p>
            <Button
              variant="primary"
              onClick={this.handleReset}
              leftIcon={<RotateCcw className="w-4 h-4" />}
              className="w-full font-semibold"
            >
              Reset Route Planner
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
