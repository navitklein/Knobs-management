
import React, { useState } from 'react';
import { Ingredient, Version } from '../types';
import { History, Rocket, Calendar, CheckCircle2, Search, FileCode } from 'lucide-react';

interface QuickSelectCustomViewProps {
  customVersions: Array<{ ingredient: Ingredient; version: Version }>;
  onSelect: (ingredient: Ingredient, version: Version) => void;
  onCancel: () => void;
}

export default function QuickSelectCustomView({ customVersions, onSelect, onCancel }: QuickSelectCustomViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<{ ingredient: Ingredient; version: Version } | null>(null);
  const [simulateEmpty, setSimulateEmpty] = useState(false);

  const hasItems = customVersions.length > 0 && !simulateEmpty;

  const filteredItems = hasItems ? customVersions.filter(item => 
    item.ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.version.versionString.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.version.description && item.version.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  const handleApply = () => {
    if (selectedItem) {
      onSelect(selectedItem.ingredient, selectedItem.version);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
      
      {/* Scrollable Body */}
      <div className="flex-1 flex flex-col p-8 overflow-hidden">
        
        {/* Main Context Header */}
        <div className="mb-6 flex items-start justify-between">
           <div>
             <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
               <History className="w-7 h-7 text-purple-600" />
               Reuse Custom Release
             </h2>
             <p className="text-gray-500 text-sm mt-1">
               Quickly select a custom release package uploaded in previous workflow steps.
             </p>
           </div>
           
           {/* Simulation Toggle */}
           <label className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors select-none">
              <input 
                type="checkbox" 
                checked={simulateEmpty} 
                onChange={(e) => setSimulateEmpty(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500" 
              />
              Simulate Empty State
           </label>
        </div>

        {/* Filter */}
        <div className="mb-4 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by ingredient, version or description..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!hasItems}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        {/* List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex-1 overflow-y-auto">
          {filteredItems.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 font-medium w-16 text-center"></th>
                  <th className="px-6 py-3 font-medium">Ingredient</th>
                  <th className="px-6 py-3 font-medium">Version</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium w-1/3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => {
                  const isSelected = selectedItem?.version.id === item.version.id;
                  return (
                    <tr 
                      key={`${item.ingredient.id}-${item.version.id}`}
                      onClick={() => setSelectedItem(item)}
                      className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/60' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 text-center">
                        <div className={`w-4 h-4 rounded-full border mx-auto flex items-center justify-center
                          ${isSelected ? 'border-blue-600' : 'border-gray-300'}
                        `}>
                          {isSelected && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.ingredient.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.ingredient.projectFeed}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-bold text-gray-800 font-mono">
                           <FileCode className="w-3.5 h-3.5 text-gray-400" />
                           {item.version.versionString}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                         <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {item.version.releaseDate}
                         </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 italic truncate max-w-xs">
                         {item.version.description || <span className="text-gray-300">No description</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center animate-in fade-in duration-300">
               <div className="bg-gray-100 p-4 rounded-full mb-4">
                  <History className="w-8 h-8 text-gray-400" />
               </div>
               <h3 className="text-lg font-bold text-gray-800 mb-1">No custom releases found</h3>
               <p className="text-sm max-w-sm">
                 There are no custom release packages uploaded in previous workflow steps to reuse.
               </p>
               <button 
                  onClick={onCancel}
                  className="mt-6 text-blue-600 font-medium hover:underline text-sm"
               >
                 Go back to upload a new package
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
        <button 
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={handleApply}
          disabled={!selectedItem}
          className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Apply Selected
        </button>
      </div>
    </div>
  );
}