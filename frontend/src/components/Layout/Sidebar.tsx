import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  TrendingUp, 
  User, 
  Users, 
  PlusCircle, 
  Settings, 
  Brain,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const farmerMenuItems = [
    { path: '/farmer/dashboard', icon: Home, label: t('nav.dashboard') },
    { path: '/farmer/grants', icon: FileText, label: t('nav.grants') },
    { path: '/farmer/applications', icon: User, label: t('nav.applications') },
    { path: '/farmer/market', icon: TrendingUp, label: t('nav.market') },
    { path: '/farmer/profile', icon: Settings, label: t('nav.profile') },
  ];

  const adminMenuItems = [
    { path: '/admin/dashboard', icon: Home, label: t('nav.dashboard') },
    { path: '/admin/applications', icon: Users, label: t('nav.applications') },
    { path: '/admin/grants/create', icon: PlusCircle, label: t('nav.createGrant') },
    { path: '/admin/grants/manage', icon: Settings, label: t('nav.manageGrants') },
    { path: '/admin/ai-selection', icon: Brain, label: t('nav.aiSelection') },
    { path: '/admin/fraud-detection', icon: Shield, label: t('nav.fraudDetection') },
    { path: '/admin/market-prices', icon: TrendingUp, label: t('nav.setMarketPrices') },
  ];

  const menuItems = user?.type === 'farmer' ? farmerMenuItems : adminMenuItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 z-50 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <nav className="h-full px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                      ${isActive 
                        ? 'bg-green-100 text-green-700 border-r-4 border-green-500' 
                        : 'text-gray-700 hover:bg-green-50'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;