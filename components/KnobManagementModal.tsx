
import React, { useState, useMemo, useRef } from 'react';
import { KnobMeta, WorkflowStep } from '../types';
import { 
  Search, Plus, Trash2, AlertCircle, FileText, ChevronRight, ChevronLeft, Clipboard, 
  RotateCcw, AlertTriangle, Folder, FolderOpen, List, Network, Check, Upload,
  CheckCircle2, HelpCircle, X, ChevronDown, Filter, Info, Hash, Settings2,
  PanelLeftClose, PanelLeftOpen, Copy, CheckCircle, Database, DatabaseZap,
  FileInput, Save, Zap, ListPlus, ArrowLeft, ArrowRight, Edit2
} from 'lucide-react';

interface TreeNode {
  name: string;
  fullPath: string;
  children: Record<string, TreeNode>;
  knobs: KnobMeta[];
}

interface KnobManagementModalProps {
  overrides: Record<string, string>;
  onUpdateOverrides: (newOverrides: Record<string, string>) => void;
  onClose: () => void;
  onCopyOverrides: (targetStepIds: string[], overridesToCopy: Record<string, string>) => void;
  otherSteps: WorkflowStep[];
  knobMetadata: KnobMeta[];
}

const KnobManagementModal: React.FC<KnobManagementModalProps> = ({ 
  overrides: initialOverrides, 
  onUpdateOverrides, 
  onClose,
  onCopyOverrides,
  otherSteps,
  knobMetadata
}) => {
  const [stagedOverrides, setStagedOverrides] = useState<Record<string, string>>({ ...initialOverrides });
  
  // View State
  const [catalogSearch, setCatalogSearch] = useState('');
  const [overridesSearch, setOverridesSearch] = useState('');
  
  // If no metadata provided, default to Bulk Import view as per user simulation request
  const [sidebarMode, setSidebarMode] = useState<'CATALOG' | 'BULK'>(
    knobMetadata.length === 0 ? 'BULK' : 'CATALOG'
  );
  
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  
  // Bulk Import State
  const [bulkInput, setBulkInput] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'All' | 'Warnings' | 'Diff' | 'User'>('All');

  const knobList = knobMetadata;

  const getStringValue = (knob: KnobMeta | string, rawValue: string) => {
    const meta = typeof knob === 'string' ? knobList.find(k => k.knobName === knob) : knob;
    if (meta) {
      if (meta.type === 'oneof' && meta.options) {
        const opt = meta.options.find(o => o.value.toLowerCase() === (rawValue || '').toLowerCase());
        return opt ? `${opt.text} (${rawValue})` : (rawValue === '' ? 'Empty' : `Invalid: ${rawValue}`);
      }
      if (meta.type === 'checkbox') {
        return rawValue === '0x1' ? 'Enabled' : 'Disabled';
      }
    }
    return rawValue === '' ? 'Empty' : rawValue;
  };

  const filteredKnobs = useMemo(() => {
    if (!catalogSearch) return knobList;
    const lower = catalogSearch.toLowerCase();
    return knobList.filter(k => 
      k.knobName.toLowerCase().includes(lower) || 
      k.categoryPath.toLowerCase().includes(lower) ||
      k.currentValue.toLowerCase().includes(lower)
    );
  }, [catalogSearch, knobList]);

  const knobTree = useMemo(() => {
    if (viewMode === 'list' || catalogSearch || knobList.length === 0) return null;
    const root: TreeNode = { name: 'Root', fullPath: '', children: {}, knobs: [] };
    knobList.forEach(knob => {
      const parts = knob.categoryPath.split('/');
      let current = root;
      let pathSoFar = '';
      parts.forEach((part) => {
        pathSoFar += (pathSoFar ? '/' : '') + part;
        if (!current.children[part]) {
          current.children[part] = { name: part, fullPath: pathSoFar, children: {}, knobs: [] };
        }
        current = current.children[part];
      });
      current.knobs.push(knob);
    });
    return root;
  }, [viewMode, catalogSearch, knobList]);

  const validateKnob = (name: string, value: string) => {
    const meta = knobList.find(k => k.knobName === name);
    if (value === '') return { status: 'WARNING' as const, message: 'Missing value - please define setting', isRedundant: false };
    
    // Flag unknown knobs as warnings
    if (!meta) return { status: 'WARNING' as const, message: 'Unknown parameter: not found in baseline catalog', isRedundant: false };
    
    // Validate oneof values
    if (meta.type === 'oneof' && meta.options) {
      const isValid = meta.options.some(o => o.value.toLowerCase() === value.toLowerCase());
      if (!isValid) {
        return { 
          status: 'WARNING' as const, 
          message: `Invalid selection: "${value}" is not a supported option for this knob.`, 
          isRedundant: value.toLowerCase() === meta.defaultValue.toLowerCase() 
        };
      }
    }

    const isRedundant = value.toLowerCase() === meta.defaultValue.toLowerCase();
    return { status: 'OK' as const, isRedundant };
  };

  // Calculate badge counts for the filter in modal
  const counts = useMemo(() => {
    const keys = Object.keys(stagedOverrides);
    const results = { All: keys.length, Warnings: 0, Diff: 0, User: 0 };
    keys.forEach(key => {
      const v = validateKnob(key, stagedOverrides[key]);
      if (v.status === 'WARNING') results.Warnings++;
      if (!v.isRedundant) results.Diff++;
      if (!knobList.find(k => k.knobName === key)) results.User++;
    });
    return results;
  }, [stagedOverrides, knobList]);

  const handleToggleKnob = (knob: KnobMeta) => {
    const next = { ...stagedOverrides };
    if (next[knob.knobName]) {
      delete next[knob.knobName];
    } else {
      next[knob.knobName] = knob.currentValue;
    }
    setStagedOverrides(next);
  };

  const handleValueChange = (key: string, value: string) => {
    setStagedOverrides(prev => ({ ...prev, [key]: value }));
  };

  const handleRevertToBaseline = (key: string) => {
    const meta = knobList.find(k => k.knobName === key);
    if (meta) {
      setStagedOverrides(prev => ({ ...prev, [key]: meta.defaultValue }));
    }
  };

  const handleApplyBulk = () => {
    setIsBulkProcessing(true);
    setTimeout(() => {
      const segments = bulkInput.split(/[\n,]/);
      const newOverrides: Record<string, string> = { ...stagedOverrides };

      segments.forEach(segment => {
        const trimmed = segment.trim();
        if (!trimmed) return;
        const firstEqualsIndex = trimmed.indexOf('=');
        let key = '';
        let value = '';

        if (firstEqualsIndex !== -1) {
          key = trimmed.substring(0, firstEqualsIndex).trim();
          value = trimmed.substring(firstEqualsIndex + 1).trim();
        } else {
          key = trimmed;
          value = ''; 
        }

        if (key) newOverrides[key] = value;
      });

      setStagedOverrides(newOverrides);
      setBulkInput('');
      setSidebarMode(knobList.length === 0 ? 'BULK' : 'CATALOG');
      setIsBulkProcessing(false);
    }, 300);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setBulkInput(prev => (prev ? prev + '\n' : '') + event.target?.result);
      }
    };
    reader.readAsText(file);
  };

  const renderKnobItem = (knob: KnobMeta) => {
    const isSelected = !!stagedOverrides[knob.knobName];
    return (
      <div 
        key={knob.knobName}
        onClick={() => handleToggleKnob(knob)}
        className={`px-4 py-2 flex items-center gap-3 cursor-pointer transition-all border-b border-gray-50
          ${isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-700'}
        `}
      >
        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all shadow-sm
          ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}
        `}>
          {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
        </div>
        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
          <span className="text-[11px] truncate leading-none font-medium">{knob.knobName}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0
             ${isSelected ? 'bg-blue-100' : 'bg-gray-100 text-gray-400'}
          `}>
            {getStringValue(knob, knob.currentValue)}
          </span>
        </div>
      </div>
    );
  };

  const renderTree = (node: TreeNode) => {
    const isExpanded = expandedPaths.has(node.fullPath);
    return (
      <div key={node.fullPath} className="pl-3 border-l border-gray-100 ml-1">
        {node.name !== 'Root' && (
          <div 
            onClick={() => setExpandedPaths(prev => {
              const next = new Set(prev);
              if (next.has(node.fullPath)) next.delete(node.fullPath); else next.add(node.fullPath);
              return next;
            })}
            className="flex items-center gap-2 py-1.5 cursor-pointer hover:text-blue-600 text-[11px] font-bold select-none"
          >
            {isExpanded ? <FolderOpen className="w-3.5 h-3.5 text-blue-400" /> : <Folder className="w-3.5 h-3.5 text-gray-400" />}
            <span>{node.name}</span>
          </div>
        )}
        {(isExpanded || node.name === 'Root') && (
          <div>
            {node.knobs.map(renderKnobItem)}
            {Object.values(node.children).map(renderTree)}
          </div>
        )}
      </div>
    );
  };

  const filteredOverrideKeys = useMemo(() => {
    let keys = Object.keys(stagedOverrides);
    
    // Apply Status Filter
    if (statusFilter !== 'All') {
      keys = keys.filter(key => {
        const v = validateKnob(key, stagedOverrides[key]);
        if (statusFilter === 'Warnings') return v.status === 'WARNING';
        if (statusFilter === 'Diff') return !v.isRedundant;
        if (statusFilter === 'User') return !knobList.find(k => k.knobName === key);
        return true;
      });
    }

    // Apply Search Filter (Name, Path, Value)
    if (overridesSearch) {
      const lower = overridesSearch.toLowerCase();
      keys = keys.filter(key => {
        const meta = knobList.find(k => k.knobName === key);
        const val = stagedOverrides[key];
        const displayVal = getStringValue(key, val);
        const path = meta?.categoryPath || '';
        
        return (
          key.toLowerCase().includes(lower) || // Search Name
          path.toLowerCase().includes(lower) || // Search Path
          displayVal.toLowerCase().includes(lower) || // Search Display Value
          val.toLowerCase().includes(lower) // Search Raw Value
        );
      });
    }

    return keys;
  }, [stagedOverrides, statusFilter, overridesSearch, knobList]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-8 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-7xl h-full max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-300">
        
        {/* MODAL HEADER */}
        <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-100">
              <Settings2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none">KNOBS MANAGEMENT</h2>
              <div className="flex items-center gap-3 mt-1.5">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">REVIEW BASELINE VALUES AND APPLY OVERRIDES THAT WILL BE USED FOR THIS BUILD STEP</p>
                <div className="w-1 h-1 rounded-full bg-gray-200" />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{Object.keys(stagedOverrides).length} ITEMS STAGED</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-300 hover:text-gray-900 transition-colors"><X className="w-6 h-6" /></button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* SIDEBAR: CATALOG / BULK AREA (Left side) */}
          <div className="w-[32%] border-r border-gray-100 flex flex-col bg-white">
            {sidebarMode === 'CATALOG' ? (
              <div className="flex flex-col h-full overflow-hidden animate-in slide-in-from-left duration-200">
                <div className="p-4 border-b border-gray-50 flex flex-col gap-3 bg-gray-50/30">
                  {/* BULK IMPORT BUTTON AT THE TOP AS PREFERRED */}
                  <button 
                    onClick={() => setSidebarMode('BULK')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all shadow-sm active:scale-[0.98]"
                  >
                    <ListPlus className="w-4 h-4" /> Bulk Import
                  </button>

                  {/* SEARCH CLOSER TO THE LIST AS PREFERRED */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text"
                        placeholder="Search catalog..."
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div className="flex bg-gray-200 p-1 rounded-lg border border-gray-200">
                      <button onClick={() => setViewMode('list')} title="List View" className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}><List className="w-4 h-4" /></button>
                      <button onClick={() => setViewMode('tree')} title="Tree View" className={`p-1.5 rounded-md transition-all ${viewMode === 'tree' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}><Network className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/10">
                  {filteredKnobs.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest mt-10">
                       No baseline knobs detected
                    </div>
                  ) : (
                    (viewMode === 'list' || catalogSearch ? (
                      <div>{filteredKnobs.map(renderKnobItem)}</div>
                    ) : (
                      <div className="py-4">{knobTree && renderTree(knobTree)}</div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* EMBEDDED BULK INPUT UI */
              <div className="flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-200">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    {knobList.length > 0 && (
                      <button 
                        onClick={() => setSidebarMode('CATALOG')}
                        className="p-1 hover:bg-white rounded border border-transparent hover:border-gray-200 text-gray-500 hover:text-blue-600"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    )}
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Bulk Import Utility</span>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[9px] font-black text-blue-600 hover:underline uppercase flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" /> Load File
                    <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.ini,.cfg" onChange={handleFileUpload} />
                  </button>
                </div>
                <div className="flex-1 p-4 flex flex-col gap-4">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-[9px] text-blue-800 leading-relaxed">
                    Paste configuration below. <br/>
                    Format: <span className="font-bold font-mono">Key=Value</span>. <br/>
                    Separators: <span className="font-bold">New Lines</span> or <span className="font-bold">Commas</span>.
                  </div>
                  <textarea 
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    placeholder="MyKnobName=0x1, OtherKnob=0x2&#10;KnobWithNoValue"
                    className="flex-1 w-full p-4 text-[11px] font-mono border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 resize-none shadow-inner"
                  />
                  <div className="flex gap-2">
                    {knobList.length > 0 && (
                      <button 
                        onClick={() => setSidebarMode('CATALOG')}
                        className="flex-1 py-2 text-[10px] font-black text-gray-500 bg-white border border-gray-200 rounded-lg uppercase tracking-widest hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      onClick={handleApplyBulk}
                      disabled={!bulkInput.trim() || isBulkProcessing}
                      className="flex-[2] py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-md shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isBulkProcessing ? 'Processing...' : 'Import'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MAIN PANEL: SELECTION & EDITOR (Right side) */}
          <div className="flex-1 flex flex-col bg-gray-50/30 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-white flex flex-col gap-4 shrink-0">
               {/* STAGED OVERRIDES HEADER */}
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Active Configuration</h3>
                    <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full leading-none">
                      {Object.keys(stagedOverrides).length}
                    </span>
                  </div>
               </div>

               {/* SEARCH + FILTER TOGGLE GROUP */}
               <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-md:max-w-none max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Filter by name, path, or value..."
                      value={overridesSearch}
                      onChange={(e) => setOverridesSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/30 font-medium"
                    />
                    {overridesSearch && (
                      <button 
                        onClick={() => setOverridesSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                    {(['All', 'Warnings', 'Diff', 'User'] as const).map(f => (
                      <button 
                        key={f} 
                        onClick={() => setStatusFilter(f)}
                        title={f === 'Diff' ? 'Overrides compared to baseline' : f}
                        className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2
                          ${statusFilter === f ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}
                        `}
                      >
                        {f.toUpperCase()}
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold
                          ${statusFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}
                        `}>
                          {counts[f]}
                        </span>
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-hidden p-6">
               {Object.keys(stagedOverrides).length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50 m-4 px-12 animate-in fade-in duration-500">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg border border-gray-100 mb-6 opacity-30">
                       <Settings2 className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-900">
                       Empty Configuration
                    </p>
                    <p className="text-[10px] mt-2 text-gray-500 font-medium max-w-[340px] leading-relaxed">
                       {knobList.length === 0 
                         ? "No baseline information is available. Use the bulk import utility on the left to add configuration parameters manually."
                         : "No baseline knobs were detected for this component, or no overrides have been staged yet. Use the sidebar catalog or bulk import to add parameters."
                       }
                    </p>
                 </div>
               ) : (
                 <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                       <table className="w-full text-left text-[11px] border-collapse table-fixed">
                          <thead className="bg-gray-100/50 text-gray-400 text-[9px] uppercase font-black tracking-widest border-b border-gray-200 sticky top-0 z-10 backdrop-blur-md">
                             <tr>
                                <th className="px-4 py-3 w-12 text-center">Status</th>
                                <th className="px-4 py-3 w-[25%] border-r border-gray-50">Knob Name</th>
                                <th className="px-4 py-3 w-[25%] border-r border-gray-50">Category Path</th>
                                <th className="px-6 py-3">Override Value</th>
                                <th className="px-4 py-3 w-20"></th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                             {filteredOverrideKeys.length === 0 ? (
                               <tr>
                                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                    No staged overrides match your current filter criteria.
                                  </td>
                               </tr>
                             ) : (
                               filteredOverrideKeys.map(key => {
                                 const validation = validateKnob(key, stagedOverrides[key]);
                                 const meta = knobList.find(k => k.knobName === key);
                                 const isRedundant = validation.isRedundant;
                                 const currentVal = stagedOverrides[key];

                                 return (
                                   <tr key={key} className={`group transition-colors ${isRedundant ? 'bg-gray-50/50' : 'hover:bg-blue-50/30'}`}>
                                      <td className="px-4 py-3 text-center align-middle">
                                        <div className="group/tip relative inline-block">
                                          {validation.status === 'WARNING' ? (
                                            <AlertTriangle className={`w-4 h-4 ${currentVal === '' ? 'text-red-500 animate-pulse' : 'text-amber-500'}`} />
                                          ) : isRedundant ? (
                                            <Info className="w-4 h-4 text-gray-300" title="Matches Baseline" />
                                          ) : (
                                            <Zap className="w-4 h-4 text-blue-600 fill-blue-50" title="Override Active" />
                                          )}
                                          {validation.message && (
                                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-48 bg-gray-900 text-white text-[9px] p-2 rounded z-30 hidden group-hover/tip:block shadow-xl border border-gray-700 font-bold leading-tight">
                                              {validation.message}
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 border-r border-gray-50 font-bold text-gray-900 truncate align-middle">{key}</td>
                                      <td className="px-4 py-3 border-r border-gray-50 text-gray-400 truncate text-[9px] align-middle" title={meta?.categoryPath}>
                                        {meta?.categoryPath || '---'}
                                      </td>
                                      <td className="px-6 py-3 align-middle">
                                         <div className="relative group/input">
                                           {meta && meta.type === 'oneof' ? (
                                             <select 
                                                value={stagedOverrides[key]}
                                                onChange={e => handleValueChange(key, e.target.value)}
                                                className={`w-full p-2 pr-8 border rounded-lg text-[11px] font-bold focus:ring-1 focus:ring-blue-500 appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:0.8rem] transition-all cursor-pointer
                                                  ${isRedundant ? 'text-gray-400 font-medium border-gray-200 bg-gray-50/50' : 'border-blue-200 bg-blue-50/30 text-blue-900'}
                                                  ${validation.status === 'WARNING' ? 'border-red-400 bg-red-50' : ''}
                                                `}
                                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")' }}
                                             >
                                                {currentVal === '' && <option value="">--- Missing ---</option>}
                                                {meta.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.text}</option>)}
                                                {!meta.options?.some(o => o.value.toLowerCase() === currentVal.toLowerCase()) && (
                                                   <option value={currentVal}>Invalid: {currentVal}</option>
                                                )}
                                             </select>
                                           ) : (
                                             <div className="relative">
                                               <input 
                                                 type="text" 
                                                 value={stagedOverrides[key]} 
                                                 placeholder="Enter value..."
                                                 onChange={e => handleValueChange(key, e.target.value)} 
                                                 className={`w-full p-2 border rounded-lg text-[11px] font-mono transition-all shadow-sm
                                                   ${isRedundant 
                                                     ? 'border-gray-200 bg-gray-50/50 text-gray-400 opacity-70 hover:border-blue-300 hover:bg-white hover:opacity-100' 
                                                     : 'border-blue-200 bg-blue-50/30 text-blue-900 focus:ring-1 focus:ring-blue-500 shadow-sm'}
                                                   ${validation.status === 'WARNING' ? 'border-red-400 bg-red-50 ring-1 ring-red-100' : ''}
                                                 `} 
                                               />
                                               <Edit2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300 opacity-0 group-hover/input:opacity-100 transition-opacity pointer-events-none" />
                                             </div>
                                           )}
                                         </div>
                                      </td>
                                      <td className="px-4 py-3 text-right align-middle">
                                         <div className="flex items-center gap-1">
                                            {meta && !isRedundant && (
                                              <button 
                                                onClick={() => handleRevertToBaseline(key)} 
                                                title="Revert to baseline"
                                                className="text-gray-300 hover:text-blue-500 transition-colors p-1.5 rounded hover:bg-blue-50"
                                              >
                                                <RotateCcw className="w-3.5 h-3.5" />
                                              </button>
                                            )}
                                            <button onClick={() => { const next = {...stagedOverrides}; delete next[key]; setStagedOverrides(next); }} className="text-gray-300 hover:text-red-500 transition-colors p-1.5 rounded hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                                         </div>
                                      </td>
                                   </tr>
                                 );
                               })
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">CHANGES ARE STAGED UNTIL COMMITTED TO THE BUILD STEP</p>
           </div>
           <div className="flex gap-4">
              <button onClick={onClose} className="px-6 py-2.5 text-[10px] font-black text-gray-500 hover:bg-gray-200 rounded-xl uppercase tracking-widest transition-all">DISCARD CHANGES</button>
              <button onClick={() => { onUpdateOverrides(stagedOverrides); onClose(); }} className="px-10 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2">
                <Save className="w-4 h-4" /> SAVE & APPLY
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default KnobManagementModal;
