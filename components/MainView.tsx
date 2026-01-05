
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AppState, ComponentStatus, ComponentTypeData, Ingredient, WorkflowStep } from '../types';
import KnobManagerView from './KnobManagerView';
import KnobManagementModal from './KnobManagementModal';
import KnobBulkImportModal from './KnobBulkImportModal';
import { MOCK_KNOB_METADATA, MOCK_BASELINE_OVERRIDES } from '../data';
import { 
  Settings, Play, MoreHorizontal, Filter, ListFilter, 
  Cpu, Zap, Binary, AlertCircle, Info, ChevronRight, CheckCircle2,
  ArrowUp, Box, MapPin, Rocket, Calendar, BadgeCheck,
  Star, Download, ChevronDown, MoreVertical, PlusCircle,
  ArrowRightLeft, Upload, List, RotateCcw, Eye, EyeOff, GripVertical, Pin,
  Settings2, Edit3, ListPlus, Database, DatabaseZap
} from 'lucide-react';

interface MainViewProps {
  appState: AppState;
  onOpenModal: (typeId?: string, viewMode?: 'DETAILS' | 'PICK_INGREDIENT' | 'UPLOAD', uploadMode?: 'TYPE' | 'INGREDIENT') => void;
  onInlineVersionChange: (typeId: string, newVersionId: string) => void;
  onRevertAll: () => void;
  onRevertType: (typeId: string) => void;
  onTogglePin: (typeId: string) => void;
  onReorder: (reorderedTypes: ComponentTypeData[]) => void;
  onUpdateStepOverrides: (stepId: string, overrides: Record<string, string>) => void;
  onCopyOverrides: (targetStepIds: string[], overridesToCopy: Record<string, string>) => void;
}

const ActionDropdown = ({ 
  onAction,
  onRevert,
  onTogglePin,
  isPinned,
  isModified = false,
  vertical = false,
  isConfigured = true
}: { 
  onAction: (viewMode: 'DETAILS' | 'PICK_INGREDIENT' | 'UPLOAD', uploadMode?: 'TYPE' | 'INGREDIENT') => void,
  onRevert?: () => void,
  onTogglePin: () => void,
  isPinned?: boolean,
  isModified?: boolean,
  vertical?: boolean,
  isConfigured?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (viewMode: 'DETAILS' | 'PICK_INGREDIENT' | 'UPLOAD', uploadMode?: 'TYPE' | 'INGREDIENT') => {
    setIsOpen(false);
    onAction(viewMode, uploadMode);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-600"
      >
        {vertical ? <MoreVertical className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-100 z-50 py-1 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
           {isConfigured && (
             <button 
               onClick={(e) => { e.stopPropagation(); handleSelect('DETAILS'); }}
               className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
             >
               <List className="w-4 h-4 text-gray-400" />
               Change Version
             </button>
           )}
           
           <button 
             onClick={(e) => { e.stopPropagation(); handleSelect('PICK_INGREDIENT'); }}
             className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
           >
             {isConfigured ? (
               <>
                 <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                 Replace Ingredient
               </>
             ) : (
               <>
                 <PlusCircle className="w-4 h-4 text-gray-400" />
                 Set Ingredient
               </>
             )}
           </button>
           
           <button 
             onClick={(e) => { e.stopPropagation(); handleSelect('UPLOAD', 'TYPE'); }}
             className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
           >
             <Upload className="w-4 h-4 text-gray-400" />
             {isConfigured ? 'Upload Custom Release' : 'Upload & Set Release'}
           </button>

           <div className="h-px bg-gray-100 my-1"></div>

           <button 
               onClick={(e) => { e.stopPropagation(); setIsOpen(false); onTogglePin(); }}
               className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
             >
               <Pin className={`w-4 h-4 ${isPinned ? 'text-blue-500 fill-blue-500' : 'text-gray-400'}`} />
               {isPinned ? 'Unpin Dependency' : 'Pin Dependency'}
             </button>
           
           {isModified && onRevert && (
              <>
                 <div className="h-px bg-gray-100 my-1"></div>
                 <button 
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); onRevert(); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                 >
                    <RotateCcw className="w-4 h-4 text-red-400" />
                    Revert to Baseline
                 </button>
              </>
           )}
        </div>
      )}
    </div>
  );
};

