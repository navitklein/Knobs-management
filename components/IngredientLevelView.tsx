
import React, { useState } from 'react';
import { Ingredient, ComponentTypeData, ComponentStatus, ChangeType, Version } from '../types';
import { 
  Box, Layers, Calendar, 
  Rocket, MapPin, Cpu, BadgeCheck, LayoutTemplate, 
  ArrowUp, History, Info, ChevronRight, Activity, Globe
} from 'lucide-react';

// --- VERSION SELECTOR TABLE ---
interface VersionSelectorProps {
  versions: Version[];
  currentVersionId: string | null;
  onSelect: (versionId: string) => void;
  title?: string;
}

const VersionSelector: React.FC<VersionSelectorProps> = ({ versions, currentVersionId, onSelect, title }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead className="bg-gray-50/80 text-gray-400 text-[9px] uppercase font-black tracking-widest border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 w-10 text-center">Status</th>
              <th className="px-4 py-3">Version Tag</th>
              <th className="px-4 py-3">Release Timestamp</th>
              <th className="px-4 py-3">Author / Agent</th>
              <th className="px-4 py-3 w-20 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {versions.map((ver) => {
              const isSelected = currentVersionId === ver.id;
              return (
                <tr 
                  key={ver.id} 
                  onClick={() => onSelect(ver.id)}
                  className={`group transition-all cursor-pointer ${isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-4 py-3 text-center">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 mx-auto flex items-center justify-center transition-all
                      ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 group-hover:border-blue-400'}
                    `}>
                      {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                    </div>
                  </td>
                  <td className={`px-4 py-3 font-bold font-mono ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                    {ver.versionString}
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-medium">{ver.releaseDate}</td>
                  <td className="px-4 py-3 text-gray-500 flex items-center gap-2">
                     <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-[8px] font-black text-gray-400">
                        {ver.releasedBy.split(' ').map(n => n[0]).join('')}
                     </div>
                     <span className="font-medium">{ver.releasedBy}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isSelected ? (
                       <span className="text-[9px] font-black uppercase text-blue-600 tracking-tighter">Current</span>
                    ) : ver.isNewer && (
                       <span className="bg-green-100 text-green-700 text-[9px] font-black px-1.5 py-0.5 rounded border border-green-200 uppercase tracking-tighter">Newer</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

interface IngredientLevelViewProps {
  typeData: ComponentTypeData;
  ingredient: Ingredient | undefined;
  onVersionSelect: (versionId: string) => void;
}

const IngredientLevelView: React.FC<IngredientLevelViewProps> = ({ 
  typeData, 
  ingredient, 
  onVersionSelect, 
}) => {
  const [isCompact, setIsCompact] = useState(true);
  
  if (typeData.status === ComponentStatus.LOCKED) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full bg-gray-50/50">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mb-6 group transition-all">
          <Lock className="w-12 h-12 text-gray-300 group-hover:text-blue-500 transition-colors" />
        </div>
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Component Governance Locked</h3>
        <p className="text-xs text-gray-500 max-w-sm mt-3 leading-relaxed">
          The <span className="font-bold text-gray-800">{typeData.label}</span> component is managed by system policy and cannot be altered in this environment.
        </p>
      </div>
    );
  }

  if (!ingredient || typeData.status === ComponentStatus.NOT_CONFIGURED) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full bg-gray-50/50">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-6">
          <Box className="w-12 h-12 text-blue-500/30" />
        </div>
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Dependency Missing</h3>
        <p className="text-xs text-gray-500 max-w-sm mt-3 mb-6 leading-relaxed">
          No ingredient is currently mapped to <span className="font-bold text-gray-800">{typeData.label}</span>. 
          Use the replacement wizard or upload a binary to initialize this component.
        </p>
      </div>
    );
  }

  const selectedVersion = ingredient.versions.find(v => v.id === typeData.stagedVersionId);
  const isModified = typeData.changeType !== ChangeType.NONE;

  const getVisualId = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash * 13 % 9000) + 1000;
  };

  const displaySource = isModified ? 'User Selection' : typeData.source;

  return (
    <div className="flex flex-col h-full bg-white">
      
      {/* HEADER: Ingredient Dashboard Card */}
      <div className="p-6 pb-4 shrink-0 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col group transition-all hover:border-blue-300">
             {/* Card Top: Identity */}
             <div className="p-4 flex items-start gap-4 border-b border-gray-50">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-100">
                    <Box className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-sm font-black text-gray-900 truncate uppercase tracking-tight">
                         {ingredient.name}
                      </h2>
                      <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                         <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">ID</span>
                         <span className="text-[10px] font-black text-gray-700 font-mono">#{getVisualId(ingredient.id)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                         <Globe className="w-3 h-3" />
                         <span className="truncate max-w-[120px]">{ingredient.projectFeed.split('/').pop()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                         <Cpu className="w-3 h-3" />
                         <span>{ingredient.siliconFamily}</span>
                      </div>
                   </div>
                </div>

                <div className="text-right">
                   <div className={`px-2 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5
                      ${isModified ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-gray-50 text-gray-500 border-gray-200'}
                   `}>
                      <Activity className={`w-3 h-3 ${isModified ? 'animate-pulse' : ''}`} />
                      {displaySource}
                   </div>
                </div>
             </div>

             {/* Card Bottom: Current Snapshot */}
             <div className="bg-gray-50/50 p-3 flex items-center gap-12 px-6">
                <div>
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Version</p>
                   <div className="flex items-center gap-2">
                      <Rocket className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-black text-gray-900 font-mono">{selectedVersion?.versionString || '---'}</span>
                   </div>
                </div>
                <div className="w-px h-6 bg-gray-200"></div>
                <div>
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Timestamp</p>
                   <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-bold text-gray-600">{selectedVersion?.releaseDate || '--'}</span>
                   </div>
                </div>
                <div className="flex-1"></div>
                <button 
                  onClick={() => setIsCompact(!isCompact)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded border border-transparent hover:border-gray-200 transition-all"
                >
                   <LayoutTemplate className="w-4 h-4" />
                </button>
             </div>
          </div>
      </div>

      {/* BODY: Version Table Selection */}
      <div className="flex-1 overflow-hidden flex flex-col p-6 pt-2">
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-gray-400" />
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Version Repository</h3>
             </div>
             <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{ingredient.versions.length} available</span>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col">
             <VersionSelector 
                versions={ingredient.versions} 
                currentVersionId={typeData.stagedVersionId} 
                onSelect={onVersionSelect}
             />
          </div>
      </div>

      {/* FOOTER INFO */}
      <div className="px-6 py-2 border-t border-gray-100 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-50/50">
          <span className="flex items-center gap-1.5">
             <Info className="w-3 h-3" />
             Selection is staged until Save & Close is confirmed.
          </span>
          <div className="flex items-center gap-4">
             <span className="flex items-center gap-1 text-green-600">
                <BadgeCheck className="w-3 h-3" /> Artifact Verified
             </span>
             <span>Checksum: 8B2F...4A1C</span>
          </div>
      </div>
    </div>
  );
};

export default IngredientLevelView;
