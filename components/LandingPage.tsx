import React from 'react';
import { ArrowRight, Video, Hand, MessageSquare, Play } from 'lucide-react';
import { AppView } from '../types';

interface LandingPageProps {
  onNavigate: (view: AppView) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-brand-navy text-white overflow-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
            <Hand className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">Signappse</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate(AppView.AUTH)} className="text-sm font-semibold hover:text-brand-blue transition-colors">
            Log in
          </button>
          <button 
            onClick={() => onNavigate(AppView.AUTH)}
            className="bg-brand-blue hover:bg-blue-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-all transform hover:scale-105"
          >
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-32 px-6 max-w-7xl mx-auto text-center lg:text-left">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 z-10">
            <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-1.5 text-sm text-brand-accent font-medium mb-4">
              <span className="w-2 h-2 bg-brand-accent rounded-full animate-pulse"></span>
              AI-Powered Real-Time Feedback
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight text-white">
              A sign of the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-accent">
                times.
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              The first ASL learning platform that sees you. Use your webcam to get instant feedback on your handshape, movement, and speed.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => onNavigate(AppView.AUTH)}
                className="w-full sm:w-auto px-8 py-4 bg-brand-blue hover:bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Start Learning <ArrowRight className="w-5 h-5" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                <Play className="w-5 h-5 fill-current" /> Watch Demo
              </button>
            </div>
            <p className="text-sm text-slate-500 pt-2">No credit card required • Works on any device</p>
          </div>

          {/* Hero Visual / Mockup */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-blue to-brand-accent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-brand-surface border border-slate-700 rounded-2xl overflow-hidden shadow-2xl aspect-video flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Woman using computer" 
                className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
              />
              
              {/* Simulated Interface Overlay */}
              <div className="absolute inset-0 flex flex-col justify-between p-6">
                <div className="flex justify-between items-start">
                   <div className="bg-black/60 backdrop-blur-md rounded-lg px-3 py-1 text-xs font-mono text-brand-accent border border-brand-accent/30">
                     DETECTING HANDS...
                   </div>
                   <div className="w-24 h-32 bg-slate-800/80 rounded-lg border border-slate-600 shadow-lg p-2">
                      <div className="w-full h-full bg-slate-700 rounded flex items-center justify-center text-xs text-center text-slate-400">
                        Instructor Feed
                      </div>
                   </div>
                </div>
                
                {/* Skeleton Overlay Mockup */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-dashed border-brand-accent/50 rounded-full flex items-center justify-center">
                   <div className="text-brand-accent font-bold text-2xl tracking-widest animate-pulse">GOOD!</div>
                </div>
                
                <div className="bg-slate-900/80 backdrop-blur rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Current Sign</div>
                      <div className="text-xl font-bold text-white">"Hello"</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Accuracy</div>
                      <div className="text-xl font-bold text-brand-accent">94%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Why Signappse?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">We combine advanced computer vision with gamified learning to make ASL accessible to everyone.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Video className="w-8 h-8 text-brand-blue" />,
                title: "Live Correction",
                desc: "Our AI analyzes your webcam feed to provide instant feedback on your hand positioning and movement."
              },
              {
                icon: <MessageSquare className="w-8 h-8 text-brand-accent" />,
                title: "Conversation Mode",
                desc: "Practice realistic dialogues with our 3D AI avatar in various scenarios like cafes, clinics, and more."
              },
              {
                icon: <Hand className="w-8 h-8 text-purple-500" />,
                title: "Gamified Progress",
                desc: "Earn XP, maintain streaks, and unlock new levels. Learning a language has never been this addictive."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-brand-surface p-8 rounded-2xl border border-slate-800 hover:border-brand-blue/50 transition-colors group">
                <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-slate-800 text-center text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
             <Hand className="w-5 h-5 text-brand-blue" />
             <span className="font-bold text-white text-lg">Signappse</span>
          </div>
          <p>&copy; 2024 Signappse Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;