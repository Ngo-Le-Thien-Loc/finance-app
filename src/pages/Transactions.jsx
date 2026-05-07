import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import TransactionModal from '../components/TransactionModal';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('expense'); 
  
  // Lấy tháng an toàn
  const today = new Date();
  const safeMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [month, setMonth] = useState(safeMonth);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchTransactions = async () => {
    const { data } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    if (data) setTransactions(data);
  };

  useEffect(() => { fetchTransactions(); }, []);

  // Lọc an toàn với dấu "?"
  const filteredData = transactions.filter(t => t.date?.startsWith(month) && t.type === filter);

  const chartDataMap = {};
  filteredData.forEach(t => {
    chartDataMap[t.category || 'Khác'] = (chartDataMap[t.category || 'Khác'] || 0) + t.amount;
  });
  const chartData = Object.keys(chartDataMap).map(key => ({ name: key, value: chartDataMap[key] }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#f87171', '#4ade80'];

  const openEditModal = (item) => { setEditData(item); setIsModalOpen(true); };

  return (
    <div className="pb-24 pt-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sổ GD Tháng</h1>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="bg-gray-800 text-white p-2 rounded-lg" />
      </div>

      <div className="flex bg-matte-gray rounded-xl p-1 mb-6">
        <button onClick={() => setFilter('income')} className={`flex-1 py-2 text-sm rounded-lg ${filter === 'income' ? 'bg-green-900/50 text-green-400' : 'text-gray-400'}`}>Thu nhập</button>
        <button onClick={() => setFilter('expense')} className={`flex-1 py-2 text-sm rounded-lg ${filter === 'expense' ? 'bg-red-900/50 text-red-400' : 'text-gray-400'}`}>Chi tiêu</button>
      </div>

      {chartData.length > 0 && (
        <div className="bg-matte-gray p-4 rounded-xl mb-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(val) => `${val.toLocaleString('vi-VN')} đ`} contentStyle={{ backgroundColor: '#121212', borderRadius: '8px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-3">
        {filteredData.length === 0 ? <p className="text-gray-500 text-center mt-10">Không có dữ liệu.</p> : 
          filteredData.map((t) => (
            <div key={t.id} onClick={() => openEditModal(t)} className="bg-matte-gray p-4 rounded-xl flex justify-between items-center cursor-pointer hover:bg-gray-800">
              <div>
                <p className="font-medium text-white">{t.category}</p>
                <p className="text-xs text-gray-400">{t.date} {t.note ? `• ${t.note}` : ''}</p>
              </div>
              <p className={`font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString('vi-VN')} đ
              </p>
            </div>
          ))
        }
      </div>
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); fetchTransactions(); }} 
        type={editData ? editData.type : filter} // Truyền chuẩn type để không lưu nhầm
        editData={editData} 
      />
    </div>
  );
}