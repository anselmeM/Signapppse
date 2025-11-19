import React from 'react';
import { Home, BookOpen, MessageCircle, Activity, LogOut } from 'lucide-react';
import { AppView, NavItem } from '../types';

interface NavbarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', view: AppView.DASHBOARD, icon: Home },
  { label: 'Lessons', view: AppView.LESSON, icon: BookOpen },
  { label: 'Practice', view: AppView.CONVERSATION, icon: MessageCircle },
  { label: 'Progress', view: AppView.PROGRESS, icon: Activity },
];

const Navbar: React.FC<NavbarProps> = ({ currentView, onChangeView }) => {
  return (
    <nav className="fixed left-0 top-0 h-full w-20 md:w-64 bg-brand-navy border-r border-slate-800 z-50 flex flex-col justify-between py-6 transition-all duration-300">
      <div>
        <div className="flex items-center gap-3 px-6 mb-10">
          <div className="w-8 h-8 bg-brand-blue rounded-lg flex-shrink-0 flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white hidden md:block">Signappse</span>
        </div>

        <div className="space-y-2 px-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.view}
              onClick={() => onChangeView(item.view)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all ${
                currentView === item.view
                  ? 'bg-brand-blue text-white shadow-lg shadow-blue-900/50'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-6 h-6 flex-shrink-0" />
              <span className="font-medium hidden md:block">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-3">
        <button 
          onClick={() => onChangeView(AppView.LANDING)}
          className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-6 h-6 flex-shrink-0" />
          <span className="font-medium hidden md:block">Log Out</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
