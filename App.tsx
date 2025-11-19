import React, { useState, Suspense } from 'react';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';
import { AppView } from './types';
import { Loader2, AlertCircle, RefreshCcw } from 'lucide-react';

// Lazy load heavy components to prevent main app crash if dependencies (like Three.js or GenAI) fail to load
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const LessonInterface = React.lazy(() => import('./components/LessonInterface'));
const ConversationMode = React.lazy(() => import('./components/ConversationMode'));
const Progress = React.lazy(() => import('./components/Progress'));

// Simple internal error boundary for routes
class RouteErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-brand-surface rounded-2xl border border-slate-800 m-6">
          <div className="bg-red-500/10 p-4 rounded-full mb-4">
             <AlertCircle className="w-10 h-10 text-brand-error" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Unable to load this section</h2>
          <p className="text-slate-400 mb-6 max-w-md">
            There was a problem loading the resources for this feature. This might be due to a network issue or browser compatibility.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="px-6 py-2 bg-brand-blue hover:bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-full bg-brand-navy">
    <Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-4" />
    <span className="text-slate-400 animate-pulse">Loading resources...</span>
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);

  const renderView = () => {
    switch (currentView) {
      case AppView.LANDING:
        return <LandingPage onNavigate={setCurrentView} />;
      case AppView.AUTH:
        return <AuthPage onNavigate={setCurrentView} />;
      case AppView.DASHBOARD:
        return <Dashboard onNavigate={setCurrentView} />;
      case AppView.LESSON:
        return <LessonInterface />;
      case AppView.CONVERSATION:
        return <ConversationMode />;
      case AppView.PROGRESS:
        return <Progress />;
      default:
        return <LandingPage onNavigate={setCurrentView} />;
    }
  };

  // If Landing or Auth, show full screen (no Navbar). Else, show Dashboard Layout
  if (currentView === AppView.LANDING || currentView === AppView.AUTH) {
    return (
      <RouteErrorBoundary>
        {renderView()}
      </RouteErrorBoundary>
    );
  }

  return (
    <div className="flex h-screen bg-brand-navy text-white overflow-hidden font-sans">
      <Navbar currentView={currentView} onChangeView={setCurrentView} />
      <main className="flex-1 ml-20 md:ml-64 relative h-full overflow-hidden">
        <RouteErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            {renderView()}
          </Suspense>
        </RouteErrorBoundary>
      </main>
    </div>
  );
};

export default App;