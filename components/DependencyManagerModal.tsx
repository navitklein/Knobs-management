
import React, { useState } from 'react';
import ModalSidebar from './ModalSidebar';
import TypeLevelControls from './TypeLevelControls';
import IngredientLevelView from './IngredientLevelView';
import CustomUploadView from './CustomUploadModal';
import IngredientReplacementWizard from './IngredientReplacementWizard';
import QuickSelectCustomView from './QuickSelectCustomView';
import { AppState, ChangeType, Ingredient, ComponentStatus, Version } from '../types';
import { X, Save, CheckCircle2, Layers, AlertCircle, Settings2 } from 'lucide-react';

interface DependencyManagerModalProps {
  appState: AppState;
  onClose: () => void;
  onSave: (updatedTypes: any[]) => void;
  // State updaters for the internal workings of the modal
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  // Initial config
  initialTypeId?: string;
  initialViewMode?: 'DETAILS' | 'PICK_INGREDIENT' | 'UPLOAD' | 'QUICK_SELECT';
  initialUploadMode?: 'TYPE' | 'INGREDIENT';
}

export default function DependencyManagerModal({ 
  appState, 
  onClose, 
  onSave, 
  setAppState,
  initialTypeId,
  initialViewMode,
  initialUploadMode
}: DependencyManagerModalProps) {
  
  const [selectedTypeId, setSelectedTypeId] = useState<string>(initialTypeId || 'type-ec');
  const [viewMode, setViewMode] = useState<'DETAILS' | 'PICK_INGREDIENT' | 'UPLOAD' | 'QUICK_SELECT'>(initialViewMode || 'DETAILS');
  const [uploadMode, setUploadMode] = useState<'TYPE' | 'INGREDIENT'>(initialUploadMode || 'TYPE');

  // --- HELPERS ---
  const activeType = appState.types.find(t => t.id === selectedTypeId)!;
  const activeIngredient = appState.ingredients.find(i => i.id === activeType.stagedIngredientId);
  const totalModifications = appState.types.filter(t => t.changeType !== ChangeType.NONE).length;

  // --- HANDLERS ---

  const handleSelectType = (id: string) => {
    setSelectedTypeId(id);
    setViewMode('DETAILS'); // Reset view when switching types
  };

  const handleRevertType = () => {
    setAppState(prev => ({
      ...prev,
      types: prev.types.map(t => {
        if (t.id === selectedTypeId) {
          return {
            ...t,
            stagedIngredientId: t.originalIngredientId,
            stagedVersionId: t.originalVersionId,
            status: t.originalIngredientId ? ComponentStatus.CONFIGURED : ComponentStatus.NOT_CONFIGURED,
            changeType: ChangeType.NONE
          };
        }
        return t;
      })
    }));
  };

  const handleWizardComplete = (ing: Ingredient, ver: Version) => {
    setAppState(prev => ({
      ...prev,
      types: prev.types.map(t => {
        if (t.id === selectedTypeId) {
          return {
            ...t,
            stagedIngredientId: ing.id,
            stagedVersionId: ver.id,
            status: ComponentStatus.CONFIGURED,
            changeType: ChangeType.INGREDIENT_CHANGE
          };
        }
        return t;
      })
    }));
    setViewMode('DETAILS');
  };

  const handleSelectVersion = (versionId: string) => {
    setAppState(prev => ({
      ...prev,
      types: prev.types.map(t => {
        if (t.id === selectedTypeId) {
          const isOriginal = t.originalVersionId === versionId && t.originalIngredientId === t.stagedIngredientId;
          return {
            ...t,
            stagedVersionId: versionId,
            changeType: isOriginal ? ChangeType.NONE : (t.changeType === ChangeType.INGREDIENT_CHANGE ? ChangeType.INGREDIENT_CHANGE : ChangeType.VERSION_CHANGE)
          };
        }
        return t;
      })
    }));
  };

  const handleUploadComplete = (file: File | null, versionString: string, description: string) => {
    setViewMode('DETAILS');
    let targetIngredientId = activeIngredient?.id;
    if (!targetIngredientId && uploadMode === 'TYPE') {
       targetIngredientId = appState.ingredients[0].id;
    }
    if (!targetIngredientId) return;

    if (!file) {
      const ing = appState.ingredients.find(i => i.id === targetIngredientId);
      const existingVersion = ing?.versions.find(v => v.versionString === versionString);
      if (existingVersion) {
        handleSelectVersion(existingVersion.id);
      }
      return;
    }

    const newVersionId = `v-custom-${Date.now()}`;
    const newVersion: Version = {
      id: newVersionId,
      versionString: versionString,
      releaseDate: new Date().toLocaleDateString(),
      releasedBy: 'User Upload',
      isNewer: true,
      description: description
    };

    setAppState(prev => {
      const updatedIngredients = prev.ingredients.map(ing => {
        if (ing.id === targetIngredientId) {
          return { ...ing, versions: [newVersion, ...ing.versions] };
        }
        return ing;
      });
      const updatedTypes = prev.types.map(t => {
        if (t.id === selectedTypeId) {
          return {
            ...t,
            stagedIngredientId: targetIngredientId!,
            stagedVersionId: newVersionId,
            status: ComponentStatus.CONFIGURED,
            changeType: ChangeType.CUSTOM_UPLOAD
          };
        }
        return t;
      });
      return { types: updatedTypes, ingredients: updatedIngredients };
    });
  };

  // --- RENDER ---

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-gray-900/80 backdrop-blur-md animate-in fade-in duration-300">
      
      <div className="bg-white w-full max-w-7xl h-[85vh] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-gray-700/10 animate-in zoom-in-95 duration-300">
        
        {/* GLOBAL HEADER */}
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0 relative z-50">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-100">
                <Settings2 className="w-5 h-5 text-white" />
            </div>
            <div>
               <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Configuration Management</h2>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Modify Build Parameters & Artifact Mapping</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={viewMode === 'UPLOAD'}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all disabled:opacity-30"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* MAIN BODY */}
        <div className="flex-1 flex overflow-hidden">
          
          <ModalSidebar 
            types={appState.types} 
            selectedTypeId={selectedTypeId} 
            onSelectType={handleSelectType} 
            disabled={viewMode === 'UPLOAD' || viewMode === 'PICK_INGREDIENT' || viewMode === 'QUICK_SELECT'} 
          />

          <div className="flex-1 flex flex-col min-w-0 bg-white relative">
            
            {viewMode === 'DETAILS' && (
              <TypeLevelControls 
                typeData={activeType}
                onReplaceIngredient={() => setViewMode('PICK_INGREDIENT')}
                onUploadTypeOverride={() => { setUploadMode('TYPE'); setViewMode('UPLOAD'); }}
                onReuseUpload={() => setViewMode('QUICK_SELECT')}
                onRevert={handleRevertType}
              />
            )}

            <div className="flex-1 flex flex-col overflow-hidden bg-white relative custom-scrollbar">
               {viewMode === 'UPLOAD' && (
                 <CustomUploadView 
                   componentLabel={activeType.label}
                   uploadMode={uploadMode}
                   ingredientName={activeIngredient?.name}
                   existingVersions={activeIngredient ? activeIngredient.versions.map(v => v.versionString) : []}
                   onCancel={() => setViewMode('DETAILS')}
                   onUploadComplete={handleUploadComplete}
                 />
               )}
               {viewMode === 'PICK_INGREDIENT' && (
                 <IngredientReplacementWizard 
                   componentLabel={activeType.label}
                   ingredients={appState.ingredients}
                   currentIngredientId={activeType.stagedIngredientId}
                   onCancel={() => setViewMode('DETAILS')}
                   onComplete={handleWizardComplete}
                 />
               )}
               {viewMode === 'QUICK_SELECT' && (
                 <QuickSelectCustomView 
                    customVersions={appState.ingredients.flatMap(ing => ing.versions.filter(v => v.releasedBy === 'User Upload').map(v => ({ ingredient: ing, version: v })))}
                    onSelect={(ing, ver) => { handleWizardComplete(ing, ver); }}
                    onCancel={() => setViewMode('DETAILS')}
                 />
               )}
               {viewMode === 'DETAILS' && (
                 <IngredientLevelView 
                   typeData={activeType}
                   ingredient={activeIngredient}
                   onVersionSelect={handleSelectVersion}
                 />
               )}
            </div>

          </div>
        </div>

        {/* GLOBAL FOOTER */}
        <div className="h-16 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between px-6 shrink-0 relative z-50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${totalModifications > 0 ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  {totalModifications > 0 ? `${totalModifications} Staged Changes` : 'No Staged Changes'}
               </span>
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Environment: Dev-Production</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
                onClick={onClose}
                disabled={viewMode === 'UPLOAD' || viewMode === 'PICK_INGREDIENT' || viewMode === 'QUICK_SELECT'}
                className="px-6 py-2 text-[11px] font-black text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg uppercase tracking-widest transition-all"
            >
              Discard Changes
            </button>
            <button 
              onClick={() => onSave(appState.types)}
              disabled={viewMode === 'UPLOAD' || viewMode === 'PICK_INGREDIENT' || viewMode === 'QUICK_SELECT'}
              className="px-8 py-2 text-[11px] font-black text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-100 uppercase tracking-widest flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Save className="w-3.5 h-3.5" />
              Commit Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
