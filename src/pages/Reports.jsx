import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Reports() {
  const [data6Months, setData6Months] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // State điều khiển các biểu đồ chọn lọc
  const [viewType, setViewType] = useState('income'); // Thu/Chi/Số dư
  const [catGrowth, setCatGrowth] = useState(''); // Xem trưởng danh mục cụ thể

  useEffect(() => {
    const fetchData = async () => {
      // Tính toán mảng 6 tháng gần nhất để làm khung
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        months.push(d.toISOString().slice(0, 7)); // Vd: ['2025-12', '2026-01', ...]
      }

      const { data } = await supabase.from('transactions').select('*').gte('date', months[0] + '-01');
      if (!data) return;

      // Extract danh mục
      const uniqueCats = [...new Set(data.map(d => d.category))];
      setCategories(uniqueCats);
      if (uniqueCats.length > 0) setCatGrowth(uniqueCats[0]);

      // Xây dựng dữ liệu cho biểu đồ 6 tháng
      const chartArr = months.map(m => {
        const tMonth = data.filter(t => t.date.startsWith(m));
        let inc = 0, exp = 0;
        
        // Tính tổng
        tMonth.forEach(t => t.type === 'income' ? inc += t.amount : exp += t.amount);
        
        // Tính theo từng danh mục (Lưu vào object để dễ vẽ)
        const catTotals = {};
        tMonth.forEach(t => catTotals[t.category] = (catTotals[t.category] || 0) + t.amount);

        return { month: m.slice(5, 7), 'Thu Nhập': inc, 'Chi Tiêu': exp, 'Số Dư': inc - exp, ...catTotals };
      });
      setData6Months(chartArr);
    };
    fetchData();
  }, []);

  return (
    <div className="pb-24 pt-4">
      <h1 className="text-2xl font-bold mb-6">Báo cáo 6 Tháng</h1>

      {/* 1. Biểu đồ Cột 3 (Thu - Chi - Số Dư) */}
      <div className="bg-matte-gray p-4 rounded-2xl mb-6">
        <h3 className="text-gray-400 text-sm mb-4">Tổng quan Tài chính</h3>
        <div className="h-64 w-full text-xs">
          <ResponsiveContainer>
            <BarChart data={data6Months}>
              <XAxis dataKey="month" stroke="#8884d8" />
              <YAxis stroke="#8884d8" tickFormatter={v => `${v/1000}k`} />
              <Tooltip cursor={{fill: '#2A2A2A'}} contentStyle={{ backgroundColor: '#121212', borderRadius: '8px' }}/>
              <Legend />
              <Bar dataKey="Thu Nhập" fill="#4ade80" />
              <Bar dataKey="Chi Tiêu" fill="#f87171" />
              <Bar dataKey="Số Dư" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Biểu đồ Chọn lọc Tổng thể */}
      <div className="bg-matte-gray p-4 rounded-2xl mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-400 text-sm">Xu hướng cụ thể</h3>
          <select value={viewType} onChange={e => setViewType(e.target.value)} className="bg-black text-xs p-2 rounded">
            <option value="Thu Nhập">Thu Nhập</option>
            <option value="Chi Tiêu">Chi Tiêu</option>
            <option value="Số Dư">Số Dư</option>
          </select>
        </div>
        <div className="h-48 w-full text-xs">
          <ResponsiveContainer>
            <BarChart data={data6Months}>
              <XAxis dataKey="month" stroke="#8884d8" />
              <Tooltip cursor={{fill: '#2A2A2A'}} contentStyle={{ backgroundColor: '#121212' }}/>
              <Bar dataKey={viewType} fill={viewType === 'Thu Nhập' ? '#4ade80' : viewType === 'Chi Tiêu' ? '#f87171' : '#60a5fa'} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Biểu đồ Tăng trưởng Danh mục */}
      <div className="bg-matte-gray p-4 rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-400 text-sm">Tăng trưởng Danh mục</h3>
          <select value={catGrowth} onChange={e => setCatGrowth(e.target.value)} className="bg-black text-xs p-2 rounded max-w-[120px]">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="h-48 w-full text-xs">
          <ResponsiveContainer>
            <BarChart data={data6Months}>
              <XAxis dataKey="month" stroke="#8884d8" />
              <Tooltip cursor={{fill: '#2A2A2A'}} contentStyle={{ backgroundColor: '#121212' }}/>
              <Bar dataKey={catGrowth} fill="#FFBB28" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}