import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Trophy, Clock, Zap, Calendar, Flame, MessageSquare } from 'lucide-react';

const DATA_ACTIVITY = [
  { name: 'Mon', minutes: 20 },
  { name: 'Tue', minutes: 45 },
  { name: 'Wed', minutes: 30 },
  { name: 'Thu', minutes: 60 },
  { name: 'Fri', minutes: 25 },
  { name: 'Sat', minutes: 50 },
  { name: 'Sun', minutes: 35 },
];

const DATA_ACCURACY = [
  { name: 'Mon', score: 65 },
  { name: 'Tue', score: 70 },
  { name: 'Wed', score: 68 },
  { name: 'Thu', score: 85 },
  { name: 'Fri', score: 82 },
  { name: 'Sat', score: 90 },
  { name: 'Sun', score: 88 },
];

const Progress: React.FC = () => {
  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto overflow-y-auto h-full">
      <h1 className="text-3xl font-bold text-white">Your Growth</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
             { label: 'Total XP', value: '2,450', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
             { label: 'Time Signed', value: '14h 20m', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
             { label: 'Signs Mastered', value: '128', icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-400/10' },
             { label: 'Current Streak', value: '12 Days', icon: Calendar, color: 'text-green-400', bg: 'bg-green-400/10' },
         ].map((stat, i) => (
             <div key={i} className="bg-brand-surface border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
                     <stat.icon className="w-6 h-6" />
                 </div>
                 <div>
                     <div className="text-slate-400 text-xs font-bold uppercase">{stat.label}</div>
                     <div className="text-2xl font-bold text-white">{stat.value}</div>
                 </div>
             </div>
         ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
          {/* Activity Chart */}
          <div className="bg-brand-surface border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">Weekly Activity (Minutes)</h3>
              <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={DATA_ACTIVITY}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                          <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Bar dataKey="minutes" fill="#1174F2" radius={[4, 4, 0, 0]} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Accuracy Chart */}
          <div className="bg-brand-surface border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">Accuracy Trend</h3>
              <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={DATA_ACCURACY}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                          <YAxis stroke="#94a3b8" tick={{fontSize: 12}} domain={[0, 100]} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                          />
                          <Line type="monotone" dataKey="score" stroke="#0BE6A8" strokeWidth={3} dot={{r: 4, fill: '#0BE6A8'}} activeDot={{r: 6}} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-brand-surface border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Recent Achievements</h3>
          <div className="space-y-4">
              {[
                  { title: 'Fast Fingers', desc: 'Complete 10 signs in 1 minute', date: '2 hours ago', icon: Zap },
                  { title: 'Week Warrior', desc: 'Maintain a 7-day streak', date: 'Yesterday', icon: Flame },
                  { title: 'Social Butterfly', desc: 'Complete 3 conversation scenarios', date: '2 days ago', icon: MessageSquare }
              ].map((ach, i) => {
                  const Icon = ach.icon || Trophy;
                  return (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-bold text-white">{ach.title}</div>
                                <div className="text-sm text-slate-400">{ach.desc}</div>
                            </div>
                        </div>
                        <div className="text-xs text-slate-500 font-mono">{ach.date}</div>
                    </div>
                  );
              })}
          </div>
      </div>
    </div>
  );
};

export default Progress;