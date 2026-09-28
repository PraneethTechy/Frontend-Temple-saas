import React, { type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';

export const Unauthorized = (): ReactElement => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-spiritual-bg px-4 py-12">
      <div className="spiritual-card p-8 sm:p-10 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-spiritual-accentLight border border-spiritual-accent/20 flex items-center justify-center text-spiritual-accent mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h1 className="font-serif text-2xl font-bold text-spiritual-text mb-2">
          Access Restricted
        </h1>

        <p className="text-xs sm:text-sm text-spiritual-muted leading-relaxed mb-6">
          You do not have administrative clearance to access this portal or resource. Please ensure you are signed in with the correct role credentials.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={ROUTES.HOME}
            className="btn-spiritual-primary w-full sm:w-auto text-xs py-2.5 px-5 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
          <Link
            to={ROUTES.LOGIN}
            className="btn-spiritual-secondary w-full sm:w-auto text-xs py-2.5 px-5"
          >
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
