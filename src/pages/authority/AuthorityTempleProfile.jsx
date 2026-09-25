import React, { useState, useEffect } from 'react';
import {
  Building,
  Save,
  CheckCircle,
  AlertCircle,
  Shield,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import {
  useGetAuthorityTempleQuery,
  useUpdateAuthorityTempleMutation,
} from '../../store/api/authorityApi.js';
import {
  useGetCategoriesQuery,
  useSubmitCategorySuggestionMutation,
} from '../../store/api/categoryApi.js';
import GoogleMapLocationPicker from '../../components/authority/GoogleMapLocationPicker.jsx';

export const AuthorityTempleProfile = () => {
  const { data: templeRes, isLoading, isError, error, refetch } = useGetAuthorityTempleQuery();
  const [updateTemple, { isLoading: isUpdating }] = useUpdateAuthorityTempleMutation();
  const { data: categoriesRes } = useGetCategoriesQuery();
  const availableCategories = categoriesRes?.data || [];
  const [submitSuggestion, { isLoading: isSubmittingSuggestion }] = useSubmitCategorySuggestionMutation();

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [suggestModalOpen, setSuggestModalOpen] = useState(false);
  const [suggestForm, setSuggestForm] = useState({ name: '', description: '' });
  const [suggestionFeedback, setSuggestionFeedback] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templeType: 'Heritage',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    mapUrl: '',
    phone: '',
    email: '',
    website: '',
    dressCode: '',
    parking: '',
    specialNotes: '',
    guidelines: '',
    facilities: '',
  });

  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const temple = templeRes?.data;

  useEffect(() => {
    if (temple) {
      setFormData({
        name: temple.name || '',
        description: temple.description || '',
        templeType: temple.templeType || 'Heritage',
        address: temple.address || '',
        city: temple.city || '',
        state: temple.state || '',
        pincode: temple.pincode || '',
        latitude: temple.latitude !== null && temple.latitude !== undefined ? String(temple.latitude) : '',
        longitude: temple.longitude !== null && temple.longitude !== undefined ? String(temple.longitude) : '',
        mapUrl: temple.mapUrl || '',
        phone: temple.phone || '',
        email: temple.email || '',
        website: temple.website || '',
        dressCode: temple.dressCode || '',
        parking: temple.parking || '',
        specialNotes: temple.timings?.specialNotes || '',
        guidelines: Array.isArray(temple.guidelines) ? temple.guidelines.join('\n') : '',
        facilities: Array.isArray(temple.facilities) ? temple.facilities.join(', ') : '',
      });

      const existingCatIds = (temple.categories || []).map((c) =>
        typeof c === 'object' && c !== null ? c._id : c
      );
      setSelectedCategories(existingCatIds);
    }
  }, [temple]);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSuggestionSubmit = async (e) => {
    e.preventDefault();
    setSuggestionFeedback({ type: '', message: '' });

    if (!suggestForm.name.trim()) {
      setSuggestionFeedback({ type: 'error', message: 'Category name is required' });
      return;
    }

    try {
      await submitSuggestion({
        suggestedName: suggestForm.name.trim(),
        description: suggestForm.description.trim(),
      }).unwrap();

      setSuggestionFeedback({
        type: 'success',
        message: 'Category suggestion submitted successfully for administrator review!',
      });
      setSuggestForm({ name: '', description: '' });
      setTimeout(() => {
        setSuggestModalOpen(false);
        setSuggestionFeedback({ type: '', message: '' });
      }, 2500);
    } catch (err) {
      setSuggestionFeedback({
        type: 'error',
        message: err?.data?.message || 'Failed to submit category suggestion',
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (loc) => {
    setFormData((prev) => ({
      ...prev,
      latitude: loc.latitude !== undefined ? String(loc.latitude) : prev.latitude,
      longitude: loc.longitude !== undefined ? String(loc.longitude) : prev.longitude,
      address: loc.address !== undefined ? loc.address : prev.address,
      city: loc.city !== undefined ? loc.city : prev.city,
      state: loc.state !== undefined ? loc.state : prev.state,
      pincode: loc.pincode !== undefined ? loc.pincode : prev.pincode,
      mapUrl: loc.mapUrl !== undefined ? loc.mapUrl : prev.mapUrl,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!formData.name.trim()) {
      setFeedback({ type: 'error', message: 'Temple name is required.' });
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        templeType: formData.templeType.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
        mapUrl: formData.mapUrl.trim() || null,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        website: formData.website.trim(),
        dressCode: formData.dressCode.trim(),
        parking: formData.parking.trim(),
        specialNotes: formData.specialNotes.trim(),
        guidelines: formData.guidelines ? formData.guidelines.split('\n').map((s) => s.trim()).filter(Boolean) : [],
        facilities: formData.facilities ? formData.facilities.split(',').map((s) => s.trim()).filter(Boolean) : [],
        categories: selectedCategories,
      };

      await updateTemple(payload).unwrap();
      setFeedback({ type: 'success', message: 'Temple profile updated successfully!' });
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.data?.message || 'Failed to update temple profile. Please check validation rules.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spiritual-primary"></div>
      </div>
    );
  }

  if (isError || !temple) {
    return (
      <div className="spiritual-card p-6 border-red-200 bg-red-50 text-red-800 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-sm">Temple information not available.</h3>
          <p className="text-xs mt-1 text-red-600">
            {error?.data?.message || 'No temple record is associated with this authority account.'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-3 px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl pb-24">
      {/* Temple Overview Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-white via-[#FCFAF7] to-[#FAF4EC] border border-[#E8E2D9] p-5 sm:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center p-3 shrink-0 shadow-2xs">
            <Building className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Status: {temple?.status || 'ACTIVE'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF5EE] border border-[#EAE0D0] text-spiritual-muted text-[11px] font-mono">
                /{temple?.slug || 'slug'}
              </span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-spiritual-text truncate tracking-tight">
              {temple?.name || 'Temple Profile'}
            </h1>
            <p className="text-xs text-spiritual-muted mt-0.5 truncate">
              {temple?.city && temple?.state ? `${temple.city}, ${temple.state} • ` : ''}Public directory listing and devotee guidelines
            </p>
          </div>
        </div>

        {temple?.slug && (
          <a
            href={`/temples/${temple.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start md:self-center inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E8E2D9] text-spiritual-text rounded-xl text-xs font-semibold hover:bg-[#FAF6F0] transition-colors shadow-2xs shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-spiritual-primary" />
            <span>Public Page</span>
          </a>
        )}
      </div>

      {feedback.message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between shadow-2xs animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback({ type: '', message: '' })}
            className="text-spiritual-muted hover:text-spiritual-text cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Form with Clean Modular Sections */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: CORE IDENTITY */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="border-b border-[#F4EFE6] pb-3 flex items-center justify-between">
            <h2 className="text-sm font-serif font-bold text-spiritual-text flex items-center gap-2">
              <Building className="w-4 h-4 text-spiritual-primary" />
              <span>General Information</span>
            </h2>
            <span className="text-[11px] font-mono text-spiritual-muted">Section 1 of 5</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                Temple Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                Temple Type / Classification
              </label>
              <input
                type="text"
                name="templeType"
                value={formData.templeType}
                onChange={handleChange}
                placeholder="e.g. Heritage, Jyotirlinga, Shakti Peeth, Divya Desam"
                className="w-full px-3.5 py-2.5 rounded-xl border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-800 mb-1.5">
                Temple History & Sanctum Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                placeholder="Describe the presiding deity, sacred sthala purana, architectural heritage, and annual festivals..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: TEMPLE CATEGORIES */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="border-b border-[#F4EFE6] pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-serif font-bold text-spiritual-text flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-spiritual-primary" />
                <span>Temple Categories & Deities</span>
              </h2>
              <p className="text-[11px] text-spiritual-muted mt-0.5">
                Select all spiritual traditions and deity classifications associated with this temple
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSuggestModalOpen(true)}
              className="text-xs text-spiritual-primary hover:text-spiritual-accent font-bold flex items-center gap-1 cursor-pointer bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60"
            >
              <span>+ Suggest a Category</span>
            </button>
          </div>

          {availableCategories.length === 0 ? (
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
              <p className="font-medium">
                No categories are configured yet. You can suggest a custom category for administrator review.
              </p>
              <button
                type="button"
                onClick={() => setSuggestModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-spiritual-primary text-white rounded-lg text-xs font-semibold hover:bg-spiritual-accent transition-all cursor-pointer"
              >
                Suggest a Category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs">
              {availableCategories.map((cat) => {
                const isChecked = selectedCategories.includes(cat._id);
                return (
                  <label
                    key={cat._id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all select-none ${
                      isChecked
                        ? 'bg-[#FFF9EE] border-amber-400 text-amber-900 font-bold shadow-2xs'
                        : 'bg-white border-[#E8E2D9] text-spiritual-text hover:border-amber-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCategoryToggle(cat._id)}
                      className="w-4 h-4 text-spiritual-primary rounded border-gray-300 focus:ring-spiritual-primary"
                    />
                    <span className="truncate">{cat.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 3: PHYSICAL ADDRESS & GEOLOCATION */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="border-b border-[#F4EFE6] pb-3">
            <h2 className="text-sm font-serif font-bold text-spiritual-text flex items-center gap-2">
              <MapPin className="w-4 h-4 text-spiritual-primary" />
              <span>Physical Address & Geospatial Coordinates</span>
            </h2>
            <p className="text-[11px] text-spiritual-muted mt-0.5">
              Pinpoint your temple on the map so devotees can navigate directly via GPS
            </p>
          </div>

          {/* Interactive Google Map & Autocomplete Location Picker */}
          <GoogleMapLocationPicker
            latitude={formData.latitude}
            longitude={formData.longitude}
            mapUrl={formData.mapUrl}
            onLocationSelect={handleLocationSelect}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
            <div className="sm:col-span-3">
              <label className="block font-semibold text-slate-800 mb-1.5">
                Street Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                City / Town <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                State <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                Postal Code (PIN) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">Latitude</label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g. 12.2253"
                className="w-full px-3.5 py-2.5 rounded-xl border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">Longitude</label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g. 79.0747"
                className="w-full px-3.5 py-2.5 rounded-xl border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">Google Maps URL</label>
              <input
                type="url"
                name="mapUrl"
                value={formData.mapUrl}
                onChange={handleChange}
                placeholder="https://maps.google.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: CONTACT & ADMINISTRATION */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="border-b border-[#F4EFE6] pb-3">
            <h2 className="text-sm font-serif font-bold text-spiritual-text flex items-center gap-2">
              <Phone className="w-4 h-4 text-spiritual-primary" />
              <span>Temple Administration & Official Contacts</span>
            </h2>
            <p className="text-[11px] text-spiritual-muted mt-0.5">
              Contact channels displayed to devotees for darshan queries and special seva inquiries
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-spiritual-muted" />
                <span>Office Phone / Helpline</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 4175 252438"
                className="w-full px-3.5 py-2.5 rounded-xl border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-spiritual-muted" />
                <span>Official Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@templetrust.org"
                className="w-full px-3.5 py-2.5 rounded-xl border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-spiritual-muted" />
                <span>Official Website</span>
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://arunachaleswarartemple.tnhrce.in"
                className="w-full px-3.5 py-2.5 rounded-xl border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: VISITOR GUIDELINES & FACILITIES */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="border-b border-[#F4EFE6] pb-3">
            <h2 className="text-sm font-serif font-bold text-spiritual-text flex items-center gap-2">
              <Clock className="w-4 h-4 text-spiritual-primary" />
              <span>Visitor Guidelines, Dress Code & Facilities</span>
            </h2>
            <p className="text-[11px] text-spiritual-muted mt-0.5">
              Ensure devotees are well-prepared for sanctum decorum and pilgrimage facilities
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">Dress Code Decorum</label>
              <input
                type="text"
                name="dressCode"
                value={formData.dressCode}
                onChange={handleChange}
                placeholder="Traditional Indian attire mandatory (Dhoti/Kurta for men, Saree/Churidar for women)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">Parking Guidelines</label>
              <input
                type="text"
                name="parking"
                value={formData.parking}
                onChange={handleChange}
                placeholder="Designated 4-wheeler parking at East Raja Gopuram gate"
                className="w-full px-3.5 py-2.5 rounded-xl border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                General Darshan Timings Notes
              </label>
              <input
                type="text"
                name="specialNotes"
                value={formData.specialNotes}
                onChange={handleChange}
                placeholder="Morning: 05:30 AM - 12:30 PM | Evening: 03:30 PM - 09:30 PM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
              />
            </div>

            {/* Quick Facilities Chips */}
            <div className="sm:col-span-3">
              <label className="block font-semibold text-slate-800 mb-1.5">
                Temple Facilities <span className="font-normal text-spiritual-muted">(Click quick pills or edit comma-separated list)</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  'Prasadam Counter',
                  'Cloak Room',
                  'Drinking Water',
                  'Wheelchair Access',
                  'Shoe Stand',
                  'Annadanam Hall',
                  'Locker Facility',
                  'Medical First Aid',
                  'Clean Restrooms',
                  'Battery Vehicle Service',
                ].map((facility) => {
                  const currentList = formData.facilities
                    ? formData.facilities.split(',').map((f) => f.trim())
                    : [];
                  const isPresent = currentList.includes(facility);

                  return (
                    <button
                      type="button"
                      key={facility}
                      onClick={() => {
                        let updated;
                        if (isPresent) {
                          updated = currentList.filter((f) => f !== facility);
                        } else {
                          updated = [...currentList, facility];
                        }
                        setFormData((prev) => ({
                          ...prev,
                          facilities: updated.filter(Boolean).join(', '),
                        }));
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer select-none ${
                        isPresent
                          ? 'bg-[#FFF9EE] border-amber-400 text-amber-900 font-bold shadow-2xs'
                          : 'bg-[#FAF6F0] border-[#E8E2D9] text-slate-600 hover:border-amber-300'
                      }`}
                    >
                      {isPresent ? '✓ ' : '+ '}
                      {facility}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                name="facilities"
                value={formData.facilities}
                onChange={handleChange}
                placeholder="Prasadam Counter, Cloak Room, Wheelchair Access, Drinking Water"
                className="w-full px-3.5 py-2.5 rounded-xl border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold text-slate-800 mb-1.5">
                Devotee Sanctum Guidelines <span className="font-normal text-spiritual-muted">(One rule per line)</span>
              </label>
              <textarea
                name="guidelines"
                value={formData.guidelines}
                onChange={handleChange}
                rows={3}
                placeholder="Mobile phones and cameras strictly prohibited inside sanctum sanctorum&#10;Maintain queue discipline during peak deepam hours&#10;Smoking, alcohol, and non-vegetarian items strictly forbidden"
                className="w-full px-3.5 py-2.5 rounded-xl border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM STICKY ACTION BAR */}
        <div className="sticky bottom-4 z-30 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E8E2D9] shadow-lg flex items-center justify-between gap-4">
          <div className="text-xs text-spiritual-muted">
            <span>Make sure all temple details, contact phones, and guidelines are accurate.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl border border-[#E8E2D9] bg-white text-spiritual-muted hover:text-spiritual-text text-xs font-semibold hover:bg-[#FAF6F0] transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-spiritual-primary text-white text-xs font-bold rounded-xl hover:bg-spiritual-accent disabled:opacity-50 transition-all shadow-spiritual-xs cursor-pointer disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{isUpdating ? 'Saving Profile Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Suggest Category Modal */}
      {suggestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-spiritual-border shadow-spiritual-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-spiritual-border pb-3">
              <h3 className="font-bold text-sm text-spiritual-text flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-spiritual-primary" />
                Suggest a New Category
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSuggestModalOpen(false);
                  setSuggestionFeedback({ type: '', message: '' });
                }}
                className="text-spiritual-muted hover:text-spiritual-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {suggestionFeedback.message && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  suggestionFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {suggestionFeedback.message}
              </div>
            )}

            <form onSubmit={handleSuggestionSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-spiritual-text mb-1">
                  Suggested Category Name *
                </label>
                <input
                  type="text"
                  value={suggestForm.name}
                  onChange={(e) => setSuggestForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Local Village Deity, Heritage Kshetra"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
                />
              </div>

              <div>
                <label className="block font-medium text-spiritual-text mb-1">
                  Explanation / Description (Optional)
                </label>
                <textarea
                  value={suggestForm.description}
                  onChange={(e) => setSuggestForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Explain why this temple is associated with this category..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
                />
              </div>

              <p className="text-[11px] text-spiritual-muted leading-relaxed">
                Category suggestions are reviewed by administrators. Once approved, the category will be created and automatically linked to this temple.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSuggestModalOpen(false);
                    setSuggestionFeedback({ type: '', message: '' });
                  }}
                  className="px-3.5 py-2 rounded-lg border border-spiritual-border text-spiritual-text hover:bg-spiritual-surface text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSuggestion}
                  className="px-4 py-2 rounded-lg bg-spiritual-primary hover:bg-spiritual-primaryDark text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all"
                >
                  {isSubmittingSuggestion ? 'Submitting...' : 'Submit Suggestion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityTempleProfile;
