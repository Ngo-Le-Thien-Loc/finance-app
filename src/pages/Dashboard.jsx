import { useState, useEffect } from 'react';
import TransactionModal from '../components/TransactionModal';
import BudgetModal from '../components/BudgetModal'; // Bổ sung form Hạn mức
import { supabase } from '../supabase';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  
  const [transactionType, setTransactionType] = useState('expense');
  const [editData, setEditData] = useState(null); 
  
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]); // Chứa dữ liệu hạn mức
  const [stats, setStats] = useState({ balance: 0, income: 0, percentRem: 100, incChange: 0, expChange: 0 });

  const fetchData = async () => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const prevDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    // Kéo dữ liệu giao dịch VÀ dữ liệu hạn mức cùng lúc
    const [transRes, budgetRes] = await Promise.all([
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('budgets').select('*')
    ]);

    if (transRes.data) {
      const currData = transRes.data.filter(t => t.date?.startsWith(currentMonth));
      const prevData = transRes.data.filter(t => t.date?.startsWith(prevMonth));
      
      setTransactions(currData);

      let currInc = 0, currExp = 0, prevInc = 0, prevExp = 0;
      const expensesByCategory = {}; // Bộ đếm tiền chi tiêu theo từng danh mục

      currData.forEach(t => {
        if (t.type === 'income') currInc += Number(t.amount);
        else {
          currExp += Number(t.amount);
          // Cộng dồn tiền chi tiêu cho danh mục tương ứng
          expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + Number(t.amount);
        }
      });
      
      prevData.forEach(t => t.type === 'income' ? prevInc += Number(t.amount) : prevExp += Number(t.amount));
      
      const incDiff = prevInc === 0 ? (currInc > 0 ? 100 : 0) : ((currInc - prevInc) / prevInc * 100).toFixed(1);
      const expDiff = prevExp === 0 ? (currExp > 0 ? 100 : 0) : ((currExp - prevExp) / prevExp * 100).toFixed(1);

      setStats({
        balance: currInc - currExp,
        income: currInc,
        percentRem: currInc > 0 ? Math.max(0, (((currInc - currExp) / currInc) * 100).toFixed(0)) : 0,
        incChange: incDiff,
        expChange: expDiff
      });

      // Xử lý dữ liệu Hạn mức để vẽ thanh phần trăm
      if (budgetRes.data) {
        const processedBudgets = budgetRes.data.map(b => {
          const spent = expensesByCategory[b.category] || 0;
          const percent = b.limit_amount > 0 ? (spent / b.limit_amount) * 100 : 0;
          return { ...b, spent, percent };
        });
        setBudgets(processedBudgets);
      }
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (type, data = null) => {
    setTransactionType(type); setEditData(data); setIsModalOpen(true);
  };

  return (
    <div className="pb-24">
      <div className="bg-matte-gray rounded-2xl p-6 shadow-lg mt-4">
        <p className="text-gray-400 text-sm mb-1">Số dư / Tổng thu (Tháng này)</p>
        <h1 className="text-3xl font-bold mb-4">
          {stats.balance.toLocaleString('vi-VN')} đ <span className="text-lg text-gray-500 font-normal">/ {stats.income.toLocaleString('vi-VN')} đ</span>
        </h1>
        
        <div className="w-full bg-black rounded-full h-2 mb-2">
          <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${stats.percentRem}%` }}></div>
        </div>
        
        <div className="flex justify-between text-xs mt-3">
          <span className="text-gray-400">Còn lại {stats.percentRem}%</span>
          <div className="flex gap-3">
            <span className={stats.incChange >= 0 ? 'text-green-400' : 'text-red-400'}>Thu: {stats.incChange > 0 ? '+' : ''}{stats.incChange}%</span>
            <span className={stats.expChange >= 0 ? 'text-red-400' : 'text-green-400'}>Chi: {stats.expChange > 0 ? '+' : ''}{stats.expChange}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <button onClick={() => openModal('income')} className="bg-green-900/30 text-green-400 border border-green-800/50 font-bold py-3 rounded-xl active:scale-95">+ Thu Nhập</button>
        <button onClick={() => openModal('expense')} className="bg-red-900/30 text-red-400 border border-red-800/50 font-bold py-3 rounded-xl active:scale-95">- Chi Tiêu</button>
      </div>

      {/* KHỐI HẠN MỨC CHI TIÊU ĐỘNG */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Hạn mức chi tiêu</h2>
          <button onClick={() => setIsBudgetOpen(true)} className="text-sm font-bold text-blue-400 hover:text-blue-300 p-2">
            + Thiết lập
          </button>
        </div>
        
        <div className="space-y-4">
          {budgets.length === 0 ? (
            <p className="text-gray-500 text-sm text-center">Chưa có hạn mức nào.</p>
          ) : (
            budgets.map((b) => {
              // Thuật toán đổi màu: < 80% (Xanh), 80-100% (Vàng), > 100% (Đỏ)
              let colorClass = "bg-green-500";
              let msg = "Trong tầm kiểm soát";
              let msgColor = "text-green-500/80";

              if (b.percent >= 100) {
                colorClass = "bg-red-500";
                msg = "Đã vượt quá hạn mức!";
                msgColor = "text-red-500/80";
              } else if (b.percent >= 80) {
                colorClass = "bg-yellow-500";
                msg = "Sắp chạm mốc. Cẩn thận!";
                msgColor = "text-yellow-500/80";
              }

              return (
                <div key={b.id} className="bg-matte-gray p-4 rounded-xl border border-gray-800">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-200">{b.category}</span>
                    <span className="font-bold text-white">
                      {b.spent.toLocaleString('vi-VN')} <span className="text-gray-500 font-normal">/ {Number(b.limit_amount).toLocaleString('vi-VN')} đ</span>
                    </span>
                  </div>
                  <div className="w-full bg-black rounded-full h-1.5 mb-2 overflow-hidden">
                    <div className={`${colorClass} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${Math.min(b.percent, 100)}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className={msgColor}>{msg}</span>
                    <span className="text-gray-500">{b.percent.toFixed(0)}%</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Gần đây (Bấm để sửa)</h2>
        <div className="space-y-3">
          {transactions.length === 0 ? <p className="text-gray-500 text-sm text-center mt-5">Chưa có giao dịch nào của tháng này.</p> : null}
          {transactions.slice(0, 5).map((t) => (
            <div key={t.id} onClick={() => openModal(t.type, t)} className="bg-matte-gray p-4 rounded-xl flex justify-between items-center cursor-pointer hover:bg-gray-800 transition-colors">
              <div>
                <p className="font-medium">{t.category}</p>
                <p className="text-xs text-gray-400">{t.date} {t.note ? `• ${t.note}` : ''}</p>
              </div>
              <p className={`font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {t.type === 'income' ? '+' : '-'} {Number(t.amount).toLocaleString('vi-VN')}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      <TransactionModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); fetchData(); }} type={transactionType} editData={editData} />
      <BudgetModal isOpen={isBudgetOpen} onClose={() => setIsBudgetOpen(false)} onSave={fetchData} />
    </div>
  );
}