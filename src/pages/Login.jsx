import { useState } from 'react';
import { supabase } from '../supabase';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = isRegister 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) alert(error.message);
    else if (isRegister) alert('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-matte-black flex items-center justify-center p-4">
      <div className="bg-matte-gray w-full max-w-md p-8 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-bold mb-2 text-center text-white">Finance App</h1>
        <p className="text-gray-400 text-center mb-8">{isRegister ? 'Tạo tài khoản mới' : 'Đăng nhập để tiếp tục'}</p>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="email" placeholder="Email (Username)" 
            className="w-full bg-black border border-gray-700 p-4 rounded-xl text-white focus:outline-none focus:border-blue-500"
            value={email} onChange={e => setEmail(e.target.value)} required
          />
          <input 
            type="password" placeholder="Mật khẩu" 
            className="w-full bg-black border border-gray-700 p-4 rounded-xl text-white focus:outline-none focus:border-blue-500"
            value={password} onChange={e => setPassword(e.target.value)} required
          />
          <button disabled={loading} className="w-full bg-white text-black font-bold py-4 rounded-xl text-lg hover:bg-gray-200 transition-colors">
            {loading ? 'Đang xử lý...' : (isRegister ? 'Đăng ký' : 'Đăng nhập')}
          </button>
        </form>

        <button 
          onClick={() => setIsRegister(!isRegister)}
          className="w-full mt-6 text-sm text-gray-400 hover:text-white"
        >
          {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
        </button>
      </div>
    </div>
  );
}