import React, { useState } from 'react';
import { AppView } from '../types';
import { Mail, Lock, User, ArrowRight, Facebook, Chrome, CheckCircle, AlertCircle } from 'lucide-react';

interface AuthPageProps {
  onNavigate: (view: AppView) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
      onNavigate(AppView.DASHBOARD);
    }, 1500);
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onNavigate(AppView.DASHBOARD);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-brand-surface border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 pb-6 text-center">
           <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-blue/20 mb-4">
              <span className="text-brand-blue font-extrabold text-2xl">S</span>
           </div>
           <h2 className="text-2xl font-bold text-white mb-2">
             {isLogin ? 'Welcome Back' : 'Create an Account'}
           </h2>
           <p className="text-slate-400 text-sm">
             {isLogin 
               ? 'Enter your details to access your lessons.' 
               : 'Join Signappse and start learning ASL today.'}
           </p>
        </div>

        {/* Social Auth */}
        <div className="px-8 space-y-3">
          <button 
            onClick={() => handleSocialLogin('google')}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-slate-900 py-2.5 rounded-xl font-semibold transition-all text-sm border border-slate-200"
          >
            {/* Simple Google SVG icon since Lucide doesn't have brand icons */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Gmail
          </button>
          <button 
            onClick={() => handleSocialLogin('facebook')}
            className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166fe5] text-white py-2.5 rounded-xl font-semibold transition-all text-sm"
          >
            <Facebook className="w-5 h-5 fill-current" />
            Continue with Facebook
          </button>
        </div>

        <div className="px-8 py-6 flex items-center gap-3">
           <div className="h-px bg-slate-700 flex-1"></div>
           <span className="text-slate-500 text-xs uppercase font-bold">Or with email</span>
           <div className="h-px bg-slate-700 flex-1"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-10 py-2.5 text-white focus:outline-none focus:border-brand-blue placeholder-slate-600 transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-10 py-2.5 text-white focus:outline-none focus:border-brand-blue placeholder-slate-600 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-10 py-2.5 text-white focus:outline-none focus:border-brand-blue placeholder-slate-600 transition-colors"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-6 bg-brand-blue hover:bg-blue-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
                <>Processing...</>
            ) : (
                <>
                   {isLogin ? 'Log In' : 'Create Account'} <ArrowRight className="w-5 h-5" />
                </>
            )}
          </button>
          
          <div className="text-center mt-4">
             <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-slate-400 hover:text-white text-sm transition-colors"
             >
               {isLogin ? "Don't have an account? " : "Already have an account? "}
               <span className="text-brand-blue font-bold hover:underline">
                 {isLogin ? 'Sign Up' : 'Log In'}
               </span>
             </button>
          </div>
        </form>
      </div>
      
      <div className="absolute bottom-4 text-slate-600 text-xs">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </div>
    </div>
  );
};

export default AuthPage;