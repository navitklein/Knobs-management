
import React from 'react';
import { Version } from '../types';
import { Box } from 'lucide-react';

// --- VERSION SELECTOR TABLE ---
// Kept for re-use within IngredientLevelView

interface VersionSelectorProps {
  versions: Version[];
  currentVersionId: string | null;
  onSelect: (versionId: string) => void;
  title?: string;
}

export const VersionSelector: React.FC<VersionSelectorProps> = ({ versions, currentVersionId, onSelect, title }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {title && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <div className="bg-gray-200 p-1 rounded-full">
            <Box className="w-3 h-3 text-gray-600" />
          </div>
          <span className="font-semibold text-gray-700 text-sm">{title}</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-3 border-b w-12"></th>
              <th className="px-6 py-3 border-b">Version String</th>
              <th className="px-6 py-3 border-b">Release Date</th>
              <th className="px-6 py-3 border-b">Released By</th>
              <th className="px-6 py-3 border-b text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {versions.map((ver) => {
              const isSelected = currentVersionId === ver.id;
              return (
                <tr 
                  key={ver.id} 
                  onClick={() => onSelect(ver.id)}
                  className={`group transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/60' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-6 py-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center
                      ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 group-hover:border-blue-400'}
                    `}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </td>
                  <td className={`px-6 py-3 font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                    {ver.versionString}
                  </td>
                  <td className="px-6 py-3 text-gray-500">{ver.releaseDate}</td>
                  <td className="px-6 py-3 text-gray-500">{ver.releasedBy}</td>
                  <td className="px-6 py-3 text-right">
                    {isSelected && (
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                         Selected
                       </span>
                    )}
                    {!isSelected && ver.isNewer && (
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                         Newer
                       </span>
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
