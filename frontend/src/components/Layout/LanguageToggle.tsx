import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LanguageToggleProps {
  className?: string;
  showText?: boolean;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
  className = "", 
  showText = true 
}) => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <button 
      onClick={toggleLanguage}
      className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-green-600 hover:text-white transition-colors ${className}`}
      title={t('language.change')}
    >
      <Globe className="h-5 w-5" />
      {showText && (
        <span className="text-sm font-medium">
          {language === 'en' ? 'नेपाली' : 'English'}
        </span>
      )}
    </button>
  );
};

export default LanguageToggle;
