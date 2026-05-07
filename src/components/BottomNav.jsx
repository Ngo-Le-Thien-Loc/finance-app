import { NavLink } from 'react-router-dom';
import { Home, List, Target, BarChart2 } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { path: '/', icon: Home, label: 'Tổng quan' },
    { path: '/transactions', icon: List, label: 'Sổ GD' },
    { path: '/goals', icon: Target, label: 'Mục tiêu' },
    { path: '/reports', icon: BarChart2, label: 'Báo cáo' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-matte-gray border-t border-gray-800 pb-2 pt-2 px-4 z-50">
      <div className="max-w-md mx-auto flex justify-between items-center pb-2">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => 
              `flex flex-col items-center p-2 rounded-xl transition-colors ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`
            }
          >
            <item.icon size={24} />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}