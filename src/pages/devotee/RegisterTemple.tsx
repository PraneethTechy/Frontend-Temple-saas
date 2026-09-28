import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  User,
  MapPin,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useSubmitTempleRegistrationMutation } from '../../store/api/templeRegistrationApi.js';
import { useGetCategoriesQuery, type CategoryWithCount } from '../../store/api/categoryApi.js';
import { ROUTES } from '../../constants/routes.js';

interface TempleRegistrationFormData {
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
  latitude: string;
  longitude: string;
  mapUrl: string;
  timings: string;
  facilities: string;
  guidelines: string;
}

interface SubmittedRegistrationData {
  registrationId?: string;
  _id?: string;
  templeName?: string;
  applicantEmail?: string;
  status?: string;
}

interface ApiErrorResponse {
  data?: {
    message?: string;
  };
  message?: string;
}

export const RegisterTemple: React.FC = () => {
  const [formData, setFormData] = useState<TempleRegistrationFormData>({
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    authorityDesignation: '',
    templeName: '',
    templeType: 'Traditional Heritage',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    mapUrl: '',
    timings: '',
    facilities: 'Prasadam, Cloak Room, Wheelchair Access, Drinking Water',
    guidelines: 'Devotees are requested to wear traditional Indian attire and observe silent contemplation inside the sanctum.',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [submittedData, setSubmittedData] = useState<SubmittedRegistrationData | null>(null);

  const { data: categoriesRes } = useGetCategoriesQuery();
  const availableCategories: CategoryWithCount[] = categoriesRes?.data || [];

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [showSuggestCategory, setShowSuggestCategory] = useState(false);
  const [suggestedCategoryName, setSuggestedCategoryName] = useState('');
  const [suggestedCategoryDescription, setSuggestedCategoryDescription] = useState('');

  const [submitTempleRegistration, { isLoading }] = useSubmitTempleRegistrationMutation();

  const handleCategoryToggle = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const payload = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        categoryIds: selectedCategoryIds,
        suggestedCategoryName: showSuggestCategory && suggestedCategoryName.trim() ? suggestedCategoryName.trim() : null,
        suggestedCategoryDescription: showSuggestCategory && suggestedCategoryDescription.trim() ? suggestedCategoryDescription.trim() : null,
      };

      const response = await submitTempleRegistration(payload).unwrap();
      if (response?.success) {
        setSubmittedData((response.data as unknown as SubmittedRegistrationData) || null);
      }
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse;
      setErrorMessage(
        apiErr?.data?.message || apiErr?.message || 'Failed to submit temple registration. Please check your information.'
      );
    }
  };

  // Success view
  if (submittedData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-spiritual-border shadow-spiritual-md p-8 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h2 className="text-2xl font-serif font-bold text-spiritual-text mb-2">
            Temple Onboarding Application Submitted
          </h2>
          <p className="text-sm text-spiritual-muted mb-6 max-w-lg mx-auto leading-relaxed">
            Thank you for registering <strong className="text-spiritual-text">{submittedData.templeName}</strong> on DevaSetu.
            Your application has been received and registered under status{' '}
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              PENDING REVIEW
            </span>.
          </p>

          <div className="bg-spiritual-surface p-5 rounded-xl border border-spiritual-border text-left space-y-3 mb-8 text-xs text-spiritual-muted">
            <div className="flex justify-between items-center pb-2 border-b border-spiritual-border">
              <span className="font-medium text-spiritual-text">Application Reference:</span>
              <span className="font-mono text-spiritual-accent font-semibold">{submittedData.registrationId || submittedData._id}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-spiritual-border">
              <span className="font-medium text-spiritual-text">Applicant Email:</span>
              <span>{submittedData.applicantEmail}</span>
            </div>
            <div className="space-y-1.5 pt-1">
              <span className="font-medium text-spiritual-text block">What Happens Next:</span>
              <p>1. Our platform administrative team will verify the submitted temple details and credentials.</p>
              <p>2. Once approved, your designated Temple Authority account will be provisioned automatically.</p>
              <p>3. First-time login credentials will be securely dispatched to your registered email.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={ROUTES.HOME}
              className="px-6 py-2.5 rounded-lg bg-spiritual-primary text-white text-sm font-medium hover:bg-spiritual-primaryHover transition-all shadow-spiritual-sm"
            >
              Return to Homepage
            </Link>
            <button
              onClick={() => {
                setSubmittedData(null);
                setFormData({
                  applicantName: '',
                  applicantEmail: '',
                  applicantPhone: '',
                  authorityDesignation: '',
                  templeName: '',
                  templeType: 'Traditional Heritage',
                  description: '',
                  address: '',
                  city: '',
                  state: '',
                  pincode: '',
                  latitude: '',
                  longitude: '',
                  mapUrl: '',
                  timings: '',
                  facilities: 'Prasadam, Cloak Room, Wheelchair Access, Drinking Water',
                  guidelines: 'Devotees are requested to wear traditional Indian attire and observe silent contemplation inside the sanctum.',
                });
              }}
              className="px-6 py-2.5 rounded-lg bg-white border border-spiritual-border text-spiritual-text text-sm font-medium hover:bg-spiritual-surface transition-all"
            >
              Submit Another Temple
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-spiritual-accentLight text-spiritual-accent text-xs font-semibold mb-3 border border-spiritual-accent/20">
          <Building2 className="w-3.5 h-3.5" />
          <span>DevaSetu Temple Network Onboarding</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-spiritual-text mb-3">
          Register Your Temple
        </h1>
        <p className="text-sm text-spiritual-muted max-w-2xl mx-auto leading-relaxed">
          Submit your temple trust or administrative authority details for review. Following verification and approval,
          your designated temple authority will receive personalized access credentials to manage sacred services and darshans.
        </p>
      </div>

      {/* Architecture Guidance Alert */}
      <div className="mb-8 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-semibold block text-amber-950 mb-0.5">Application Process Notice</span>
          This form is an administrative onboarding submission, not a public user registration. Submitting does not
          promise immediate account creation; each sacred institution is verified to maintain authentic darshan management.
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Applicant / Authority Information */}
        <div className="bg-white rounded-2xl border border-spiritual-border p-6 sm:p-8 shadow-spiritual-xs">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-spiritual-border">
            <User className="w-5 h-5 text-spiritual-accent" />
            <h2 className="text-base font-serif font-bold text-spiritual-text">
              1. Applicant / Authorized Trustee Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-spiritual-text mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="applicantName"
                value={formData.applicantName}
                onChange={handleChange}
                required
                placeholder="e.g. Shri Raghavendra Rao"
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-spiritual-text mb-1.5">
                Designation / Role in Temple <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="authorityDesignation"
                value={formData.authorityDesignation}
                onChange={handleChange}
                required
                placeholder="e.g. Managing Trustee, Executive Officer, Head Priest"
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-spiritual-text mb-1.5">
                Official Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="applicantEmail"
                value={formData.applicantEmail}
                onChange={handleChange}
                required
                placeholder="trustee@templetrust.org"
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary transition-all"
              />
              <span className="text-[11px] text-spiritual-muted mt-1 block">
                Authority login credentials will be dispatched to this email address.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-spiritual-text mb-1.5">
                Contact Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="applicantPhone"
                value={formData.applicantPhone}
                onChange={handleChange}
                required
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Temple Information */}
        <div className="bg-white rounded-2xl border border-spiritual-border p-6 sm:p-8 shadow-spiritual-xs">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-spiritual-border">
            <Building2 className="w-5 h-5 text-spiritual-accent" />
            <h2 className="text-base font-serif font-bold text-spiritual-text">
              2. Temple Profile & Sacred Heritage
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-semibold text-spiritual-text mb-1.5">
                Temple Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="templeName"
                value={formData.templeName}
                onChange={handleChange}
                required
                placeholder="e.g. Sri Somnath Jyotirlinga Temple"
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-spiritual-text mb-1.5">
                Temple Classification / Tradition
              </label>
              <select
                name="templeType"
                value={formData.templeType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary transition-all"
              >
                <option value="Traditional Heritage">Traditional Heritage</option>
                <option value="Jyotirlinga">Jyotirlinga Shrine</option>
                <option value="Shakti Peeth">Shakti Peeth</option>
                <option value="Divya Desam">Divya Desam</option>
                <option value="Hilltop Sanctuary">Hilltop Sanctuary</option>
                <option value="Coastal Temple">Coastal Temple</option>
                <option value="Cave Temple">Cave Temple</option>
                <option value="Community Trust">Community Trust Temple</option>
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold text-spiritual-text mb-1.5">
              Temple Description & Sthala Purana <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe the temple deity, spiritual significance, architectural history, and daily darshan timings..."
              className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary transition-all leading-relaxed"
            />
          </div>

          {/* Temple Categories */}
          <div className="pt-3 border-t border-spiritual-borderLight">
            <label className="block text-xs font-semibold text-spiritual-text mb-1">
              Temple Categories / Deities (Optional)
            </label>
            <p className="text-[11px] text-spiritual-muted mb-3">
              Select all divine deities or categories applicable to your temple
            </p>

            {availableCategories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
                {availableCategories.map((cat) => {
                  const isChecked = selectedCategoryIds.includes(cat._id);
                  return (
                    <label
                      key={cat._id}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-amber-50/80 border-[#C98A22] text-[#8B5E34] font-semibold'
                          : 'bg-spiritual-surface/40 border-spiritual-border text-spiritual-text hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCategoryToggle(cat._id)}
                        className="w-3.5 h-3.5 text-spiritual-primary rounded border-gray-300 focus:ring-spiritual-primary"
                      />
                      <span className="truncate">{cat.name}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-spiritual-muted italic mb-3">
                No categories available yet. You can suggest a category below for administrative review.
              </p>
            )}

            {/* Other / Suggest a Category */}
            {!showSuggestCategory ? (
              <button
                type="button"
                onClick={() => setShowSuggestCategory(true)}
                className="text-xs font-semibold text-spiritual-primary hover:text-spiritual-primaryDark inline-flex items-center gap-1 cursor-pointer"
              >
                <span>+ Other / Suggest a Category</span>
              </button>
            ) : (
              <div className="bg-spiritual-surface/60 border border-spiritual-border rounded-xl p-3.5 space-y-2.5 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-spiritual-text">Suggest a Category</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSuggestCategory(false);
                      setSuggestedCategoryName('');
                      setSuggestedCategoryDescription('');
                    }}
                    className="text-[11px] text-spiritual-muted hover:text-spiritual-text"
                  >
                    Cancel
                  </button>
                </div>
                <div>
                  <input
                    type="text"
                    value={suggestedCategoryName}
                    onChange={(e) => setSuggestedCategoryName(e.target.value)}
                    placeholder="Enter suggested category name (e.g. Village Guardian Deity)"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-spiritual-border bg-white focus:outline-none focus:border-spiritual-primary"
                  />
                </div>
                <div>
                  <textarea
                    value={suggestedCategoryDescription}
                    onChange={(e) => setSuggestedCategoryDescription(e.target.value)}
                    placeholder="Optional explanation for the suggested category..."
                    rows={2}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-spiritual-border bg-white focus:outline-none focus:border-spiritual-primary"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Physical Address & Location */}
        <div className="bg-white rounded-2xl border border-spiritual-border p-6 sm:p-8 shadow-spiritual-xs">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-spiritual-border">
            <MapPin className="w-5 h-5 text-spiritual-accent" />
            <h2 className="text-base font-serif font-bold text-spiritual-text">
              3. Physical Address & Location
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-spiritual-text mb-1.5">
                Street Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="e.g. Prabhas Patan, Veraval Road"
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-spiritual-text mb-1.5">
                  City / Town <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="Somnath"
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-spiritual-text mb-1.5">
                  State <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  placeholder="Gujarat"
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-spiritual-text mb-1.5">
                  Pincode <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  placeholder="362268"
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
              <div>
                <label className="block text-xs font-semibold text-spiritual-text mb-1.5">
                  Latitude (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="20.8880"
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-spiritual-text mb-1.5">
                  Longitude (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="70.4012"
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-spiritual-text mb-1.5">
                  Google Maps URL (Optional)
                </label>
                <input
                  type="url"
                  name="mapUrl"
                  value={formData.mapUrl}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Timings, Facilities & Guidelines */}
        <div className="bg-white rounded-2xl border border-spiritual-border p-6 sm:p-8 shadow-spiritual-xs">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-spiritual-border">
            <Clock className="w-5 h-5 text-spiritual-accent" />
            <h2 className="text-base font-serif font-bold text-spiritual-text">
              4. Daily Timings, Facilities & Visitor Guidelines
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-spiritual-text mb-1.5">
                Darshan Timings Summary
              </label>
              <input
                type="text"
                name="timings"
                value={formData.timings}
                onChange={handleChange}
                placeholder="Morning: 06:00 AM - 12:30 PM | Evening: 04:30 PM - 09:30 PM"
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-spiritual-text mb-1.5">
                Available Facilities (comma separated)
              </label>
              <input
                type="text"
                name="facilities"
                value={formData.facilities}
                onChange={handleChange}
                placeholder="Prasadam Hall, Wheelchair Access, Footwear Stand, Guest House"
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-spiritual-text mb-1.5">
                Dress Code & Devotee Guidelines
              </label>
              <textarea
                name="guidelines"
                value={formData.guidelines}
                onChange={handleChange}
                rows={3}
                placeholder="Specific rules for devotees entering the temple premises..."
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Documents & Media (Placeholders ready for Cloudinary phase) */}
        <div className="bg-white rounded-2xl border border-spiritual-border p-6 sm:p-8 shadow-spiritual-xs">
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-spiritual-border">
            <FileText className="w-5 h-5 text-spiritual-accent" />
            <h2 className="text-base font-serif font-bold text-spiritual-text">
              5. Verification Documents & Media (Optional for Initial Submission)
            </h2>
          </div>

          <p className="text-xs text-spiritual-muted mb-4">
            Official trust certificates or land deeds may be submitted electronically or provided upon direct contact
            with our verification team. Direct cloud uploads will be activated in the dedicated media phase.
          </p>

          <div className="p-4 border-2 border-dashed border-spiritual-border rounded-xl text-center bg-spiritual-surface/30">
            <span className="text-xs font-medium text-spiritual-muted">
              Document & Photo verification is optional during this review phase.
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            to={ROUTES.HOME}
            className="px-6 py-3 rounded-lg border border-spiritual-border text-spiritual-text text-xs font-medium hover:bg-spiritual-surface transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-spiritual-primary text-white text-xs font-semibold hover:bg-spiritual-primaryHover disabled:opacity-50 transition-all shadow-spiritual-sm"
          >
            {isLoading ? (
              <span>Submitting Application...</span>
            ) : (
              <>
                <span>Submit Temple for Review</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterTemple;
