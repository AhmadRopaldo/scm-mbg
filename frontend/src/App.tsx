import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Materials from './pages/Materials';
import Suppliers from './pages/Suppliers';
import Stocks from './pages/Stocks';
import Logs from './pages/Logs';
import Login from './pages/Login';

function App() {
  // Mock Auth state
  const [isAuth, setIsAuth] = useState(false);

  if (!isAuth) {
    return <Login onLogin={() => setIsAuth(true)} />;
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
        {/* Decorative ambient background for Glassmorphism */}
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-blue-400 rounded-full mix-blend-multiply filter blur-[150px] opacity-20 pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[900px] h-[900px] bg-emerald-400 rounded-full mix-blend-multiply filter blur-[150px] opacity-15 pointer-events-none animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute top-[30%] left-[25%] w-[600px] h-[600px] bg-indigo-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-10 pointer-events-none"></div>

        <Sidebar onLogout={() => setIsAuth(false)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto relative z-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto p-8 lg:p-10">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/stocks" element={<Stocks />} />
              <Route path="/logs" element={<Logs />} />
              {/* Fallback routing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
