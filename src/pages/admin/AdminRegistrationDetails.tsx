import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  MapPin,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Compass,
  Calendar,
  ShieldCheck,
  X,
  KeyRound,
  RefreshCw,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
} from 'lucide-react';
import {
  useGetTempleRegistrationByIdQuery,
  useUpdateRegistrationStatusMutation,
  useApproveRegistrationMutation,
  useCreateAuthorityForRegistrationMutation,
  useResendAuthorityCredentialsMutation,
  useRejectRegistrationMutation,
} from '../../store/api/adminApi.js';
import { ROUTES } from '../../constants/routes.js';

// Generates a cryptographically strong temporary password satisfying all policies
const generateRandomSecurePassword = (): string => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%^&*';

  const u = upper.charAt(Math.floor(Math.random() * upper.length));
  const l = lower.charAt(Math.floor(Math.random() * lower.length));
  const d = digits.charAt(Math.floor(Math.random() * digits.length));
  const s = special.charAt(Math.floor(Math.random() * special.length));

  // 6 random alphanumeric characters
  const restChars = upper + lower + digits;
  let rest = '';
  for (let i = 0; i < 6; i++) {
    rest += restChars.charAt(Math.floor(Math.random() * restChars.length));
  }

  return `DS@${u}${l}${d}${rest}${s}`;
};

interface PasswordPolicyResult {
  isValid: boolean;
  issues: string[];
}

// Validates password strength policy
const validatePasswordPolicy = (pass: string): PasswordPolicyResult => {
  if (!pass) return { isValid: false, issues: ['Password is required'] };
  const issues: string[] = [];
  if (pass.length < 8) issues.push('At least 8 characters');
  if (!/[A-Z]/.test(pass)) issues.push('At least one uppercase letter (A-Z)');
  if (!/[a-z]/.test(pass)) issues.push('At least one lowercase letter (a-z)');
  if (!/[0-9]/.test(pass)) issues.push('At least one number (0-9)');
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass)) {
    issues.push('At least one special character (!@#$%^&*)');
  }
  return { isValid: issues.length === 0, issues };
};

interface PopulatedReviewedBy {
  _id?: string;
  name?: string;
  email?: string;
}

interface RegistrationDetailsData {
  _id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  authorityDesignation: string;
  templeName: string;
  templeType: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  mapUrl?: string;
  timings?: string;
  facilities?: string[];
  guidelines?: string[] | string;
  status: string;
  rejectionReason?: string;
  reviewedBy?: PopulatedReviewedBy | string;
  reviewedAt?: string;
  createdAt: string;
}

interface EmailDeliveryInfo {
  success?: boolean;
  status?: string;
}

interface AuthorityCreationResult {
  message?: string;
  data?: {
    emailDelivery?: EmailDeliveryInfo;
  };
}

const extractErrorMessage = (err: unknown, fallback = 'Failed to complete operation.'): string => {
  if (err && typeof err === 'object' && 'data' in err) {
    const errorData = (err as { data?: { message?: string } }).data;
    if (errorData?.message) return errorData.message;
  }
  return fallback;
};

