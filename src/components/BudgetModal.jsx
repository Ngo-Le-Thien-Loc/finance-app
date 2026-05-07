import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../supabase';

export default function BudgetModal({ isOpen, onClose, onSave }) {
  const categories = ['Ăn uống', 'Hóa đơn', 'Mua sắm', 'Di chuyển', 'Giải trí', 'Khác'];
  const [category, setCategory] = useState(categories[0]);
  const [amount, setAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!amount) return alert('Vui lòng nhập số tiền hạn mức!');
    setIsSaving(true);

    // Xóa hạn mức cũ của danh mục này (nếu có) để ghi đè cái mới
    await supabase.from('budgets').delete().eq('category', category);

    // Lưu hạn mức mới
    const { error } = await supabase.from('budgets').insert([
      { category, limit_amount: Number(amount) }
    ]);

    setIsSaving(false);
    if (error) {
      alert('Lỗi: ' + error.message);
    } else {
      setAmount('');
      onClose();
      if (onSave) onSave(); // Báo cho Dashboard tải lại dữ liệu
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-end justify-center transition-opacity">
      <div className="bg-matte-gray w-full max-w-md rounded-t-3xl p-6 animate-[slideUp_0.3s_ease-out]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-blue-400">Thiết lập Hạn mức</h2>
          <button onClick={onClose} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Danh mục áp dụng</label>
            <select 
              value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white focus:outline-none"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Số tiền tối đa (1 tháng)</label>
            <input 
              type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0 đ"
              className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-4 text-2xl font-bold text-white focus:outline-none"
            />
          </div>

          <button type="submit" disabled={isSaving} className="w-full py-4 rounded-xl text-lg font-bold mt-4 text-black bg-blue-400">
            {isSaving ? 'Đang lưu...' : 'Lưu Hạn Mức'}
          </button>
        </form>
      </div>
    </div>
  );
}