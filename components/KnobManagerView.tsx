
import React, { useMemo, useState } from 'react';
import { KnobMeta } from '../types';
import { 
  AlertTriangle, Trash2, Hash, Info, CheckCircle2, Settings2, RotateCcw, Search, X, Zap, Edit2
} from 'lucide-react';

interface KnobSummaryViewProps {
  overrides: Record<string, string>;
  onUpdateOverrides: (newOverrides: Record<string, string>) => void;
  baselineOverrides?: Record<string, string>;
  searchTerm?: string;
  knobMetadata: KnobMeta[];
}

const KnobManagerView: React.FC<KnobSummaryViewProps> = ({ 
  overrides, 
  onUpdateOverrides,
  baselineOverrides = {},
  searchTerm: externalSearchTerm = '',
  knobMetadata
}) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Warnings' | 'Diff' | 'User'>('All');
  
  const searchTerm = externalSearchTerm || internalSearchTerm;
  const rawOverrideKeys = Object.keys(overrides);
  const knobList = knobMetadata;

  const getBaselineValue = (key: string) => {
    if (baselineOverrides && baselineOverrides[key] !== undefined) {
      return baselineOverrides[key];
    }
    const meta = knobList.find(k => k.knobName === key);
    return meta ? meta.defaultValue : '';
  };

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

  const validateKnob = (name: string, value: string) => {
    const meta = knobList.find(k => k.knobName === name);
    const baselineVal = getBaselineValue(name);
    const isRedundant = value !== '' && value.toLowerCase() === baselineVal.toLowerCase();
    
    if (value === '') {
      return { status: 'WARNING' as const, message: 'Missing value - please define setting', isRedundant: false };
    }

    // Flag unknown knobs as Warnings instead of just User Defined
    if (!meta) return { status: 'WARNING' as const, message: 'Unknown parameter: not found in baseline catalog', isRedundant };

    // Validate oneof values
    if (meta.type === 'oneof' && meta.options) {
      const isValid = meta.options.some(o => o.value.toLowerCase() === value.toLowerCase());
      if (!isValid) {
        return { 
          status: 'WARNING' as const, 
          message: `Invalid selection: "${value}" is not a supported option for this knob.`, 
          isRedundant 
        };
      }
    }

    if (meta.type === 'numeric') {
      const intVal = parseInt(value, 16);
      if (isNaN(intVal)) return { status: 'WARNING' as const, message: 'Value must be numeric', isRedundant };
      if (meta.min && intVal < parseInt(meta.min, 16)) return { status: 'WARNING' as const, message: `Below min (${meta.min})`, isRedundant };
      if (meta.max && intVal > parseInt(meta.max, 16)) return { status: 'WARNING' as const, message: `Above max (${meta.max})`, isRedundant };
    }
    
    return { 
      status: 'OK' as const, 
      isRedundant,
      message: isRedundant ? 'Value matches baseline (no active override)' : undefined
    };
  };

  // Calculate badge counts for the filter
  const counts = useMemo(() => {
    const results = { All: rawOverrideKeys.length, Warnings: 0, Diff: 0, User: 0 };
    rawOverrideKeys.forEach(key => {
      const v = validateKnob(key, overrides[key]);
      if (v.status === 'WARNING') results.Warnings++;
      if (!v.isRedundant) results.Diff++;
      // We still keep the 'User' category for filtering unknown items, even if they are warnings
      if (!knobList.find(k => k.knobName === key)) results.User++;
    });
    return results;
  }, [rawOverrideKeys, overrides, baselineOverrides, knobList]);

  const filteredKeys = useMemo(() => {
    let keys = rawOverrideKeys;

    // Apply Status Filter
    if (statusFilter !== 'All') {
      keys = keys.filter(key => {
        const v = validateKnob(key, overrides[key]);
        if (statusFilter === 'Warnings') return v.status === 'WARNING';
        if (statusFilter === 'Diff') return !v.isRedundant;
        if (statusFilter === 'User') return !knobList.find(k => k.knobName === key);
        return true;
      });
    }

    // Apply Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      keys = keys.filter(key => {
        const meta = knobList.find(k => k.knobName === key);
        const displayVal = getStringValue(key, overrides[key]);
        const path = meta?.categoryPath || '';
        
        return (
          key.toLowerCase().includes(lower) ||
          path.toLowerCase().includes(lower) ||
          displayVal.toLowerCase().includes(lower)
        );
      });
    }

    return keys;
  }, [rawOverrideKeys, statusFilter, searchTerm, overrides, knobList]);

  const handleRemoveOverride = (key: string) => {
    const next = { ...overrides };
    delete next[key];
    onUpdateOverrides(next);
  };

  const handleRevertToBaseline = (key: string) => {
    const baselineVal = getBaselineValue(key);
    onUpdateOverrides({ ...overrides, [key]: baselineVal });
  };

  const handleValueChange = (key: string, value: string) => {
    onUpdateOverrides({ ...overrides, [key]: value });
  };

  if (rawOverrideKeys.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-white/50 min-h-[400px] text-center px-8">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md border border-gray-100 mb-6 opacity-50 relative">
          <Settings2 className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-sm font-black uppercase tracking-[0.15em] text-gray-900">NO OVERRIDES ADDED</p>
        <p className="text-[11px] mt-2 text-gray-500 font-medium max-w-[280px] leading-relaxed">
          The baseline configuration for this step has no overrides defined.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      {/* FILTER BAR */}
      <div className="flex items-center justify-between gap-4">
        {/* SEARCH INPUT */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Filter by name, path, or value..."
            value={searchTerm}
            onChange={(e) => setInternalSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white shadow-sm transition-all font-medium"
          />
          {searchTerm && (
            <button 
              onClick={() => {setInternalSearchTerm('');}}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* STATUS FILTER BUTTON GROUP */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
          {(['All', 'Warnings', 'Diff', 'User'] as const).map(f => (
            <button 
              key={f} 
              onClick={() => setStatusFilter(f)}
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

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <table className="w-full text-left text-[11px] border-collapse table-fixed">
          <thead className="bg-gray-50 text-gray-500 text-[9px] uppercase font-black tracking-widest border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 w-20">STATUS</th>
              <th className="px-4 py-4 w-[18%]">KNOB NAME</th>
              <th className="px-4 py-4 w-[28%]">CATEGORY PATH</th>
              <th className="px-4 py-4 w-[25%]">EFFECTIVE VALUE</th>
              <th className="px-4 py-4">BASELINE REFERENCE</th>
              <th className="px-4 py-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredKeys.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic font-medium">
                  No matching items found for the selected filter.
                </td>
              </tr>
            ) : (
              filteredKeys.map((key) => {
                const validation = validateKnob(key, overrides[key]);
                const meta = knobList.find(k => k.knobName === key);
                const isRedundant = validation.isRedundant;
                const currentVal = overrides[key];
                const baselineVal = getBaselineValue(key);

                return (
                  <tr key={key} className={`group transition-colors ${isRedundant ? 'bg-gray-50/50' : 'hover:bg-blue-50/20'}`}>
                    <td className="px-6 py-4 text-center align-middle">
                      <div className="group/tip relative inline-block">
                        {validation.status === 'WARNING' ? (
                          <AlertTriangle className={`w-4 h-4 ${currentVal === '' ? 'text-red-500 animate-pulse' : 'text-amber-500'}`} />
                        ) : isRedundant ? (
                          <Info className="w-4 h-4 text-gray-300" />
                        ) : validation.status === 'OK' ? (
                          <Zap className="w-4 h-4 text-blue-600 fill-blue-50" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200" />
                        )}
                        {validation.message && (
                          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-48 bg-gray-900 text-white text-[9px] p-2 rounded z-30 hidden group-hover/tip:block shadow-xl border border-gray-700 font-bold leading-tight">
                            {validation.message}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <div className="font-bold text-gray-900 truncate" title={key}>{key}</div>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      {meta ? (
                        <div className="text-[9px] text-gray-300 truncate font-medium" title={meta.categoryPath}>{meta.categoryPath}</div>
                      ) : (
                        <div className="text-[9px] text-blue-400 font-bold uppercase tracking-tighter">User Defined</div>
                      )}
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <div className="relative group/input">
                        {meta && meta.type === 'oneof' && meta.options ? (
                          <select 
                            value={currentVal} 
                            onChange={(e) => handleValueChange(key, e.target.value)}
                            className={`w-full text-[11px] px-3 py-1.5 border rounded-lg font-bold appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:0.8rem] transition-all cursor-pointer shadow-sm
                              ${isRedundant ? 'text-gray-400 font-medium border-gray-200 bg-gray-50/50' : 'border-blue-200 bg-blue-50/30 text-blue-900'}
                              ${validation.status === 'WARNING' ? 'border-red-400 bg-red-50' : ''}
                            `}
                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")' }}
                          >
                            {currentVal === '' && <option value="">--- Missing ---</option>}
                            {meta.options.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.text} ({opt.value})</option>
                            ))}
                            {!meta.options.some(o => o.value.toLowerCase() === currentVal.toLowerCase()) && (
                                <option value={currentVal}>Invalid: {currentVal}</option>
                            )}
                          </select>
                        ) : (
                          <div className="relative">
                            <input 
                              type="text" 
                              value={currentVal}
                              onChange={(e) => handleValueChange(key, e.target.value)}
                              placeholder="Enter value..."
                              className={`w-full text-[11px] px-3 py-1.5 border rounded-lg font-mono transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm
                                ${isRedundant 
                                  ? 'border-gray-200 bg-gray-50/50 text-gray-400 opacity-70 hover:border-blue-300 hover:bg-white hover:opacity-100' 
                                  : 'border-blue-200 bg-blue-50/30 text-blue-900 focus:ring-1 focus:ring-blue-500 shadow-sm'}
                                ${validation.status === 'WARNING' ? 'border-red-400 bg-red-50' : ''}
                              `}
                            />
                            <Edit2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300 opacity-0 group-hover/input:opacity-100 transition-opacity pointer-events-none" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <div className="text-[10px] font-bold text-blue-600 bg-gray-50 px-4 py-1.5 rounded-sm border border-gray-100/50 inline-block min-w-[120px]">
                        {getStringValue(key, baselineVal)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right align-middle">
                      <div className="flex items-center gap-1">
                        {!isRedundant && (
                          <button 
                            onClick={() => handleRevertToBaseline(key)} 
                            title="Revert to baseline"
                            className="text-gray-300 hover:text-blue-500 transition-colors p-1.5 hover:bg-blue-50 rounded"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleRemoveOverride(key)} 
                          className="text-gray-300 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4 opacity-40 hover:opacity-100" />
                        </button>
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
  );
};

export default KnobManagerView;
