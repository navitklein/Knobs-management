
import React from 'react';
import { RotateCcw, Upload, ArrowRightLeft, FileUp, History, Info, Activity } from 'lucide-react';
import { ComponentTypeData, ChangeType, ComponentStatus } from '../types';

interface TypeLevelControlsProps {
  typeData: ComponentTypeData;
  onReplaceIngredient: () => void;
  onUploadTypeOverride: () => void;
  onReuseUpload: () => void;
  onRevert: () => void;
}

const TypeLevelControls: React.FC<TypeLevelControlsProps> = ({ 
  typeData, 
  onReplaceIngredient, 
  onUploadTypeOverride, 
  onReuseUpload,
  onRevert 
}) => {
  const isModified = typeData.changeType !== ChangeType.NONE;
  const isLocked = typeData.status === ComponentStatus.LOCKED;

  if (isLocked) {
    return (
       <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
         <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-2 rounded-lg">
               <RotateCcw className="w-4 h-4 text-gray-400" />
            </div>
            <div>
               <h1 className="text-sm font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                 {typeData.label} Configuration
               </h1>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                 <Info className="w-3 h-3" /> Protected by Corporate Governance
               </p>
            </div>
         </div>
       </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-20 shadow-sm transition-all">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg transition-all ${isModified ? 'bg-amber-600 shadow-amber-100 shadow-lg text-white' : 'bg-blue-600 shadow-blue-100 shadow-lg text-white'}`}>
           {isModified ? <Activity className="w-4 h-4" /> : <ArrowRightLeft className="w-4 h-4" />}
        </div>
        <div>
           <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-gray-900 uppercase tracking-tighter">
                {typeData.label} Settings
              </h1>
              {isModified && (
                 <span className="text-[8px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">
                   Modified
                 </span>
              )}
           </div>
           <p className="text-[10px] text-gray-500 font-medium mt-0.5">
             {typeData.status === ComponentStatus.CONFIGURED 
               ? 'Manage artifact selection and release pathing.' 
               : 'No release configured for this build target.'}
           </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isModified && (
          <button 
            onClick={onRevert}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-red-500 hover:bg-red-50 rounded uppercase tracking-tighter transition-all"
            title="Revert staged changes"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Revert
          </button>
        )}

        <div className="h-6 w-px bg-gray-200 mx-2"></div>

        <div className="flex bg-gray-100 p-0.5 rounded border border-gray-200">
           <button 
             onClick={onUploadTypeOverride}
             className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-gray-600 hover:bg-white hover:shadow-sm rounded uppercase tracking-tighter transition-all"
             title="Upload custom binary"
           >
             <Upload className="w-3.5 h-3.5" />
             Upload
           </button>
           <button 
             onClick={onReuseUpload}
             className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-blue-600 hover:bg-white hover:shadow-sm rounded uppercase tracking-tighter transition-all"
             title="Reuse historical build"
           >
             <History className="w-3.5 h-3.5" />
             Reuse
           </button>
        </div>

        <button 
          onClick={onReplaceIngredient}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-black text-white bg-blue-600 hover:bg-blue-700 rounded shadow-md shadow-blue-100 uppercase tracking-widest transition-all"
        >
          {typeData.status === ComponentStatus.CONFIGURED ? (
             <>
               <ArrowRightLeft className="w-3.5 h-3.5" />
               Change Source
             </>
          ) : (
            <>
              <FileUp className="w-3.5 h-3.5" />
              Initialize Target
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TypeLevelControls;
