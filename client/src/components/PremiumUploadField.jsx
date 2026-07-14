import { useState, useRef } from 'react';
import { Upload, X, Check } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

const PremiumUploadField = ({
  label,
  newFiles, // can be a single File or an Array/FileList of Files
  existingFiles, // Array of existing images/banners on server
  onFilesSelected, // callback(files) - passes Array of files
  onRemoveNewFile, // callback(index) - for multiple files
  onRemoveExistingFile, // callback(public_id) - for existing files
  multiple = false,
  accept = 'image/*',
  uploadProgress = 0,
  loading = false,
  success = false
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      if (multiple) {
        onFilesSelected(files);
      } else {
        onFilesSelected([files[0]]);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      if (multiple) {
        onFilesSelected(files);
      } else {
        onFilesSelected([files[0]]);
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  // Convert single file to array for unified rendering
  const filesArray = newFiles 
    ? (newFiles instanceof FileList || Array.isArray(newFiles) ? Array.from(newFiles) : [newFiles])
    : [];

  return (
    <div className="space-y-4 w-full">
      {label && (
        <label className="block text-xxs font-bold text-text-muted uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-brand-accent bg-brand-accent/5 scale-[1.01]'
            : 'border-border-main hover:border-brand-accent/50 bg-primary/40 hover:bg-secondary/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          disabled={loading}
        />

        <div className="flex flex-col items-center text-center space-y-2">
          {success ? (
            <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center animate-bounce">
              <Check className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
          )}

          <div className="text-xs text-text-main font-medium">
            {success ? (
              <span className="text-success font-semibold">Upload Complete!</span>
            ) : isDragActive ? (
              'Drop files here...'
            ) : (
              <span>
                Drag & drop {multiple ? 'files' : 'a file'} here, or <span className="text-brand-accent underline">browse</span>
              </span>
            )}
          </div>
          <p className="text-xxs text-text-muted">Supports files up to 10MB</p>
        </div>
      </div>

      {/* Upload Progress Bar with rounded ends */}
      {loading && uploadProgress > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xxs font-bold text-text-muted uppercase tracking-wider">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden shadow-inner">
            <div
              className="bg-brand-accent h-full rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Preview Section */}
      {(filesArray.length > 0 || (existingFiles && existingFiles.length > 0)) && (
        <div className="space-y-2">
          <label className="block text-xxs font-bold text-text-muted uppercase tracking-wider">
            Selected & Preview
          </label>
          <div className="flex flex-wrap gap-3">
            {/* New files preview */}
            {filesArray.map((file, idx) => {
              // Create local URL for preview
              const url = file instanceof File ? URL.createObjectURL(file) : '';
              return (
                <div key={idx} className="relative group w-16 h-16 rounded-2xl overflow-hidden border border-border-main shadow-sm bg-card shrink-0">
                  {url && (
                    <img
                      src={url}
                      className="w-full h-full object-cover rounded-2xl"
                      alt={`Preview new ${idx}`}
                      onLoad={() => URL.revokeObjectURL(url)}
                    />
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onRemoveNewFile) onRemoveNewFile(idx);
                    }}
                    className="absolute -top-1 -right-1 bg-error text-white rounded-full p-0.5 shadow hover:scale-110 transition-transform cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {/* Existing files preview */}
            {existingFiles && existingFiles.map((file, idx) => {
              const secureUrl = file?.secure_url || file;
              const publicId = file?.public_id || idx;
              return (
                <div key={publicId} className="relative group w-16 h-16 rounded-2xl overflow-hidden border border-border-main shadow-xs bg-card shrink-0">
                  <img
                    src={getOptimizedImageUrl(secureUrl, 150)}
                    className="w-full h-full object-cover rounded-2xl opacity-75"
                    alt={`Preview existing ${idx}`}
                  />
                  {onRemoveExistingFile && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveExistingFile(file?.public_id || file);
                      }}
                      className="absolute -top-1 -right-1 bg-error text-white rounded-full p-0.5 shadow hover:scale-110 transition-transform cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumUploadField;
