import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white border border-[#DCE5E9] rounded-2xl p-8 space-y-5 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-[#FCECEE] text-[#C73540] flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div>
          <h1 className="text-3xl font-black text-[#112B37]">404</h1>
          <h2 className="text-sm font-bold text-[#102E3C] uppercase tracking-wide mt-1">
            Dispatch Sector Out of Range
          </h2>
          <p className="text-xs text-[#617580] mt-1.5">
            The requested operations corridor or route endpoint does not exist.
          </p>
        </div>

        <Link to="/dashboard">
          <Button
            variant="primary"
            size="md"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="w-full font-semibold"
          >
            Return to Route Planner
          </Button>
        </Link>
      </div>
    </div>
  );
};
