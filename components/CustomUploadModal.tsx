import React, { useState, useRef } from 'react';
import { UploadCloud, File, AlertCircle, CheckCircle2, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';

interface CustomUploadViewProps {
  componentLabel: string;
  uploadMode: 'TYPE' | 'INGREDIENT';
  ingredientName?: string;
  existingVersions: string[];
  onCancel: () => void;
  onUploadComplete: (file: File | null, versionString: string, description: string) => void;
}

type UploadStatus = 'IDLE' | 'UPLOADING' | 'ERROR' | 'SUCCESS';
type VersionStrategy = 'AUTO' | 'CUSTOM';

const CustomUploadView: React.FC<CustomUploadViewProps> = ({ 
  componentLabel, 
  uploadMode,
  ingredientName,
  existingVersions,
  onCancel, 
  onUploadComplete 
}) => {
  const [status, setStatus] = useState<UploadStatus>('IDLE');
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [versionStrategy, setVersionStrategy] = useState<VersionStrategy>('AUTO');
  const [customVersion, setCustomVersion] = useState('');
  const [description, setDescription] = useState('');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('IDLE');
    }
  };

  const handleStartUpload = () => {
    // If detecting duplicate, we are just selecting existing, so no upload logic needed
    if (isDuplicate) {
        onUploadComplete(null, customVersion, description);
        return;
    }

    if (!file) return;

    setStatus('UPLOADING');
    setProgress(0);

    // Simulate upload process
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // SIMULATE FAILURE
          if (simulateFailure || file.name.toLowerCase().includes('fail')) {
            setStatus('ERROR');
            return 100;
          }

          // SIMULATE SUCCESS
          setStatus('SUCCESS');
          
          // Wait a moment before completing logic to show 100%
          setTimeout(() => {
            const finalVersion = versionStrategy === 'AUTO' 
              ? `2025.12.4.${Math.floor(Math.random() * 1000) + 600} (Custom)` 
              : customVersion || 'Custom-Build-001';
            
            onUploadComplete(file, finalVersion, description);
          }, 800);
          
          return 100;
        }
        // Random increment
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 300);
  };

  const resetUpload = () => {
    setFile(null);
    setStatus('IDLE');
    setProgress(0);
  };

  const isTypeMode = uploadMode === 'TYPE';
  const isDuplicate = versionStrategy === 'CUSTOM' && existingVersions.includes(customVersion);

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
      
      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-8">
        
        {/* Main Context Header */}
        <div className="mb-6 flex items-start justify-between">
           <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {isTypeMode ? 'Upload Custom Release' : 'Upload Custom Binary'}
                <span className="text-gray-300 font-light text-2xl">/</span>
                <span className="text-blue-600">
                  {isTypeMode ? componentLabel : ingredientName}
                </span>
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {isTypeMode 
                  ? `Upload a binary package to create a custom version for the ${componentLabel} component.`
                  : `Upload a binary package to add a new version to ${ingredientName}.`
                }
              </p>
           </div>
           
           {/* Failure Simulation Toggle */}
           <label className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors select-none">
              <input 
                type="checkbox" 
                checked={simulateFailure} 
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500" 
              />
              Simulate Failure
           </label>
        </div>

        <div className="max-w-3xl space-y-8">
          
          {/* Version Strategy Selection */}
          <section className="space-y-4">
            <label className="block text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
              1. Version Configuration
            </label>
            
            <div className="space-y-3 pl-2">
              <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg border transition-all ${versionStrategy === 'AUTO' ? 'bg-blue-50 border-blue-200' : 'bg-white border-transparent hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="versionStrategy"
                  checked={versionStrategy === 'AUTO'}
                  onChange={() => setVersionStrategy('AUTO')}
                  disabled={status !== 'IDLE' && status !== 'ERROR'}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <span className="block text-sm font-semibold text-gray-800">Auto-generate version</span>
                  <span className="text-xs text-gray-500">The system will calculate the next version string based on submission.</span>
                </div>
              </label>

              <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg border transition-all ${versionStrategy === 'CUSTOM' ? 'bg-blue-50 border-blue-200' : 'bg-white border-transparent hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="versionStrategy"
                  checked={versionStrategy === 'CUSTOM'}
                  onChange={() => setVersionStrategy('CUSTOM')}
                  disabled={status !== 'IDLE' && status !== 'ERROR'}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="block text-sm font-semibold text-gray-800">Use custom version</span>
                  <span className="text-xs text-gray-500">Manually specify the version string for this package.</span>
                  
                  {versionStrategy === 'CUSTOM' && (
                    <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
                      <input 
                        type="text"
                        placeholder="e.g., 1.0.0-beta.1"
                        value={customVersion}
                        onChange={(e) => setCustomVersion(e.target.value)}
                        disabled={status !== 'IDLE' && status !== 'ERROR'}
                        className="w-full max-w-sm px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  )}
                </div>
              </label>
            </div>
          </section>

          {/* Duplicate Version Warning */}
          {isDuplicate && (
             <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 animate-in fade-in duration-300 mx-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                   <h4 className="text-sm font-bold text-amber-800">Version Already Exists</h4>
                   <p className="text-sm text-amber-700 mt-1">
                     The version <strong>{customVersion}</strong> already exists for this ingredient. 
                     To prevent conflicts, you can use the existing release instead of uploading a new duplicate.
                   </p>
                </div>
             </div>
          )}

          {/* Description Field */}
          <section className="space-y-4">
             <label className="block text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                2. Description <span className="text-gray-400 font-normal ml-1">(Optional)</span>
             </label>
             <div className="pl-2">
                <textarea
                   rows={3}
                   placeholder="Enter details about this custom release (e.g., specific fix, patch notes)..."
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   disabled={status !== 'IDLE' && status !== 'ERROR'}
                   className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
             </div>
          </section>

          {/* Upload Area (Hidden if Duplicate) */}
          {!isDuplicate && (
            <section className="space-y-4">
               <label className="block text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                  3. Package Upload <span className="text-red-500">*</span>
               </label>

               <div className="pl-2">
                  {/* ERROR STATE */}
                  {status === 'ERROR' && (
                      <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-in shake">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-red-800">Upload Failed</h4>
                            <p className="text-xs text-red-600 mt-1">
                              The package verification failed due to network interruption or invalid checksum. Please check the file and try again.
                            </p>
                        </div>
                        <button onClick={resetUpload} className="text-xs font-medium text-red-700 hover:text-red-800 underline">
                            Retry
                        </button>
                      </div>
                  )}

                  {/* UPLOADING STATE */}
                  {status === 'UPLOADING' || status === 'SUCCESS' ? (
                      <div className="border-2 border-solid border-gray-200 rounded-xl p-8 bg-gray-50 flex flex-col items-center justify-center min-h-[200px]">
                        {status === 'SUCCESS' ? (
                            <div className="flex flex-col items-center text-green-600 animate-in zoom-in duration-300">
                              <CheckCircle2 className="w-12 h-12 mb-2" />
                              <span className="font-bold text-lg">Upload Complete!</span>
                              <span className="text-sm text-gray-500 mt-1">Finalizing version...</span>
                            </div>
                        ) : (
                            <div className="w-full max-w-xs">
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                  <span className="font-medium text-gray-700">Uploading {file?.name}...</span>
                                  <span>{progress}%</span>
                              </div>
                              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                  <div 
                                    className="h-full bg-blue-600 transition-all duration-300 ease-out rounded-full"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                              </div>
                              <div className="flex justify-center mt-4 text-xs text-gray-400 flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Processing file...
                              </div>
                            </div>
                        )}
                      </div>
                  ) : (
                      /* IDLE / DROPZONE STATE */
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-10 bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center group min-h-[200px]"
                      >
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden" 
                        />
                        
                        {file ? (
                            <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
                              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                                  <File className="w-7 h-7" />
                              </div>
                              <span className="text-base font-bold text-gray-900">{file.name}</span>
                              <span className="text-sm text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                              <span className="text-xs text-blue-600 mt-4 group-hover:underline font-medium">Click to replace file</span>
                            </div>
                        ) : (
                            <>
                              <div className="w-14 h-14 bg-white border border-gray-200 rounded-xl flex items-center justify-center mb-4 text-gray-400 group-hover:text-blue-500 group-hover:border-blue-300 transition-colors shadow-sm">
                                  <UploadCloud className="w-7 h-7" />
                              </div>
                              <div className="text-base text-gray-900 font-semibold mb-1">
                                  Click to upload or drag and drop
                              </div>
                              <p className="text-sm text-gray-500">Supported formats: .bin, .zip, .tar.gz (Max 10GB)</p>
                            </>
                        )}
                      </div>
                  )}
               </div>
            </section>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
        <button 
          onClick={onCancel}
          disabled={status === 'UPLOADING' || status === 'SUCCESS'}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        
        {isDuplicate ? (
             <button 
                onClick={handleStartUpload}
                className="px-5 py-2.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
             >
                <CheckCircle2 className="w-4 h-4" />
                Use Existing Version
             </button>
        ) : (
             <button 
                onClick={handleStartUpload}
                disabled={!file || status === 'UPLOADING' || status === 'SUCCESS'}
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
             >
                {status === 'UPLOADING' ? 'Uploading...' : 'Upload Package'}
                {status !== 'UPLOADING' && <ArrowRight className="w-4 h-4" />}
             </button>
        )}
      </div>
    </div>
  );
};

export default CustomUploadView;