import React, { useState, useMemo } from 'react';
import { Ingredient, Version } from '../types';
import { Search, ChevronDown, Check, ArrowLeft, Box, X } from 'lucide-react';

interface IngredientReplacementWizardProps {
  componentLabel: string;
  ingredients: Ingredient[];
  currentIngredientId: string | null;
  onCancel: () => void;
  onComplete: (ingredient: Ingredient, version: Version) => void;
}

type WizardStep = 'SELECT_INGREDIENT' | 'SELECT_VERSION';

export default function IngredientReplacementWizard({
  componentLabel,
  ingredients,
  currentIngredientId,
  onCancel,
  onComplete
}: IngredientReplacementWizardProps) {
  
  // --- STATE ---
  const [step, setStep] = useState<WizardStep>('SELECT_INGREDIENT');
  
  // Selection State
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(
    ingredients.find(i => i.id === currentIngredientId) || null
  );
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'PROJECT'>('ALL');

  // --- HELPERS ---

  // Generate a consistent 4-digit ID for display
  const getVisualId = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash * 13 % 9000) + 1000;
  };

  const filteredIngredients = useMemo(() => {
    return ingredients.filter(ing => {
      const matchesSearch = ing.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSource = sourceFilter === 'ALL' || ing.projectFeed.includes('Default'); // Mock logic for 'My Project'
      return matchesSearch && matchesSource;
    });
  }, [ingredients, searchTerm, sourceFilter]);

  const filteredVersions = useMemo(() => {
    if (!selectedIngredient) return [];
    return selectedIngredient.versions.filter(v => 
      v.versionString.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedIngredient, searchTerm]);


  // --- HANDLERS ---

  const handleNext = () => {
    if (step === 'SELECT_INGREDIENT' && selectedIngredient) {
      setStep('SELECT_VERSION');
      setSearchTerm(''); // Reset search for next step
    } else if (step === 'SELECT_VERSION' && selectedVersion && selectedIngredient) {
      onComplete(selectedIngredient, selectedVersion);
    }
  };

  const handleBack = () => {
    setStep('SELECT_INGREDIENT');
    setSelectedVersion(null);
    setSearchTerm('');
  };

  // --- RENDERERS ---

  const renderHeader = () => (
    <div className="flex gap-4 mb-6">
      <div 
        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors
          ${step === 'SELECT_INGREDIENT' 
            ? 'bg-blue-50 border-blue-200 text-blue-700' 
            : 'bg-white border-gray-200 text-green-600'}
        `}
      >
        {step === 'SELECT_VERSION' ? <Check className="w-4 h-4" /> : <Box className="w-4 h-4" />}
        Select Ingredient
      </div>
      
      <div 
        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors
          ${step === 'SELECT_VERSION' 
            ? 'bg-blue-50 border-blue-200 text-blue-700' 
            : 'bg-white border-gray-200 text-gray-400'}
        `}
      >
        <span className="font-mono text-xs border border-current rounded px-1">2</span>
        Select Version
      </div>
    </div>
  );

  const renderIngredientStep = () => (
    <div className="flex flex-col h-full">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3">
          <div className="relative">
             <select 
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as any)}
                className="appearance-none pl-3 pr-8 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
             >
                <option value="ALL">All Projects</option>
                <option value="PROJECT">My Project Only</option>
             </select>
             <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by ingredient name" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex-1 overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-200 sticky top-0">
            <tr>
              <th className="px-6 py-3 font-medium w-16 text-center"></th>
              <th className="px-6 py-3 font-medium">ID</th>
              <th className="px-6 py-3 font-medium">Ingredient</th>
              <th className="px-6 py-3 font-medium">Project/Feed</th>
              <th className="px-6 py-3 font-medium">Silicon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredIngredients.map(ing => {
              const isSelected = selectedIngredient?.id === ing.id;
              return (
                <tr 
                  key={ing.id} 
                  onClick={() => setSelectedIngredient(ing)}
                  className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/60' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-6 py-4 text-center">
                    <div className={`w-4 h-4 rounded-full border mx-auto flex items-center justify-center
                      ${isSelected ? 'border-blue-600' : 'border-gray-300'}
                    `}>
                      {isSelected && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                    {getVisualId(ing.id)}
                  </td>
                  <td className={`px-6 py-4 font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                    {ing.name}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{ing.projectFeed}</td>
                  <td className="px-6 py-4 text-gray-500">{ing.siliconFamily}</td>
                </tr>
              );
            })}
            {filteredIngredients.length === 0 && (
               <tr>
                 <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                   No ingredients found matching your filter.
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderVersionStep = () => (
    <div className="flex flex-col h-full">
      {/* CONTEXT HEADER */}
      <div className="mb-4 flex items-center justify-between">
         <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 text-sm max-w-xl">
            <Box className="w-4 h-4 shrink-0" />
            <span className="font-semibold truncate">{selectedIngredient?.name}</span>
            <button onClick={handleBack} className="ml-2 p-0.5 hover:bg-blue-200 rounded-full transition-colors">
               <X className="w-3 h-3" />
            </button>
         </div>

         <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by version name" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
         </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex-1 overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-200 sticky top-0">
            <tr>
              <th className="px-6 py-3 font-medium w-16 text-center"></th>
              <th className="px-6 py-3 font-medium">ID</th>
              <th className="px-6 py-3 font-medium">Version</th>
              <th className="px-6 py-3 font-medium">Released Date</th>
              <th className="px-6 py-3 font-medium">Released By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredVersions.map((ver, idx) => {
              const isSelected = selectedVersion?.id === ver.id;
              // Mock ID logic since version objects don't have short numeric IDs in mock data
              const mockId = `v${filteredVersions.length - idx}`; 

              return (
                <tr 
                  key={ver.id} 
                  onClick={() => setSelectedVersion(ver)}
                  className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/60' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-6 py-4 text-center">
                    <div className={`w-4 h-4 rounded-full border mx-auto flex items-center justify-center
                      ${isSelected ? 'border-blue-600' : 'border-gray-300'}
                    `}>
                      {isSelected && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                    {mockId}
                  </td>
                  <td className={`px-6 py-4 font-bold ${isSelected ? 'text-gray-900' : 'text-gray-900'}`}>
                    {ver.versionString}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{ver.releaseDate}</td>
                  <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                     <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                        NW
                     </div>
                     {ver.releasedBy}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
      
      {/* Padded Container */}
      <div className="flex-1 flex flex-col p-8 overflow-hidden">
        
        {/* Main Context Header */}
        <div className="mb-6">
           <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
             Replace Ingredient
             <span className="text-gray-300 font-light text-2xl">/</span>
             <span className="text-blue-600">{componentLabel}</span>
           </h2>
           <p className="text-gray-500 text-sm mt-1">Select a new ingredient and version to override the current configuration.</p>
        </div>

        {renderHeader()}
        
        {step === 'SELECT_INGREDIENT' ? renderIngredientStep() : renderVersionStep()}
      </div>

      {/* FOOTER */}
      <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
         {/* Cancel Button - Always Visible */}
         <button 
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
         >
           Cancel
         </button>

         {/* Navigation Buttons */}
         <div className="flex gap-3">
             {step === 'SELECT_VERSION' && (
                 <button 
                    onClick={handleBack}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300 bg-white flex items-center gap-2"
                 >
                   <ArrowLeft className="w-4 h-4" /> Back
                 </button>
             )}

             <button 
                onClick={handleNext}
                disabled={(step === 'SELECT_INGREDIENT' && !selectedIngredient) || (step === 'SELECT_VERSION' && !selectedVersion)}
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
             >
                {step === 'SELECT_VERSION' ? 'Select' : 'Next'}
             </button>
         </div>
      </div>
    </div>
  );
}