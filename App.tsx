
import React, { useState } from 'react';
import DependencyManagerModal from './components/DependencyManagerModal';
import MainView from './components/MainView';
import { MOCK_INGREDIENTS, INITIAL_TYPES, MOCK_STEPS } from './data';
import { AppState, ChangeType, ComponentTypeData, ComponentStatus } from './types';

interface ModalConfig {
  isOpen: boolean;
  typeId?: string;
  viewMode?: 'DETAILS' | 'PICK_INGREDIENT' | 'UPLOAD';
  uploadMode?: 'TYPE' | 'INGREDIENT';
}

export default function App() {
  // --- STATE ---
  const [appState, setAppState] = useState<AppState>({
    types: INITIAL_TYPES,
    ingredients: MOCK_INGREDIENTS,
    steps: MOCK_STEPS,
    stepOverrides: {} // Records overrides per step
  });
  
  const [modalConfig, setModalConfig] = useState<ModalConfig>({ isOpen: false });

  // --- HANDLERS ---

  const handleOpenModal = (
    typeId: string = 'type-ec',
    viewMode: 'DETAILS' | 'PICK_INGREDIENT' | 'UPLOAD' = 'DETAILS',
    uploadMode: 'TYPE' | 'INGREDIENT' = 'TYPE'
  ) => {
    setAppState(prev => ({
      ...prev,
      types: prev.types.map(t => ({
        ...t,
        stagedIngredientId: t.currentIngredientId,
        stagedVersionId: t.currentVersionId,
        changeType: ChangeType.NONE,
        originalIngredientId: t.currentIngredientId,
        originalVersionId: t.currentVersionId
      }))
    }));
    setModalConfig({
      isOpen: true,
      typeId,
      viewMode,
      uploadMode
    });
  };

  const handleCloseModal = () => {
    setModalConfig({ isOpen: false });
  };

  const handleSaveModal = (updatedTypes: ComponentTypeData[]) => {
    const committedTypes = updatedTypes.map(t => {
       if (t.changeType !== ChangeType.NONE) {
          return {
             ...t,
             currentIngredientId: t.stagedIngredientId,
             currentVersionId: t.stagedVersionId,
             source: 'User' as const,
             changeType: ChangeType.NONE
          };
       }
       return t;
    });

    setAppState(prev => ({
      ...prev,
      types: committedTypes
    }));
    setModalConfig({ false: false } as any); // Bug in previous version fixed here
    setModalConfig({ isOpen: false });
  };

  const handleInlineVersionChange = (typeId: string, newVersionId: string) => {
     setAppState(prev => ({
        ...prev,
        types: prev.types.map(t => {
           if (t.id === typeId) {
              return {
                 ...t,
                 currentVersionId: newVersionId,
                 stagedVersionId: newVersionId, 
                 originalVersionId: newVersionId,
                 source: 'User' as const
              };
           }
           return t;
        })
     }));
  };

  const handleRevertAll = () => {
    setAppState(prev => ({
      ...prev,
      types: prev.types.map(t => ({
        ...t,
        currentIngredientId: t.originalIngredientId,
        currentVersionId: t.originalVersionId,
        stagedIngredientId: t.originalIngredientId,
        stagedVersionId: t.originalVersionId,
        changeType: ChangeType.NONE,
        source: 'Baseline' as const,
        status: t.originalIngredientId ? ComponentStatus.CONFIGURED : ComponentStatus.NOT_CONFIGURED
      }))
    }));
  };

  const handleRevertType = (typeId: string) => {
    setAppState(prev => ({
      ...prev,
      types: prev.types.map(t => {
        if (t.id === typeId) {
          return {
            ...t,
            currentIngredientId: t.originalIngredientId,
            currentVersionId: t.originalVersionId,
            stagedIngredientId: t.originalIngredientId,
            stagedVersionId: t.originalVersionId,
            changeType: ChangeType.NONE,
            source: 'Baseline' as const,
            status: t.originalIngredientId ? ComponentStatus.CONFIGURED : ComponentStatus.NOT_CONFIGURED
          };
        }
        return t;
      })
    }));
  };

  const handleTogglePin = (typeId: string) => {
    setAppState(prev => ({
      ...prev,
      types: prev.types.map(t => 
        t.id === typeId ? { ...t, isPinned: !t.isPinned } : t
      )
    }));
  };

  const handleReorder = (reorderedTypes: ComponentTypeData[]) => {
    setAppState(prev => ({
      ...prev,
      types: reorderedTypes
    }));
  };

  // Knob Overrides Logic
  const handleUpdateStepOverrides = (stepId: string, overrides: Record<string, string>) => {
    setAppState(prev => ({
      ...prev,
      stepOverrides: {
        ...prev.stepOverrides,
        [stepId]: overrides
      }
    }));
  };

  const handleCopyOverrides = (targetStepIds: string[], overridesToCopy: Record<string, string>) => {
    setAppState(prev => {
      const newStepOverrides = { ...prev.stepOverrides };
      targetStepIds.forEach(id => {
        // Merge selective overrides into target step
        newStepOverrides[id] = { 
          ...(prev.stepOverrides[id] || {}), 
          ...overridesToCopy 
        };
      });
      return { ...prev, stepOverrides: newStepOverrides };
    });
  };

  return (
    <>
      <MainView 
        appState={appState} 
        onOpenModal={handleOpenModal} 
        onInlineVersionChange={handleInlineVersionChange}
        onRevertAll={handleRevertAll}
        onRevertType={handleRevertType}
        onTogglePin={handleTogglePin}
        onReorder={handleReorder}
        onUpdateStepOverrides={handleUpdateStepOverrides}
        onCopyOverrides={handleCopyOverrides}
      />
      
      {modalConfig.isOpen && (
        <DependencyManagerModal 
           appState={appState}
           setAppState={setAppState} 
           onClose={handleCloseModal}
           onSave={handleSaveModal}
           initialTypeId={modalConfig.typeId}
           initialViewMode={modalConfig.viewMode}
           initialUploadMode={modalConfig.uploadMode}
        />
      )}
    </>
  );
}
