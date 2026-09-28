import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Link2,
  Trash2,
  AlertCircle,
  CheckCircle,
  Cloud,
  FileImage,
  RefreshCw,
  MoreVertical,
  Star,
  Flag,
  X,
  Plus,
  Layers,
} from 'lucide-react';
import {
  useGetAuthorityGalleryQuery,
  useAddGalleryImageMutation,
  useUploadGalleryImageMutation,
  useDeleteGalleryImageMutation,
  useSetGalleryThumbnailMutation,
  useSetGalleryBannerMutation,
} from '../../store/api/authorityApi.js';

export interface GalleryImageItem {
  _id?: string;
  url: string;
  alt?: string;
  publicId?: string;
  isThumbnail?: boolean;
  isBanner?: boolean;
  order?: number;
}

interface LocalSelectedFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
}

interface FeedbackState {
  type: '' | 'success' | 'error';
  message: string;
}

export const AuthorityGallery: React.FC = () => {
  const { data: galleryRes, isLoading, refetch } = useGetAuthorityGalleryQuery();
  const [addImageUrl, { isLoading: isAddingUrl }] = useAddGalleryImageMutation();
  const [uploadImageFile, { isLoading: isUploadingFile }] = useUploadGalleryImageMutation();
  const [deleteImage, { isLoading: isDeleting }] = useDeleteGalleryImageMutation();
  const [setThumbnail, { isLoading: isSettingThumbnail }] = useSetGalleryThumbnailMutation();
  const [setBanner, { isLoading: isSettingBanner }] = useSetGalleryBannerMutation();

  const [activeMenuId, setActiveMenuId] = useState<string | number | null>(null);

  // Mode: 'UPLOAD' (local file) or 'URL' (external link)
  const [uploadMode, setUploadMode] = useState<'UPLOAD' | 'URL'>('UPLOAD');

  // URL mode state
  const [urlData, setUrlData] = useState<{ url: string; alt: string }>({
    url: '',
    alt: '',
  });

  // Multiple local files state: array of { id, file, preview, name, size }
  const [selectedFiles, setSelectedFiles] = useState<LocalSelectedFile[]>([]);
  const [fileAlt, setFileAlt] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [feedback, setFeedback] = useState<FeedbackState>({ type: '', message: '' });
  const [deleteCandidate, setDeleteCandidate] = useState<GalleryImageItem | null>(null);

  const images: GalleryImageItem[] = (galleryRes?.data as GalleryImageItem[]) || [];

  const processFiles = (incomingFiles: FileList | File[] | null) => {
    if (!incomingFiles || incomingFiles.length === 0) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB per file
    const added: LocalSelectedFile[] = [];
    let oversizeCount = 0;
    let invalidTypeCount = 0;

    Array.from(incomingFiles).forEach((file) => {
      // Validate MIME type
      if (!validTypes.includes(file.type)) {
        invalidTypeCount++;
        return;
      }

      // Validate individual file size
      if (file.size > maxFileSize) {
        oversizeCount++;
        return;
      }

      // Avoid exact duplicates in current selection
      const exists = selectedFiles.some(
        (sf) => sf.file.name === file.name && sf.file.size === file.size
      );
      if (exists) return;

      added.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      });
    });

    if (oversizeCount > 0 || invalidTypeCount > 0) {
      const issues: string[] = [];
      if (oversizeCount > 0) issues.push(`${oversizeCount} file(s) exceeded the 5MB size limit`);
      if (invalidTypeCount > 0) issues.push(`${invalidTypeCount} file(s) were not JPG, PNG, or WEBP`);
      setFeedback({
        type: 'error',
        message: issues.join(' and ') + '.',
      });
    } else {
      setFeedback({ type: '', message: '' });
    }

    if (added.length > 0) {
      setSelectedFiles((prev) => [...prev, ...added]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset file input so user can re-select if desired
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer?.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (idToRemove: string) => {
    setSelectedFiles((prev) => {
      const target = prev.find((item) => item.id === idToRemove);
      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((item) => item.id !== idToRemove);
    });
  };

  const handleClearAllFiles = () => {
    selectedFiles.forEach((item) => {
      if (item.preview) URL.revokeObjectURL(item.preview);
    });
    setSelectedFiles([]);
  };

  const handleUploadFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setFeedback({ type: 'error', message: 'Please select at least one image file to upload.' });
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((item) => {
      formData.append('images', item.file);
    });
    formData.append('alt', fileAlt.trim());
    formData.append('order', String(images.length));

    try {
      const res = await uploadImageFile(formData).unwrap();
      const count = selectedFiles.length;
      handleClearAllFiles();
      setFileAlt('');
      setFeedback({
        type: 'success',
        message:
          res?.message ||
          `${count} ${count === 1 ? 'image' : 'images'} uploaded to temple gallery via Cloudinary successfully.`,
      });
      refetch();
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data
          ? String(err.data.message)
          : 'Failed to upload images. Please verify file formats/sizes and try again.';
      setFeedback({
        type: 'error',
        message: msg,
      });
    }
  };

  const handleAddUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlData.url.trim()) return;

    try {
      await addImageUrl({
        url: urlData.url.trim(),
        alt: urlData.alt.trim(),
        order: images.length,
      }).unwrap();

      setUrlData({ url: '', alt: '' });
      setFeedback({ type: 'success', message: 'Image URL added to temple gallery successfully.' });
      refetch();
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data
          ? String(err.data.message)
          : 'Failed to add image. Please verify the URL.';
      setFeedback({
        type: 'error',
        message: msg,
      });
    }
  };

  const handleSetThumbnail = async (img: GalleryImageItem) => {
    setActiveMenuId(null);
    try {
      const id = img._id || img.url;
      await setThumbnail(id).unwrap();
      setFeedback({ type: 'success', message: 'Image set as temple thumbnail successfully.' });
      refetch();
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data
          ? String(err.data.message)
          : 'Failed to set thumbnail.';
      setFeedback({
        type: 'error',
        message: msg,
      });
    }
  };

  const handleSetBanner = async (img: GalleryImageItem) => {
    setActiveMenuId(null);
    try {
      const id = img._id || img.url;
      await setBanner(id).unwrap();
      setFeedback({ type: 'success', message: 'Image set as temple banner successfully.' });
      refetch();
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data
          ? String(err.data.message)
          : 'Failed to set banner.';
      setFeedback({
        type: 'error',
        message: msg,
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      const idToDelete = deleteCandidate._id || deleteCandidate.url;
      await deleteImage(idToDelete).unwrap();
      setDeleteCandidate(null);
      setFeedback({ type: 'success', message: 'Image removed from gallery.' });
      refetch();
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data
          ? String(err.data.message)
          : 'Failed to delete gallery image.';
      setFeedback({
        type: 'error',
        message: msg,
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

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-spiritual-text">Temple Gallery Management</h1>
        <p className="text-xs text-spiritual-muted mt-1">
          Curate sacred imagery of your temple sanctum, architectural gopurams, deities, and religious festivals.
        </p>
      </div>

      {feedback.message && (
        <div
          className={`p-4 rounded-lg text-xs flex items-center gap-2 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* DUAL-OPTION ADD IMAGE CARD */}
      <div className="spiritual-card p-5 space-y-4 shadow-spiritual-xs">
        <div className="flex items-center justify-between pb-3 border-b border-spiritual-border">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-spiritual-primary" />
            <h2 className="text-sm font-serif font-bold text-spiritual-text">Add Temple Image</h2>
          </div>

          {/* Mode Selector Tabs */}
          <div className="inline-flex rounded-lg p-1 bg-spiritual-surface border border-spiritual-border text-xs">
            <button
              type="button"
              onClick={() => setUploadMode('UPLOAD')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
                uploadMode === 'UPLOAD'
                  ? 'bg-spiritual-primary text-white shadow-spiritual-xs'
                  : 'text-spiritual-muted hover:text-spiritual-text'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload from Computer</span>
            </button>

            <button
              type="button"
              onClick={() => setUploadMode('URL')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
                uploadMode === 'URL'
                  ? 'bg-spiritual-primary text-white shadow-spiritual-xs'
                  : 'text-spiritual-muted hover:text-spiritual-text'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Provide Image URL</span>
            </button>
          </div>
        </div>

        {/* OPTION 1: LOCAL MULTIPLE FILE UPLOAD (CLOUDINARY) */}
        {uploadMode === 'UPLOAD' && (
          <form onSubmit={handleUploadFileSubmit} className="space-y-4 text-xs">
            {/* Dropzone area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                isDragging
                  ? 'border-spiritual-primary bg-amber-50/60 scale-[1.005]'
                  : 'border-spiritual-border bg-spiritual-surface/40 hover:border-spiritual-primary/50 hover:bg-spiritual-surface/70'
              }`}
            >
              <input
                type="file"
                id="galleryFileInput"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="galleryFileInput"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2 select-none"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100/70 border border-amber-200/80 flex items-center justify-center text-spiritual-primary shadow-2xs">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-spiritual-text text-sm hover:underline">
                    Click to browse files
                  </span>{' '}
                  <span className="text-spiritual-muted font-medium">or drag & drop images here</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-spiritual-muted">
                  <span className="inline-flex items-center gap-1 font-semibold text-spiritual-primary bg-spiritual-surface px-2 py-0.5 rounded-full border border-spiritual-border">
                    <Layers className="w-3 h-3" /> Multiple uploads supported
                  </span>
                  <span>•</span>
                  <span>JPG, PNG, or WEBP up to 5MB each (Max 20 at once)</span>
                </div>
              </label>
            </div>

            {/* Selected Files Queue & Alt Text Input */}
            {selectedFiles.length > 0 && (
              <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                {/* Queue Summary Bar */}
                <div className="flex items-center justify-between pb-2 border-b border-spiritual-border">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-spiritual-text text-xs">
                      Selected Images ({selectedFiles.length})
                    </span>
                    <span className="text-[11px] font-mono text-spiritual-muted">
                      • {(selectedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB total
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Add More Files Button */}
                    <label
                      htmlFor="galleryFileInput"
                      className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-spiritual-surface border border-spiritual-border text-spiritual-text font-semibold hover:bg-spiritual-surface/80 text-[11px] transition-colors"
                    >
                      <Plus className="w-3 h-3 text-spiritual-primary" />
                      <span>Add more</span>
                    </label>

                    {/* Clear All Button */}
                    <button
                      type="button"
                      onClick={handleClearAllFiles}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200/80 font-semibold text-[11px] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear all</span>
                    </button>
                  </div>
                </div>

                {/* Previews Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto p-1 border border-spiritual-border/60 rounded-xl bg-spiritual-surface/20">
                  {selectedFiles.map((item, idx) => (
                    <div
                      key={item.id}
                      className="group relative rounded-xl border border-spiritual-border bg-white overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                        <img
                          src={item.preview}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        {/* Remove Overlay Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(item.id)}
                          title="Remove image"
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        {/* Order Index Tag */}
                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white font-mono text-[9px] font-bold">
                          #{idx + 1}
                        </span>
                      </div>

                      {/* File Details */}
                      <div className="p-2 min-w-0">
                        <p className="font-semibold text-spiritual-text text-[11px] truncate" title={item.name}>
                          {item.name}
                        </p>
                        <p className="text-[10px] text-spiritual-muted font-mono mt-0.5">
                          {(item.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Common Alt Text / Caption Field */}
                <div>
                  <label className="block font-semibold text-spiritual-text mb-1 text-xs">
                    Common Alt Text / Caption <span className="font-normal text-spiritual-muted">(Optional, applies to these uploaded images)</span>
                  </label>
                  <input
                    type="text"
                    value={fileAlt}
                    onChange={(e) => setFileAlt(e.target.value)}
                    placeholder="e.g. Arunachaleswarar Temple Brahmotsavam Festival & Gopuram"
                    className="w-full px-3 py-2 rounded-xl border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary text-xs"
                  />
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={selectedFiles.length === 0 || isUploadingFile}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-spiritual-primary text-white rounded-xl font-semibold hover:bg-spiritual-primaryHover disabled:opacity-50 shadow-spiritual-xs text-xs transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {isUploadingFile ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>
                      Uploading {selectedFiles.length} {selectedFiles.length === 1 ? 'image' : 'images'} to Cloudinary...
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {selectedFiles.length > 0
                        ? `Upload ${selectedFiles.length} ${selectedFiles.length === 1 ? 'Image' : 'Images'} to Gallery`
                        : 'Upload to Gallery'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* OPTION 2: IMAGE URL */}
        {uploadMode === 'URL' && (
          <form onSubmit={handleAddUrlSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-spiritual-text mb-1">
                  Public Image URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={urlData.url}
                  onChange={(e) => setUrlData({ ...urlData, url: e.target.value })}
                  placeholder="https://example.com/images/temple-front.jpg"
                  className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-spiritual-text mb-1">
                  Alt Text / Description
                </label>
                <input
                  type="text"
                  value={urlData.alt}
                  onChange={(e) => setUrlData({ ...urlData, alt: e.target.value })}
                  placeholder="e.g. Sanctum Sanctorum Front View"
                  className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary text-xs"
                />
              </div>
            </div>

            {urlData.url && (
              <div className="flex items-center gap-3 p-2 bg-spiritual-surface rounded-lg border border-spiritual-border">
                <img
                  src={urlData.url}
                  alt="URL Preview"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/100x100?text=Invalid+Image';
                  }}
                  className="w-14 h-14 object-cover rounded-md border border-spiritual-border"
                />
                <span className="text-[11px] text-spiritual-muted truncate font-mono">
                  {urlData.url}
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={!urlData.url.trim() || isAddingUrl}
                className="inline-flex items-center gap-2 px-5 py-2 bg-spiritual-primary text-white rounded-lg font-semibold hover:bg-spiritual-primaryHover disabled:opacity-50 shadow-spiritual-xs text-xs transition-all"
              >
                {isAddingUrl ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Adding Image...</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Add Image URL</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* GALLERY GRID */}
      <div className="spiritual-card p-6 space-y-4 shadow-spiritual-xs">
        <div className="flex items-center justify-between pb-3 border-b border-spiritual-border">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-serif font-bold text-spiritual-text">Active Gallery Images</h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-spiritual-surface border border-spiritual-border font-semibold text-spiritual-muted">
              {images.length} {images.length === 1 ? 'image' : 'images'}
            </span>
          </div>
        </div>

        {images.length === 0 ? (
          <div className="py-12 text-center text-xs text-spiritual-muted space-y-2">
            <FileImage className="w-8 h-8 mx-auto opacity-50 mb-2" />
            <p className="font-semibold text-spiritual-text">No gallery images yet.</p>
            <p>Use the options above to upload photos or link external image URLs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {images.map((img, idx) => {
              const imageId = img._id || idx;
              const isMenuOpen = activeMenuId === imageId;

              return (
                <div
                  key={imageId}
                  className="group relative rounded-2xl border border-spiritual-border overflow-hidden bg-white shadow-spiritual-xs hover:shadow-spiritual-md transition-all flex flex-col"
                >
                  {/* Image Preview Container */}
                  <div className="relative aspect-video bg-spiritual-surface overflow-hidden flex items-center justify-center">
                    <img
                      src={img.url}
                      alt={img.alt || 'Temple Image'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Source Tag (Cloudinary vs External) */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                      {img.publicId ? (
                        <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-white flex items-center gap-1">
                          <Cloud className="w-2.5 h-2.5 text-amber-400" />
                          <span>Cloudinary</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-white flex items-center gap-1">
                          <Link2 className="w-2.5 h-2.5 text-blue-400" />
                          <span>External</span>
                        </span>
                      )}
                    </div>

                    {/* Three-Dot Action Menu Button */}
                    <div className="absolute top-2.5 right-2.5 z-20">
                      <button
                        type="button"
                        id={`gallery-menu-btn-${imageId}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : imageId);
                        }}
                        disabled={isSettingThumbnail || isSettingBanner || isDeleting}
                        aria-label="Gallery Image Actions"
                        className="p-1.5 rounded-lg bg-black/60 hover:bg-black/85 text-white backdrop-blur-xs transition-colors shadow-spiritual-xs focus:outline-none focus:ring-2 focus:ring-spiritual-primary"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <>
                          {/* Invisible backdrop to catch outside clicks */}
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setActiveMenuId(null)}
                          />

                          <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-spiritual-lg border border-spiritual-border py-1.5 z-40 text-xs animate-in fade-in zoom-in-95">
                            {/* 1. Set as Thumbnail */}
                            <button
                              type="button"
                              onClick={() => handleSetThumbnail(img)}
                              disabled={img.isThumbnail || isSettingThumbnail}
                              className={`w-full px-3.5 py-2 text-left flex items-center gap-2 font-medium transition-colors ${
                                img.isThumbnail
                                  ? 'text-amber-700 bg-amber-50 cursor-default'
                                  : 'text-spiritual-text hover:bg-spiritual-surface'
                              }`}
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  img.isThumbnail ? 'text-amber-600 fill-amber-600' : 'text-spiritual-muted'
                                }`}
                              />
                              <span>
                                {img.isThumbnail ? 'Current Thumbnail' : 'Set as Thumbnail'}
                              </span>
                            </button>

                            {/* 2. Set as Banner */}
                            <button
                              type="button"
                              onClick={() => handleSetBanner(img)}
                              disabled={img.isBanner || isSettingBanner}
                              className={`w-full px-3.5 py-2 text-left flex items-center gap-2 font-medium transition-colors ${
                                img.isBanner
                                  ? 'text-rose-700 bg-rose-50 cursor-default'
                                  : 'text-spiritual-text hover:bg-spiritual-surface'
                              }`}
                            >
                              <Flag
                                className={`w-3.5 h-3.5 ${
                                  img.isBanner ? 'text-rose-600 fill-rose-600' : 'text-spiritual-muted'
                                }`}
                              />
                              <span>
                                {img.isBanner ? 'Current Banner' : 'Set as Banner'}
                              </span>
                            </button>

                            <div className="my-1 border-t border-spiritual-borderLight" />

                            {/* 3. Delete */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                setDeleteCandidate(img);
                              }}
                              disabled={isDeleting}
                              className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-red-600 hover:bg-red-50 font-medium transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Body & Badges */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between text-xs space-y-2">
                    <div>
                      <p className="font-semibold text-spiritual-text truncate">
                        {img.alt || <span className="italic text-spiritual-muted font-normal">Untitled photograph</span>}
                      </p>
                      <p className="text-[10px] text-spiritual-muted font-mono truncate">{img.url}</p>
                    </div>

                    {/* Status Badges: Thumbnail & Banner */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {img.isThumbnail && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] tracking-wide uppercase shadow-xs">
                          <Star className="w-3 h-3 text-amber-600 fill-amber-600" />
                          <span>Thumbnail</span>
                        </span>
                      )}

                      {img.isBanner && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 font-bold text-[10px] tracking-wide uppercase shadow-xs">
                          <Flag className="w-3 h-3 text-rose-600 fill-rose-600" />
                          <span>Banner</span>
                        </span>
                      )}

                      {!img.isThumbnail && !img.isBanner && (
                        <span className="text-[10px] text-spiritual-muted italic">
                          Standard gallery image
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-spiritual-lg border border-spiritual-border animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-serif font-bold text-spiritual-text">
                Delete this gallery image?
              </h3>
              <p className="text-xs text-spiritual-muted leading-relaxed">
                Are you sure you want to delete this image from your temple gallery?
                {deleteCandidate.isThumbnail && ' This image is currently set as the temple thumbnail.'}
                {deleteCandidate.isBanner && ' This image is currently set as the temple banner.'}
                {deleteCandidate.publicId && ' (The asset will also be removed from Cloudinary).'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-spiritual-border rounded-xl text-xs font-semibold text-spiritual-muted hover:text-spiritual-text transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors shadow-spiritual-xs"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityGallery;