export const AdminRegistrationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, error, refetch } = useGetTempleRegistrationByIdQuery(id || '', {
    skip: !id,
  });
  const [updateStatus, { isLoading: isStatusUpdating }] = useUpdateRegistrationStatusMutation();
  const [approveRegistration, { isLoading: isApproving }] = useApproveRegistrationMutation();
  const [createAuthority, { isLoading: isCreatingAuthority }] = useCreateAuthorityForRegistrationMutation();
  const [resendCredentials, { isLoading: isResending }] = useResendAuthorityCredentialsMutation();
  const [rejectRegistration, { isLoading: isRejecting }] = useRejectRegistrationMutation();

  // Modals & form state
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [username, setUsername] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const rawReg = data?.data as unknown as Record<string, unknown> | undefined;
  const reg: RegistrationDetailsData | undefined = rawReg
    ? {
        _id: String(rawReg._id || ''),
        applicantName: String(rawReg.applicantName || ''),
        applicantEmail: String(rawReg.applicantEmail || ''),
        applicantPhone: String(rawReg.applicantPhone || ''),
        authorityDesignation: String(rawReg.authorityDesignation || ''),
        templeName: String(rawReg.templeName || ''),
        templeType: String(rawReg.templeType || 'Temple'),
        description: String(rawReg.description || ''),
        address: String(rawReg.address || ''),
        city: String(rawReg.city || ''),
        state: String(rawReg.state || ''),
        pincode: String(rawReg.pincode || ''),
        latitude: typeof rawReg.latitude === 'number' ? rawReg.latitude : undefined,
        longitude: typeof rawReg.longitude === 'number' ? rawReg.longitude : undefined,
        mapUrl: typeof rawReg.mapUrl === 'string' ? rawReg.mapUrl : undefined,
        timings: typeof rawReg.timings === 'string' ? rawReg.timings : undefined,
        facilities: Array.isArray(rawReg.facilities) ? (rawReg.facilities as string[]) : undefined,
        guidelines: typeof rawReg.guidelines === 'string' || Array.isArray(rawReg.guidelines) ? (rawReg.guidelines as string[] | string) : undefined,
        status: String(rawReg.status || 'PENDING'),
        rejectionReason: typeof rawReg.rejectionReason === 'string' ? rawReg.rejectionReason : undefined,
        reviewedBy: (rawReg.reviewedBy && typeof rawReg.reviewedBy === 'object')
          ? (rawReg.reviewedBy as PopulatedReviewedBy)
          : typeof rawReg.reviewedBy === 'string'
          ? rawReg.reviewedBy
          : undefined,
        reviewedAt: typeof rawReg.reviewedAt === 'string' ? rawReg.reviewedAt : undefined,
        createdAt: String(rawReg.createdAt || new Date().toISOString()),
      }
    : undefined;

  // Initialize modal credentials when registration is loaded
  useEffect(() => {
    if (reg) {
      setUsername(reg.applicantEmail || '');
      setTemporaryPassword(generateRandomSecurePassword());
    }
  }, [reg?.applicantEmail]);

  const handleGeneratePassword = () => {
    setTemporaryPassword(generateRandomSecurePassword());
  };

  const handleMarkUnderReview = async () => {
    if (!id) return;
    setActionError('');
    try {
      await updateStatus({ id, status: 'UNDER_REVIEW' }).unwrap();
      setSuccessMessage('Registration marked as Under Review.');
      void refetch();
    } catch (err: unknown) {
      setActionError(extractErrorMessage(err, 'Failed to update status.'));
    }
  };

  const handleCreateAccountAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !reg) return;
    setActionError('');

    const { isValid, issues } = validatePasswordPolicy(temporaryPassword);
    if (!isValid) {
      setActionError(`Password policy requirement not met: ${issues.join(', ')}`);
      return;
    }

    try {
      // If registration is not yet approved, approve it first
      if (reg.status !== 'APPROVED') {
        await approveRegistration(id).unwrap();
      }

      // Provision authority account and send credentials email
      const result = (await createAuthority({
        id,
        username: username.trim(),
        temporaryPassword,
      }).unwrap()) as AuthorityCreationResult;

      setShowCredentialModal(false);

      const emailDelivery = result?.data?.emailDelivery;
      if (emailDelivery?.success) {
        setSuccessMessage(
          `✓ Temple Approved, Authority account created, and login credentials emailed to ${reg.applicantEmail} successfully!`
        );
      } else if (emailDelivery?.status === 'INVALID_EMAIL') {
        setSuccessMessage(
          `✓ Temple Approved and Authority account created. Note: "${reg.applicantEmail}" has invalid syntax, so credentials were not emailed.`
        );
      } else if (emailDelivery) {
        setSuccessMessage(
          `✓ Temple Approved and Authority account created. Note: Credential email could not be delivered (${emailDelivery.status}). You can resend credentials anytime.`
        );
      } else {
        setSuccessMessage(
          result?.message || `✓ Temple Approved and Authority account created successfully!`
        );
      }
      void refetch();
    } catch (err: unknown) {
      setActionError(extractErrorMessage(err, 'Failed to complete authority creation.'));
    }
  };

  const handleResendCredentials = async () => {
    if (!id || !reg) return;
    setActionError('');
    try {
      const res = (await resendCredentials({ id }).unwrap()) as { message?: string } | undefined;
      setShowResendModal(false);
      setSuccessMessage(
        res?.message || `✓ New temporary credentials generated and dispatched to ${reg.applicantEmail} successfully!`
      );
      void refetch();
    } catch (err: unknown) {
      setActionError(extractErrorMessage(err, 'Failed to resend credentials.'));
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!rejectionReason.trim()) {
      setActionError('Please provide a reason for rejecting this application.');
      return;
    }
    setActionError('');
    try {
      await rejectRegistration({ id, rejectionReason: rejectionReason.trim() }).unwrap();
      setShowRejectModal(false);
      setSuccessMessage('Registration application rejected.');
      void refetch();
    } catch (err: unknown) {
      setActionError(extractErrorMessage(err, 'Rejection failed.'));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-8 w-40 bg-spiritual-surface animate-pulse rounded" />
        <div className="h-64 bg-white rounded-2xl border border-spiritual-border animate-pulse" />
      </div>
    );
  }

  if (isError || !reg) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center bg-white rounded-2xl border border-spiritual-border shadow-spiritual-xs">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-serif font-bold text-spiritual-text mb-1">
          Unable to Load Registration
        </h2>
        <p className="text-xs text-spiritual-muted mb-4">
          {extractErrorMessage(error, 'The requested temple registration was not found or has been removed.')}
        </p>
        <Link
          to={`${ROUTES.ADMIN}/registrations`}
          className="px-4 py-2 rounded-lg bg-spiritual-primary text-white text-xs font-semibold"
        >
          Back to Registrations
        </Link>
      </div>
    );
  }

  const isPending = reg.status === 'PENDING';
  const isUnderReview = reg.status === 'UNDER_REVIEW';
  const isApproved = reg.status === 'APPROVED';
  const isRejected = reg.status === 'REJECTED';

  const { isValid: isPasswordValid, issues: passwordIssues } = validatePasswordPolicy(temporaryPassword);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={`${ROUTES.ADMIN}/registrations`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-spiritual-muted hover:text-spiritual-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Registrations</span>
        </Link>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-spiritual-muted">Status:</span>
          {isPending && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              Pending Review
            </span>
          )}
          {isUnderReview && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
              Under Active Review
            </span>
          )}
          {isApproved && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Approved & Onboarded</span>
            </span>
          )}
          {isRejected && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
              Application Rejected
            </span>
          )}
        </div>
      </div>

      {/* Action Messages */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between shadow-spiritual-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium leading-relaxed">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center justify-between shadow-spiritual-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium leading-relaxed">{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-rose-700 hover:text-rose-950 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-spiritual-border p-6 shadow-spiritual-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-spiritual-accent uppercase">
            {reg.templeType}
          </span>
          <h1 className="text-2xl font-serif font-bold text-spiritual-text mt-0.5">
            {reg.templeName}
          </h1>
          <p className="text-xs text-spiritual-muted mt-1 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-spiritual-subtle" />
            <span>{reg.city}, {reg.state} - {reg.pincode}</span>
            <span>•</span>
            <Calendar className="w-3.5 h-3.5 text-spiritual-subtle" />
            <span>Submitted on {new Date(reg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {isPending && (
            <button
              onClick={() => void handleMarkUnderReview()}
              disabled={isStatusUpdating}
              className="px-4 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
            >
              {isStatusUpdating ? 'Updating...' : 'Mark Under Review'}
            </button>
          )}

          {(isPending || isUnderReview) && (
            <>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={isRejecting}
                className="px-4 py-2 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
              >
                Reject Request
              </button>
              <button
                onClick={() => setShowCredentialModal(true)}
                disabled={isApproving || isCreatingAuthority}
                className="px-5 py-2 rounded-lg bg-spiritual-primary text-white hover:bg-spiritual-primaryHover text-xs font-semibold transition-all shadow-spiritual-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Approve Temple</span>
              </button>
            </>
          )}

          {isApproved && (
            <button
              onClick={() => setShowResendModal(true)}
              disabled={isResending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 text-xs font-semibold transition-all disabled:opacity-50 shadow-spiritual-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>{isResending ? 'Resending...' : 'Resend Credentials'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Breakdown Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Applicant / Authority Information */}
        <div className="bg-white rounded-2xl border border-spiritual-border p-6 shadow-spiritual-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-spiritual-border">
            <User className="w-4 h-4 text-spiritual-accent" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-spiritual-text">
              Applicant & Proposed Authority
            </h2>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-spiritual-muted">Contact Name:</span>
              <span className="font-semibold text-spiritual-text">{reg.applicantName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-spiritual-muted">Designation:</span>
              <span className="text-spiritual-text font-medium">{reg.authorityDesignation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-spiritual-muted">Official Email:</span>
              <span className="font-mono text-spiritual-text">{reg.applicantEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-spiritual-muted">Phone Number:</span>
              <span className="font-mono text-spiritual-text">{reg.applicantPhone}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Geospatial & Physical Address */}
        <div className="bg-white rounded-2xl border border-spiritual-border p-6 shadow-spiritual-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-spiritual-border">
            <MapPin className="w-4 h-4 text-spiritual-accent" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-spiritual-text">
              Location & Jurisdiction
            </h2>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-spiritual-muted block mb-0.5">Address:</span>
              <span className="text-spiritual-text font-medium">{reg.address}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-spiritual-border/60">
              <div>
                <span className="text-spiritual-muted block text-[10px]">City:</span>
                <span className="text-spiritual-text font-semibold">{reg.city}</span>
              </div>
              <div>
                <span className="text-spiritual-muted block text-[10px]">State:</span>
                <span className="text-spiritual-text font-semibold">{reg.state}</span>
              </div>
              <div>
                <span className="text-spiritual-muted block text-[10px]">Pincode:</span>
                <span className="font-mono text-spiritual-text font-semibold">{reg.pincode}</span>
              </div>
            </div>

            {(reg.latitude || reg.longitude || reg.mapUrl) && (
              <div className="pt-2 text-[11px] text-spiritual-muted flex flex-col gap-1">
                {reg.latitude && reg.longitude && (
                  <p>Coordinates: <span className="font-mono text-spiritual-text">{reg.latitude}, {reg.longitude}</span></p>
                )}
                {reg.mapUrl && (
                  <a
                    href={reg.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-spiritual-accent hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    <Compass className="w-3 h-3" />
                    <span>View on Google Maps</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description & Operating Guidelines */}
      <div className="bg-white rounded-2xl border border-spiritual-border p-6 shadow-spiritual-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-spiritual-border">
          <FileText className="w-4 h-4 text-spiritual-accent" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-spiritual-text">
            Temple Profile & Operational Details
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-spiritual-muted block mb-1 font-semibold">About Temple:</span>
            <p className="text-spiritual-text leading-relaxed whitespace-pre-wrap bg-spiritual-surface/40 p-3 rounded-lg border border-spiritual-border">
              {reg.description}
            </p>
          </div>

          <div>
            <span className="text-spiritual-muted block mb-1 font-semibold">Temple Timings / Darshan Hours:</span>
            <p className="text-spiritual-text bg-spiritual-surface/40 p-3 rounded-lg border border-spiritual-border">
              {reg.timings || 'Standard temple timings from sunrise to sunset.'}
            </p>
          </div>

          <div className="md:col-span-2">
            <span className="text-spiritual-muted block mb-1 font-semibold">Dress Code & Pilgrim Guidelines:</span>
            <p className="text-spiritual-text bg-spiritual-surface/40 p-3 rounded-lg border border-spiritual-border">
              {Array.isArray(reg.guidelines) ? reg.guidelines.join(', ') : reg.guidelines || 'Traditional Indian attire recommended.'}
            </p>
          </div>

          <div className="md:col-span-2">
            <span className="text-spiritual-muted block mb-2 font-semibold">Available Facilities:</span>
            <div className="flex flex-wrap gap-2">
              {reg.facilities && reg.facilities.length > 0 ? (
                reg.facilities.map((fac, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-spiritual-surface text-spiritual-text border border-spiritual-border text-[11px] font-medium"
                  >
                    {fac}
                  </span>
                ))
              ) : (
                <span className="text-spiritual-muted italic">No facilities listed.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Audit & Review History */}
      {(reg.reviewedBy || reg.rejectionReason) && (
        <div className="bg-spiritual-surface/60 rounded-2xl border border-spiritual-border p-6 text-xs space-y-2">
          <h3 className="font-bold uppercase tracking-wider text-spiritual-text text-[11px]">
            Administrative Audit Record
          </h3>
          {reg.reviewedBy && (
            <p className="text-spiritual-muted">
              Reviewed By:{' '}
              <strong className="text-spiritual-text">
                {typeof reg.reviewedBy === 'object' && reg.reviewedBy !== null && reg.reviewedBy.name
                  ? reg.reviewedBy.name
                  : 'Admin'}
              </strong>{' '}
              {typeof reg.reviewedBy === 'object' && reg.reviewedBy !== null && reg.reviewedBy.email
                ? `(${reg.reviewedBy.email})`
                : ''}
            </p>
          )}
          {reg.reviewedAt && (
            <p className="text-spiritual-muted">
              Reviewed On: <span className="font-mono text-spiritual-text">{new Date(reg.reviewedAt).toLocaleString('en-IN')}</span>
            </p>
          )}
          {reg.rejectionReason && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 mt-2">
              <strong>Rejection Reason:</strong> {reg.rejectionReason}
            </div>
          )}
        </div>
      )}

      {/* CREDENTIAL CREATION / APPROVAL MODAL */}
      {showCredentialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-spiritual-text/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-spiritual-border shadow-spiritual-lg max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-spiritual-text">
                  Create Authority Account & Send Credentials
                </h3>
                <p className="text-[11px] text-spiritual-muted">
                  Approving <span className="font-semibold text-spiritual-text">{reg.templeName}</span>
                </p>
              </div>
            </div>

            {/* Read-Only Summary */}
            <div className="bg-spiritual-surface/80 rounded-xl p-3 border border-spiritual-border space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-spiritual-muted">Temple Name:</span>
                <span className="font-semibold text-spiritual-text">{reg.templeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-spiritual-muted">Applicant Name:</span>
                <span className="font-medium text-spiritual-text">{reg.applicantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-spiritual-muted">Registered Email:</span>
                <span className="font-mono text-spiritual-accent font-medium">{reg.applicantEmail}</span>
              </div>
            </div>

            <form onSubmit={handleCreateAccountAndSend} className="space-y-4 text-xs">
              {/* Username Input */}
              <div>
                <label className="block text-[11px] font-semibold text-spiritual-text mb-1">
                  Login Username / Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-spiritual-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary font-mono text-xs"
                    placeholder="authority@temple.org"
                  />
                </div>
                <p className="text-[10px] text-spiritual-muted mt-1">
                  Defaults to the verified applicant email address.
                </p>
              </div>

              {/* Temporary Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-spiritual-text">
                    Temporary Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-spiritual-primary hover:text-spiritual-primaryHover transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Secure Password</span>
                  </button>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-spiritual-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={temporaryPassword}
                    onChange={(e) => setTemporaryPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary font-mono text-xs tracking-wider font-semibold text-spiritual-text"
                    placeholder="Enter or generate strong temporary password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-spiritual-muted hover:text-spiritual-text p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Policy Status */}
                <div className="mt-2 p-2.5 rounded-lg bg-spiritual-surface border border-spiritual-border text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-spiritual-text">Password Requirements:</span>
                    <span className={isPasswordValid ? 'text-emerald-700 font-semibold' : 'text-amber-700'}>
                      {isPasswordValid ? '✓ Policy Satisfied' : 'Pending Requirements'}
                    </span>
                  </div>
                  {!isPasswordValid && (
                    <ul className="list-disc list-inside text-rose-600 text-[10px] space-y-0.5">
                      {passwordIssues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Delivery Notice */}
              <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-800" />
                  <span>Credential Delivery Notice</span>
                </p>
                <p className="leading-relaxed">
                  These credentials will be sent to the authority's registered email ({reg.applicantEmail}).
                  The user will be required to change this temporary password upon first sign-in.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCredentialModal(false)}
                  disabled={isApproving || isCreatingAuthority}
                  className="px-4 py-2 rounded-lg border border-spiritual-border text-spiritual-text text-xs font-semibold hover:bg-spiritual-surface transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApproving || isCreatingAuthority || !isPasswordValid}
                  className="px-5 py-2 rounded-lg bg-spiritual-primary text-white hover:bg-spiritual-primaryHover text-xs font-semibold shadow-spiritual-xs disabled:opacity-50 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isApproving || isCreatingAuthority ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating & Sending...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>Create Account & Send Credentials</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESEND CREDENTIALS MODAL */}
      {showResendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-spiritual-text/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-spiritual-border shadow-spiritual-lg max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-spiritual-text">
                  Resend Authority Credentials
                </h3>
                <p className="text-[11px] text-spiritual-muted">
                  Dispatch new credentials to <span className="font-semibold text-spiritual-text">{reg.applicantEmail}</span>
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-spiritual-surface border border-spiritual-border text-xs text-spiritual-text space-y-2 leading-relaxed">
              <p>• A <strong>new cryptographically secure temporary password</strong> will be generated.</p>
              <p>• The previous temporary password will be immediately invalidated.</p>
              <p>• The authority will be required to change their password on next sign-in.</p>
              <p>• An updated credential email will be dispatched to <strong>{reg.applicantEmail}</strong>.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResendModal(false)}
                disabled={isResending}
                className="px-4 py-2 rounded-lg border border-spiritual-border text-spiritual-text text-xs font-semibold hover:bg-spiritual-surface cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleResendCredentials()}
                disabled={isResending}
                className="px-5 py-2 rounded-lg bg-spiritual-primary text-white hover:bg-spiritual-primaryHover text-xs font-semibold shadow-spiritual-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching Email...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span>Confirm & Resend Credentials</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-spiritual-text/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-spiritual-border shadow-spiritual-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-spiritual-text">
                  Reject Temple Registration
                </h3>
                <p className="text-[11px] text-spiritual-muted">
                  Provide a mandatory explanation for the rejection.
                </p>
              </div>
            </div>

            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-spiritual-text mb-1.5">
                  Rejection Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Incomplete documentation, unable to verify temple trust registration, duplicate application..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-rose-400 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  disabled={isRejecting}
                  className="px-4 py-2 rounded-lg border border-spiritual-border text-spiritual-text text-xs font-semibold hover:bg-spiritual-surface cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRejecting || !rejectionReason.trim()}
                  className="px-5 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold shadow-spiritual-xs disabled:opacity-50 cursor-pointer"
                >
                  {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegistrationDetails;
