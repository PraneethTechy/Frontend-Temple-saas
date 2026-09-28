import React, { useState, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Phone, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks.js';
import { useRegisterMutation } from '../../store/api/authApi.js';
import { setCredentials } from '../../store/slices/authSlice.js';
import { ROUTES } from '../../constants/routes.js';
import type { AuthenticatedUser } from '@shared/types/index.js';

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export const Register = (): ReactElement => {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [registerUser, { isLoading }] = useRegisterMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name || !formData.email || !formData.password) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await registerUser(formData).unwrap();
      const user = (response.data?.user || (response as unknown as { user: AuthenticatedUser }).user) as AuthenticatedUser;

      dispatch(setCredentials({ user }));
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      setErrorMessage(errorObj?.data?.message || errorObj?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="spiritual-card p-6 sm:p-8 max-w-md w-full bg-white shadow-spiritual-md border border-spiritual-border">
        
        {/* Header */}
        <div className="w-12 h-12 rounded-xl bg-spiritual-primaryLight/70 border border-spiritual-border flex items-center justify-center text-spiritual-primary mx-auto mb-3 shadow-spiritual-sm">
          <UserPlus className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-serif font-bold text-center text-spiritual-text mb-1">
          Devotee Registration
        </h1>
        <p className="text-xs text-spiritual-muted text-center mb-6">
          Create an account to book darshans, track sevas, and plan pilgrimages.
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-spiritual-accentLight border border-spiritual-accent/20 flex items-start gap-2.5 text-xs text-spiritual-accent">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form (Strictly No Role Selector) */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-spiritual-text mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-spiritual-subtle" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ramesh Kumar"
                className="spiritual-input pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-spiritual-text mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-spiritual-subtle" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="ramesh@example.com"
                className="spiritual-input pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-spiritual-text mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-spiritual-subtle" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="spiritual-input pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-spiritual-text mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-spiritual-subtle" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="spiritual-input pl-9 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-spiritual-primary w-full text-xs py-2.5 flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Register as Devotee</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-6 pt-4 border-t border-spiritual-border text-center text-xs text-spiritual-muted">
          Already have an account?{' '}
          <Link
            to={ROUTES.LOGIN}
            className="text-spiritual-primary font-semibold hover:underline inline-flex items-center gap-1"
          >
            Sign In <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
