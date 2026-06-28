import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PemilikDashboard from './pages/PemilikDashboard';
import PemilikApproval from './pages/PemilikApproval';
import Materials from './pages/Materials';
import Suppliers from './pages/Suppliers';
import Stocks from './pages/Stocks';
import Logs from './pages/Logs';
import DailyInput from './pages/DailyInput';
import Login from './pages/Login';
import Register from './pages/Register';
import { UserProvider, useUser } from './context/UserContext';

function AppContent({ onLogout }: { onLogout: () => void }) {
  const { profile } = useUser();
  const isPemilik = profile.role === 'Pemilik Yayasan';

  return (
    <Router>
      <div className="flex h-screen bg-[#F0F2F5] p-3 lg:p-5 font-sans text-slate-800 overflow-hidden">
        {/* Main App Container */}
        <div className="flex flex-1 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100 relative">
          <Sidebar onLogout={onLogout} />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto relative z-10 custom-scrollbar scroll-smooth">
            <div className="max-w-[1600px] mx-auto p-8 lg:px-12 lg:py-10">
              <Routes>
                {isPemilik ? (
                  <>
                    <Route path="/" element={<PemilikDashboard />} />
                    <Route path="/pemilik/approval" element={<PemilikApproval />} />
                  </>
                ) : (
                  <>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/materials" element={<Materials />} />
                    <Route path="/suppliers" element={<Suppliers />} />
                    <Route path="/stocks" element={<Stocks />} />
                    <Route path="/logs" element={<Logs />} />
                    <Route path="/daily-input" element={<DailyInput />} />
                  </>
                )}
                {/* Fallback routing */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  return (
    <UserProvider>
      {isAuth ? (
        <AppContent onLogout={() => setIsAuth(false)} />
      ) : showRegister ? (
        <Register 
          onToggleLogin={() => setShowRegister(false)} 
          onRegisterSuccess={(msg) => setSuccessMsg(msg)}
        />
      ) : (
        <Login 
          onLogin={() => setIsAuth(true)} 
          onToggleRegister={() => setShowRegister(true)}
          successMsg={successMsg}
          clearSuccessMsg={() => setSuccessMsg('')}
        />
      )}
    </UserProvider>
  );
}

export default App;
