
import React, { useState, useRef } from 'react';
import { X, Upload, Clipboard, Info, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { KnobMeta } from '../types';

interface KnobBulkImportModalProps {
  onImport: (newOverrides: Record<string, string>) => void;
  onCancel: () => void;
  knobMetadata: KnobMeta[];
}

const KnobBulkImportModal: React.FC<KnobBulkImportModalProps> = ({ onImport, onCancel, knobMetadata }) => {
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setTextInput(event.target.result);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    setIsProcessing(true);
    
    // Simulate some work
    setTimeout(() => {
      // Split by newline OR comma
      const segments = textInput.split(/[\n,]/);
      const newOverrides: Record<string, string> = {};

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
          // Only a key was provided
          key = trimmed;
          value = ''; // Explicitly empty to trigger warning in UI
        }

        if (key) {
          newOverrides[key] = value;
        }
      });

      onImport(newOverrides);
      setIsProcessing(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Clipboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none">Bulk Configuration Import</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Import Multiple Key-Value Pairs</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-300 hover:text-gray-900 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {/* BODY */}
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
             <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
             <div className="text-[11px] text-blue-800 font-medium leading-relaxed">
               Paste your configuration parameters below. Use <span className="font-bold">New Lines</span> or <span className="font-bold">Commas</span> to separate items. 
               Format: <span className="font-bold italic">Key=Value</span>. If only a key is provided, it will be added with an empty value and a warning.
             </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Input Area</label>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 hover:underline uppercase"
              >
                <FileText className="w-3.5 h-3.5" /> Load from file
                <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.ini,.cfg" onChange={handleFileUpload} />
              </button>
            </div>
            <textarea 
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="MyKnobName=0x1, OtherKnob=0x5&#10;ThirdKnob (Key only)&#10;KeyWithNoValue="
              className="w-full h-64 p-4 text-[11px] font-mono border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none shadow-inner"
            />
          </div>

          <div className="flex items-center gap-4 text-[10px] text-gray-500 italic">
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
               Supports \n and , separators
            </div>
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
               Validation applied on import
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
          <button 
            onClick={onCancel}
            className="px-6 py-2.5 text-[10px] font-black text-gray-500 hover:bg-gray-200 rounded-xl uppercase tracking-widest transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleImport}
            disabled={!textInput.trim() || isProcessing}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2 disabled:opacity-30"
          >
            {isProcessing ? 'Processing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KnobBulkImportModal;
