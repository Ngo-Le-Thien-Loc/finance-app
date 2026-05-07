import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Reports from './pages/Reports';
import Login from './pages/Login';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Kiểm tra phiên đăng nhập hiện tại
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    // Lắng nghe thay đổi (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  if (!session) return <Login />; // Nếu chưa login, ép xem trang Login

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-matte-black text-white font-sans">
        <div className="max-w-md mx-auto p-4">
          <button 
            onClick={() => supabase.auth.signOut()}
            className="absolute top-4 right-4 text-xs text-gray-500 hover:text-red-400"
          >
            Đăng xuất
          </button>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} /> 
            <Route path="/goals" element={<Goals />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;