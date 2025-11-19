import React from 'react';
import { MOCK_LESSONS } from '../constants';
import { Flame, Trophy, Target, ArrowRight, PlayCircle } from 'lucide-react';
import { AppView, UserStats } from '../types';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

const MOCK_STATS: UserStats = {
  streak: 12,
  xp: 2450,
  level: 5,
  todayAccuracy: 88,
  lessonsCompleted: 42
};

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome back, Alex! 👋</h1>
          <p className="text-slate-400 mt-1">Ready to master "Coffee Shop Talk"?</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-brand-surface border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 text-orange-400 font-bold shadow-sm">
              <Flame className="w-5 h-5 fill-current" />
              <span>{MOCK_STATS.streak} Day Streak</span>
           </div>
           <div className="bg-brand-surface border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 text-yellow-400 font-bold shadow-sm">
              <Trophy className="w-5 h-5 fill-current" />
              <span>Lvl {MOCK_STATS.level}</span>
           </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-brand-blue to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/20 relative overflow-hidden group cursor-pointer" onClick={() => onNavigate(AppView.LESSON)}>
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <PlayCircle className="w-32 h-32" />
             </div>
             <h3 className="text-blue-100 font-semibold mb-1">Current Lesson</h3>
             <div className="text-2xl font-bold mb-4">Coffee Shop Talk</div>
             <div className="w-full bg-blue-900/50 h-2 rounded-full mb-2 overflow-hidden">
                <div className="w-3/4 h-full bg-brand-accent rounded-full"></div>
             </div>
             <div className="text-xs text-blue-200 mb-6">75% Complete</div>
             <button className="bg-white text-brand-blue px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                Continue Lesson <ArrowRight className="w-4 h-4" />
             </button>
          </div>

          <div className="bg-brand-surface rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
             <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wide">Daily Accuracy</h3>
             <div className="flex items-end gap-2 mt-2">
                <span className="text-4xl font-bold text-white">{MOCK_STATS.todayAccuracy}%</span>
                <span className="text-brand-accent text-sm font-medium mb-1">+2% vs yesterday</span>
             </div>
             <div className="mt-4 h-24 flex items-end gap-1">
                 {[40, 65, 50, 80, 85, 70, 88].map((h, i) => (
                     <div key={i} className="flex-1 bg-slate-700 rounded-t hover:bg-brand-blue transition-colors" style={{ height: `${h}%` }}></div>
                 ))}
             </div>
          </div>

          <div className="bg-brand-surface rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
             <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wide">Next Challenge</h3>
             <div className="mt-4">
                <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mb-3">
                   <Target className="w-6 h-6" />
                </div>
                <div className="text-white font-bold text-lg">Speed Signer</div>
                <p className="text-sm text-slate-400 mt-1">Complete 5 signs in under 10 seconds with 90% accuracy.</p>
             </div>
             <button className="w-full mt-4 border border-slate-700 hover:bg-slate-800 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                View Challenge
             </button>
          </div>
      </div>

      {/* Recommended Lessons */}
      <div>
          <h2 className="text-xl font-bold text-white mb-4">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {MOCK_LESSONS.map((lesson) => (
                <div key={lesson.id} className="bg-brand-surface rounded-xl overflow-hidden border border-slate-800 hover:border-brand-blue/50 transition-all group cursor-pointer">
                    <div className="relative h-40 overflow-hidden">
                        <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {lesson.completed && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                                <Trophy className="w-3 h-3 fill-current" /> Done
                            </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur">
                            {lesson.duration}
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                 lesson.difficulty === 'Beginner' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                             }`}>
                                 {lesson.difficulty}
                             </span>
                             <span className="text-xs text-yellow-500 font-bold flex items-center gap-1">
                                 <Flame className="w-3 h-3 fill-current" /> {lesson.xp} XP
                             </span>
                        </div>
                        <h3 className="text-white font-bold mt-2 truncate">{lesson.title}</h3>
                    </div>
                </div>
             ))}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
