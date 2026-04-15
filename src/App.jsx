import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ChatBot from './components/ChatBot';
import AssistantChat from './components/AssistantChat';
import Leads from './pages/Leads';
import LindyChat from './pages/LindyChat';

function Layout({ children }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-black via-cyber-dark to-cyber-darker py-8 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyber-green opacity-5 rounded-full blur-3xl animate-pulse-slow" />
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyber-green-dark opacity-5 rounded-full blur-3xl animate-pulse-slow"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
          linear-gradient(rgba(0, 255, 156, 0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 156, 0.3) 1px, transparent 1px)
        `,
          backgroundSize: '50px 50px',
        }}
      />
      <nav className="relative z-10 max-w-7xl mx-auto mb-6 flex gap-3 font-mono text-sm">
        <Link
          to="/"
          className={`px-3 py-1.5 rounded-lg border transition-colors ${
            pathname === '/'
              ? 'border-cyber-green text-cyber-green bg-cyber-green/10'
              : 'border-white/10 text-gray-400 hover:border-cyber-green/40 hover:text-cyber-green'
          }`}
        >
          Chat
        </Link>
        <Link
          to="/leads"
          className={`px-3 py-1.5 rounded-lg border transition-colors ${
            pathname === '/leads'
              ? 'border-cyber-green text-cyber-green bg-cyber-green/10'
              : 'border-white/10 text-gray-400 hover:border-cyber-green/40 hover:text-cyber-green'
          }`}
        >
          Leads
        </Link>
        <Link
          to="/assistant"
          className={`px-3 py-1.5 rounded-lg border transition-colors ${
            pathname === '/assistant'
              ? 'border-cyber-green text-cyber-green bg-cyber-green/10'
              : 'border-white/10 text-gray-400 hover:border-cyber-green/40 hover:text-cyber-green'
          }`}
        >
          AI Assistant
        </Link>
        <Link
          to="/lindy"
          className={`px-3 py-1.5 rounded-lg border transition-colors ${
            pathname === '/lindy'
              ? 'border-cyber-green text-cyber-green bg-cyber-green/10'
              : 'border-white/10 text-gray-400 hover:border-cyber-green/40 hover:text-cyber-green'
          }`}
        >
          Lindy AI
        </Link>
      </nav>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ChatBot />} />
        <Route path="/assistant" element={<AssistantChat />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/lindy" element={<LindyChat />} />
      </Routes>
    </Layout>
  );
}