const MainView: React.FC<MainViewProps> = ({ 
  appState, 
  onOpenModal, 
  onInlineVersionChange, 
  onRevertAll, 
  onRevertType,
  onTogglePin,
  onReorder,
  onUpdateStepOverrides,
  onCopyOverrides
}) => {
  const [activeTab, setActiveTab] = useState('Knobs'); // Default to Knobs to show simulation
  const [showHidden, setShowHidden] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  
  // Dynamic Workflow State
  const [activeStepId, setActiveStepId] = useState('build-0');
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set(['Build']));

  // Simulation State: 
  // 'NORMAL' -> Catalog exists, Overrides empty or user managed
  // 'NO_INFO' -> Catalog is empty (Populated Baseline = true scenario per user request), No data loaded
  const [simulationMode, setSimulationMode] = useState<'NORMAL' | 'NO_INFO'>('NORMAL');

  // Modals State
  const [isKnobModalOpen, setIsKnobModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  const activeStep = appState.steps.find(s => s.id === activeStepId) || appState.steps[0];
  const activeStepOverrides = appState.stepOverrides[activeStepId] || {};

  // Current baseline catalog based on simulation mode
  const currentCatalog = useMemo(() => {
    return simulationMode === 'NORMAL' ? MOCK_KNOB_METADATA : [];
  }, [simulationMode]);

  // Current baseline map for the Summary View (mostly for reference values display)
  const currentBaselineOverrides = useMemo(() => {
    // In NO_INFO mode, we have no baseline to reference
    return simulationMode === 'NORMAL' ? MOCK_BASELINE_OVERRIDES : {};
  }, [simulationMode]);

  // Handle Simulation Toggle
  const toggleSimulation = () => {
    const nextMode = simulationMode === 'NORMAL' ? 'NO_INFO' : 'NORMAL';
    setSimulationMode(nextMode);
    
    // Clear data when switching to NO_INFO per "no data loaded" requirement
    if (nextMode === 'NO_INFO') {
      onUpdateStepOverrides(activeStepId, {});
    }
  };

  const toggleStage = (stage: string) => {
    setExpandedStages(prev => {
      const next = new Set(prev);
      if (next.has(stage)) next.delete(stage); else next.add(stage);
      return next;
    });
  };

  const sortedTypes = useMemo(() => {
    return [...appState.types].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [appState.types]);

  const pinnedTypes = sortedTypes.filter(t => t.isPinned);
  const unpinnedTypes = sortedTypes.filter(t => !t.isPinned);
  const hasModifications = appState.types.some(t => t.source === 'User');

  useEffect(() => {
    if (pinnedTypes.length === 0 && !showHidden) {
      setShowHidden(true);
    }
  }, [pinnedTypes.length]);

  const getIngredient = (id: string | null) => appState.ingredients.find(i => i.id === id);

  const handleDragStart = (e: React.DragEvent, typeId: string) => {
    setDraggedItemId(typeId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetTypeId: string) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetTypeId: string) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetTypeId) return;

    const currentIndex = sortedTypes.findIndex(t => t.id === draggedItemId);
    const targetIndex = sortedTypes.findIndex(t => t.id === targetTypeId);
    
    if (currentIndex === -1 || targetIndex === -1) return;

    const newOrder = [...sortedTypes];
    const [movedItem] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, movedItem);

    const updatedTypes = newOrder.map((t, index) => ({
      ...t,
      order: index
    }));

    onReorder(updatedTypes);
    setDraggedItemId(null);
  };

  const handleBulkImport = (newOverrides: Record<string, string>) => {
    onUpdateStepOverrides(activeStepId, {
      ...activeStepOverrides,
      ...newOverrides
    });
    setIsBulkImportOpen(false);
  };

  const renderDependencyTable = (types: ComponentTypeData[], isKeyTable: boolean) => (
    <div className={`bg-white border rounded-lg overflow-hidden shadow-sm transition-all
       ${isKeyTable ? 'border-blue-100 shadow-md ring-1 ring-blue-50' : 'border-gray-200'}
    `}>
       <table className="w-full text-left text-sm">
          <thead className={`text-xs uppercase font-semibold border-b
             ${isKeyTable ? 'bg-blue-50/50 text-blue-900 border-blue-100' : 'bg-gray-50 text-gray-500 border-gray-200'}
          `}>
             <tr>
                <th className="px-4 py-3 w-10"></th>
                <th className="px-2 py-3 w-10"></th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Ingredient</th>
                <th className="px-6 py-3 font-medium">Project/Feed</th>
                <th className="px-6 py-3 font-medium">Source</th>
                <th className="px-6 py-3 font-medium w-64">Version</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium w-10"></th>
             </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {types.map(type => {
                const ingredient = getIngredient(type.currentIngredientId);
                const isModified = type.source === 'User';
                const selectedVersionIndex = ingredient?.versions.findIndex(v => v.id === type.currentVersionId) ?? -1;
                const newerCount = selectedVersionIndex > 0 ? selectedVersionIndex : 0;
                
                return (
                  <tr 
                    key={type.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, type.id)}
                    onDragOver={(e) => handleDragOver(e, type.id)}
                    onDrop={(e) => handleDrop(e, type.id)}
                    className={`group hover:bg-gray-50 transition-colors ${draggedItemId === type.id ? 'opacity-50 bg-gray-100' : ''}`}
                  >
                     <td className="px-4 py-4 cursor-move text-gray-300 hover:text-gray-500">
                        <GripVertical className="w-4 h-4" />
                     </td>
                     <td className="px-2 py-4 text-center">
                        <button 
                           onClick={() => onTogglePin(type.id)}
                           className="text-gray-300 hover:text-amber-400 transition-colors focus:outline-none"
                           title={type.isPinned ? "Unpin dependency" : "Pin dependency"}
                        >
                           <Star className={`w-4 h-4 ${type.isPinned ? 'text-amber-400 fill-amber-400' : ''}`} />
                        </button>
                     </td>
                     <td className="px-4 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border
                           ${type.isPinned 
                              ? 'bg-blue-100 text-blue-800 border-blue-200' 
                              : 'bg-gray-100 text-gray-600 border-gray-200'}
                        `}>
                           {type.label}
                        </span>
                     </td>
                     <td className="px-6 py-4 font-medium text-gray-900">
                        {ingredient?.name ? (
                           <div 
                            onClick={() => onOpenModal(type.id)}
                            className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600 transition-colors"
                           >
                              {ingredient.name}
                              <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                           </div>
                        ) : (
                            <span className="text-gray-400 italic">Not Configured</span>
                        )}
                     </td>
                     <td className="px-6 py-4 text-gray-500 text-xs">
                        {ingredient?.projectFeed || '-'}
                     </td>
                     <td className="px-6 py-4 text-gray-500 text-xs">
                        <div className="flex items-center gap-1.5">
                           <Box className="w-3 h-3 text-gray-400" />
                           {type.source}
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        {ingredient ? (
                          <div className="flex items-center gap-2">
                             <select 
                                value={type.currentVersionId || ''}
                                onChange={(e) => onInlineVersionChange(type.id, e.target.value)}
                                className="block w-full max-w-[220px] pl-3 pr-8 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md bg-white shadow-sm border hover:border-gray-400 transition-colors cursor-pointer font-medium text-gray-900"
                             >
                                {ingredient.versions.map(v => (
                                   <option key={v.id} value={v.id}>
                                      {v.versionString}
                                   </option>
                                ))}
                             </select>
                             
                             {newerCount > 0 && (
                               <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium bg-green-100 text-green-800 border border-green-200 whitespace-nowrap">
                                  <div className="w-3.5 h-3.5 rounded-full bg-green-500 text-white flex items-center justify-center">
                                      <ArrowUp className="w-2.5 h-2.5" />
                                  </div>
                                  {newerCount} newer
                               </div>
                             )}
                          </div>
                        ) : (
                           <span className="text-gray-400 text-xs">-</span>
                        )}
                     </td>
                     <td className="px-6 py-4">
                        {isModified ? (
                          <span className="text-amber-600 flex items-center gap-1.5 text-xs font-medium">
                             <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                             Modified
                          </span>
                        ) : (
                          <span className="text-gray-500 flex items-center gap-1.5 text-xs">
                             <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                             Unchanged
                          </span>
                        )}
                     </td>
                     <td className="px-6 py-4 text-right text-gray-400">
                        <ActionDropdown 
                          isPinned={type.isPinned}
                          onTogglePin={() => onTogglePin(type.id)}
                          isModified={isModified}
                          isConfigured={type.status === ComponentStatus.CONFIGURED}
                          onRevert={() => onRevertType(type.id)}
                          onAction={(viewMode, uploadMode) => onOpenModal(type.id, viewMode, uploadMode)} 
                        />
                     </td>
                  </tr>
                );
             })}
          </tbody>
       </table>
    </div>
  );

  const stages = ['Build', 'Test', 'Deploy'] as const;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            IFWI Build Run
            <span className="text-gray-400 text-sm font-normal cursor-pointer hover:text-gray-600">✎</span>
          </h1>
        </div>
        
        <div className="px-4 pb-10">
          <div className="mb-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">Workflow Orchestration</h3>
            <div className="space-y-4">
              {stages.map(stage => {
                const stepList = appState.steps.filter(s => s.stage === stage);
                const isExpanded = expandedStages.has(stage);
                return (
                  <div key={stage} className="space-y-1">
                    <button 
                      onClick={() => toggleStage(stage)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-black uppercase tracking-tighter rounded-md transition-all
                        ${isExpanded ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}
                      `}
                    >
                      <span className="flex items-center gap-2">
                        <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        {stage}
                      </span>
                      <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">{stepList.length}</span>
                    </button>
                    
                    {isExpanded && (
                      <div className="pl-6 space-y-1 animate-in slide-in-from-top-1 duration-200">
                        {stepList.map(step => (
                          <div 
                            key={step.id}
                            onClick={() => setActiveStepId(step.id)}
                            className={`flex items-center gap-2 text-sm py-2 px-3 rounded cursor-pointer transition-all border
                              ${activeStepId === step.id 
                                ? 'bg-blue-600 text-white font-bold border-blue-700 shadow-sm' 
                                : 'text-gray-600 hover:bg-gray-50 border-transparent'}
                            `}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${activeStepId === step.id ? 'bg-white' : 'bg-gray-300'}`}></div>
                            {step.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER AREA */}
        <div className="p-8 pb-0 bg-white border-b border-gray-100 shadow-sm relative z-10 shrink-0">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-100">
                    <Rocket className="w-6 h-6 text-white" />
                 </div>
                 <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                        {activeStep.stage} / {activeStep.label}
                      </h2>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border
                        ${activeStep.status === 'Not started' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-green-50 text-green-600 border-green-200'}
                      `}>
                        {activeStep.status}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs font-medium mt-1">
                      Configure parameters for this specific build target. Changes here only affect <span className="text-blue-600 font-bold">{activeStep.label}</span>.
                    </p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
                    <Play className="w-4 h-4 fill-white" /> Run Workflow
                 </button>
              </div>
           </div>

           {/* TABS */}
           <div className="flex gap-8 mt-6">
              {['Target Ingredient', 'Baseline', 'Dependencies', 'Knobs', 'Straps'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-[11px] font-black uppercase tracking-[0.15em] border-b-2 transition-all
                    ${tab === activeTab
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'}
                  `}
                >
                  {tab}
                </button>
              ))}
           </div>
        </div>

        {/* TAB CONTENT: KNOBS SUMMARY */}
        {activeTab === 'Knobs' ? (
           <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
             <div className="p-8 pb-4 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-100">
                    <Settings2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none">Active Knob Overrides</h3>
                    <p className="text-[10px] text-gray-500 font-medium mt-1">Manage and review configuration overrides for this build step.</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-6">
                 {/* SIMULATION TOGGLE */}
                 <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
                    <div className={`p-1.5 rounded-lg transition-all ${simulationMode === 'NORMAL' ? 'bg-blue-50 text-blue-600' : 'text-gray-300'}`}>
                       {simulationMode === 'NORMAL' ? <Database className="w-3.5 h-3.5" /> : <DatabaseZap className="w-3.5 h-3.5 text-amber-500" />}
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black uppercase text-gray-400 leading-none">Scenario</span>
                       <button 
                         onClick={toggleSimulation}
                         className={`text-[10px] font-black uppercase text-left transition-colors ${simulationMode === 'NORMAL' ? 'text-blue-600 hover:text-blue-700' : 'text-amber-600 hover:text-amber-700'}`}
                       >
                         {simulationMode === 'NORMAL' ? 'Normal Catalog' : 'Populated Baseline'}
                       </button>
                    </div>
                    <div 
                      onClick={toggleSimulation}
                      title={simulationMode === 'NORMAL' ? "Switch to No Baseline Info" : "Switch to Normal Baseline Info"}
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-all duration-300 ${simulationMode === 'NORMAL' ? 'bg-gray-200' : 'bg-amber-500'}`}
                    >
                       <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${simulationMode === 'NORMAL' ? 'left-1' : 'left-6'}`} />
                    </div>
                 </div>

                 <div className="h-8 w-px bg-gray-200"></div>

                 <div className="flex gap-2">
                   <button 
                      onClick={() => setIsBulkImportOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-100 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-sm"
                   >
                      <ListPlus className="w-3.5 h-3.5" /> Bulk Import
                   </button>
                   <button 
                      onClick={() => setIsKnobModalOpen(true)}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                   >
                      <Edit3 className="w-3.5 h-3.5" /> Manage Overrides
                   </button>
                 </div>
               </div>
             </div>
             
             <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                <KnobManagerView 
                  overrides={activeStepOverrides}
                  onUpdateOverrides={(newOverrides) => onUpdateStepOverrides(activeStepId, newOverrides)}
                  baselineOverrides={currentBaselineOverrides}
                  knobMetadata={currentCatalog}
                />
             </div>
           </div>
        ) : (
        /* TAB CONTENT: DEPENDENCIES */
        <div className="flex-1 overflow-y-auto p-8 pt-6">
           <div className="flex items-center gap-3 mb-8">
              <button 
                onClick={() => onOpenModal()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-100 transition-all"
              >
                 <Settings className="w-4 h-4" />
                 Manage Dependencies
              </button>

              {hasModifications && (
                 <button 
                    onClick={onRevertAll}
                    className="bg-white border border-red-200 text-red-600 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-red-50 transition-all"
                 >
                    <RotateCcw className="w-4 h-4" />
                    Revert All
                 </button>
              )}
              
              <div className="h-8 w-px bg-gray-200 mx-2"></div>
              
              <button className="bg-white border border-gray-200 text-gray-500 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
                 <Filter className="w-4 h-4" />
                 Filter
              </button>
           </div>

           {pinnedTypes.length > 0 && (
             <div className="mb-10">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                   <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Key Ingredients
                </h3>
                {renderDependencyTable(pinnedTypes, true)}
             </div>
           )}

           <div>
              {pinnedTypes.length > 0 ? (
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px bg-gray-100 flex-1"></div>
                  <button 
                    onClick={() => setShowHidden(!showHidden)}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-all border border-gray-100 shadow-sm"
                  >
                     {showHidden ? (
                       <>
                         <EyeOff className="w-3.5 h-3.5" />
                         Hide Other Items
                       </>
                     ) : (
                       <>
                         <Eye className="w-3.5 h-3.5" />
                         Show All Items
                       </>
                     )}
                  </button>
                  <div className="h-px bg-gray-100 flex-1"></div>
                </div>
              ) : (
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                    <Box className="w-4 h-4" /> Component Catalog
                 </h3>
              )}

              {(showHidden || pinnedTypes.length === 0) && (
                 renderDependencyTable(unpinnedTypes, false)
              )}
           </div>

        </div>
        )}
      </div>

      {/* KNOB MANAGEMENT MODAL */}
      {isKnobModalOpen && (
        <KnobManagementModal 
          overrides={activeStepOverrides}
          onUpdateOverrides={(newOverrides) => onUpdateStepOverrides(activeStepId, newOverrides)}
          onClose={() => setIsKnobModalOpen(false)}
          onCopyOverrides={(targetIds, overridesToCopy) => onCopyOverrides(targetIds, overridesToCopy)}
          otherSteps={appState.steps.filter(s => s.id !== activeStepId)}
          knobMetadata={currentCatalog}
        />
      )}

      {/* BULK IMPORT MODAL */}
      {isBulkImportOpen && (
        <KnobBulkImportModal 
          onImport={handleBulkImport}
          onCancel={() => setIsBulkImportOpen(false)}
          knobMetadata={currentCatalog}
        />
      )}
    </div>
  );
};

export default MainView;
