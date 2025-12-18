import React, { useState, useRef, useEffect } from 'react';
import { Icon } from "@iconify/react";
import { ChevronDown } from 'lucide-react';

interface ExportButtonsProps {
  onExportCSV?: () => void;
  onExportXLSX?: (searchType: string, displayQuantity: string, dataview: string) => void;
  isLoading?: boolean;
  searchType?: string;
  displayQuantity?: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ onExportCSV, onExportXLSX, isLoading = false, searchType = '', displayQuantity = '' }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const exportOptions = [
    { value: 'default', label: 'Default' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const handleXLSXClick = () => {
    if (!isLoading) {
      // Validate if search type is selected
      if (!searchType) {
        alert('Please select the search type');
        return;
      }
      // Validate if display quantity is selected
      if (!displayQuantity) {
        alert('Please select the display quantity');
        return;
      }
      setShowDropdown(!showDropdown);
    }
  };

  const handleOptionSelect = (dataview: string) => {
    setShowDropdown(false);
    if (onExportXLSX && searchType && displayQuantity) {
      onExportXLSX(searchType, displayQuantity, dataview);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="flex gap-2 w-full sm:w-auto justify-start sm:justify-end">
      {/* <button 
        onClick={onExportCSV}
        className="flex items-center justify-center gap-2 py-2 px-[10px] border border-[#D5D7DA] rounded-[8px] flex-1 sm:flex-none hover:bg-gray-50 transition-colors"
      >
        <Icon icon="bi:filetype-csv" width="16" height="16" />
        <span className="font-medium text-xs text-[#252B37]">CSV</span>
      </button> */}
      
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={handleXLSXClick}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 py-2 px-[10px] border border-[#D5D7DA] rounded-[8px] flex-1 sm:flex-none hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Icon icon="eos-icons:loading" width="16" height="16" />
          ) : (
            <>
              <Icon icon="bi:filetype-xlsx" width="16" height="16" />
              <span className="font-medium text-xs text-[#252B37]">XLSX</span>
              <ChevronDown size={14} className="text-gray-600" />
            </>
          )}
        </button>

        {showDropdown && !isLoading && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="py-1">
              {exportOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportButtons;
