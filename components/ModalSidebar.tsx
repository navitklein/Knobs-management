
import React, { useMemo } from 'react';
import { ComponentTypeData, ComponentStatus, ChangeType } from '../types';
import { Search, Lock, AlertCircle, CheckCircle2, FileUp, Info, Activity } from 'lucide-react';

interface ModalSidebarProps {
  types: ComponentTypeData[];
  selectedTypeId: string;
  onSelectType: (id: string) => void;
  disabled?: boolean;
}

const ModalSidebar: React.FC<ModalSidebarProps> = ({ types, selectedTypeId, onSelectType, disabled = false }) => {
  
  const stats = useMemo(() => {
    return {
      modified: types.filter(t => t.changeType !== ChangeType.NONE).length,
      total: types.length,
      locked: types.filter(t => t.status === ComponentStatus.LOCKED).length
    };
  }, [types]);

  const renderCategory = (category: string, title: string) => {
    const categoryTypes = types.filter(t => t.category === category);
    if (categoryTypes.length === 0) return null;

    return (
      <div className="mb-4">
        <h3 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">
          {title}
        </h3>
        <ul className="space-y-0.5">
          {categoryTypes.map(type => {
            const isSelected = type.id === selectedTypeId;
            const isModified = type.changeType !== ChangeType.NONE;
            const isLocked = type.status === ComponentStatus.LOCKED;
            
            return (
              <li key={type.id}>
                <button
                  onClick={() => !disabled && onSelectType(type.id)}
                  disabled={disabled}
                  className={`w-full flex items-center justify-between px-4 py-2 text-[11px] transition-all relative
                    ${isSelected ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-100 z-10' : 'text-gray-700 hover:bg-gray-100'}
                    ${disabled ? 'cursor-not-allowed opacity-40 hover:bg-transparent' : ''}
                  `}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate">{type.label}</span>
                    {isLocked && (
                      <Lock className={`w-3 h-3 ${isSelected ? 'text-blue-200' : 'text-gray-300'}`} />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {isModified && (
                      <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-500'} animate-pulse`} />
                    )}
                    {isSelected ? (
                       <CheckCircle2 className="w-3.5 h-3.5 text-blue-200" />
                    ) : (
                       type.status === ComponentStatus.CONFIGURED ? (
                         <span className="text-[9px] font-bold text-gray-400 opacity-60">
                           {type.source === 'User' ? 'Custom' : 'v' + type.currentVersionId?.split('-').pop()}
                         </span>
                       ) : !isLocked && (
                         <span className="text-[9px] text-gray-400 italic font-medium">Unset</span>
                       )
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className={`w-64 bg-white border-r border-gray-200 flex flex-col h-full ${disabled ? 'bg-gray-50' : ''}`}>
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search catalog..." 
            disabled={disabled}
            className="w-full pl-8 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50/50 disabled:bg-transparent"
          />
        </div>
      </div>
      
      <div className={`flex-1 overflow-y-auto py-4 custom-scrollbar`}>
        {renderCategory('KEY_INGREDIENTS', 'Key Ingredients')}
        {renderCategory('STANDARD', 'Standard Items')}
        {renderCategory('LOCKED', 'Locked / Policy')}
      </div>

      <div className="p-4 bg-gray-50/80 border-t border-gray-100 shrink-0">
          <div className="flex flex-col gap-2">
             <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Modified Items</span>
                <span className={`text-[10px] font-black ${stats.modified > 0 ? 'text-blue-600' : 'text-gray-400'}`}>{stats.modified}</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Locked Policy</span>
                <span className="text-[10px] font-black text-gray-400">{stats.locked}</span>
             </div>
             <div className="w-full bg-gray-200 h-1 rounded-full mt-1 overflow-hidden">
                <div 
                   className="bg-blue-600 h-full transition-all duration-500" 
                   style={{ width: `${(stats.modified / stats.total) * 100}%` }}
                />
             </div>
          </div>
      </div>
    </div>
  );
};

export default ModalSidebar;
