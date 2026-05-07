import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { supabase } from '../supabase';

export default function TransactionModal({ isOpen, onClose, type, editData = null }) {
  const isIncome = type === 'income';
  const defaultCategories = isIncome ? ['Lương', 'Thưởng', 'Bán đồ'] : ['Ăn uống', 'Hóa đơn', 'Mua sắm', 'Di chuyển', 'Giải trí'];

  const [customCategories, setCustomCategories] = useState([]); 
  const [category, setCategory] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('transactions').select('category').eq('type', type);
      if (data) {
        const uniqueCats = [...new Set(data.map(d => d.category).filter(Boolean))];
        setCustomCategories(uniqueCats.filter(c => !defaultCategories.includes(c) && c !== 'Khác'));
      }
    };

    if (isOpen) {
      fetchCategories();
      setIsAddingNew(false);
      
      if (editData) {
        setAmount(editData.amount);
        setNote(editData.note || '');
        setDate(editData.date);
        setCategory(editData.category || 'Khác');
      } else {
        setAmount(''); setNote(''); setDate(new Date().toISOString().split('T')[0]);
        setCategory(defaultCategories[0]);
      }
    }
  }, [isOpen, type, editData]);

  if (!isOpen) return null;
  const allCategories = [...defaultCategories, ...customCategories, 'Khác'];

  const handleSave = async (e) => {
    e.preventDefault();
    if (!amount) return alert('Chưa nhập số tiền!');

    const finalCategory = isAddingNew && newCategory.trim() !== '' ? newCategory.trim() : category;
    const payload = { amount: parseFloat(amount), type, note, date, category: finalCategory };

    setIsSaving(true);
    let error;
    if (editData) {
      const res = await supabase.from('transactions').update(payload).eq('id', editData.id);
      error = res.error;
    } else {
      const res = await supabase.from('transactions').insert([payload]);
      error = res.error;
    }
    setIsSaving(false);

    if (error) {
      alert('Lỗi: ' + error.message);
    } else {
      alert('Đã lưu giao dịch thành công!'); // <--- Đã thêm lại thông báo ở đây
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa giao dịch này?')) return;
    setIsSaving(true);
    const { error } = await supabase.from('transactions').delete().eq('id', editData.id);
    setIsSaving(false);
    if (error) alert('Lỗi: ' + error.message);
    else onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-end justify-center transition-opacity">
      <div className="bg-matte-gray w-full max-w-md rounded-t-3xl p-6 animate-[slideUp_0.3s_ease-out]">
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
            {editData ? 'Sửa' : 'Thêm'} {isIncome ? 'Thu Nhập' : 'Chi Tiêu'}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Số tiền</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0 đ" className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-4 text-2xl font-bold text-white focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Hạng mục</label>
              {!isAddingNew ? (
                <select value={category} onChange={(e) => { if (e.target.value === 'ADD_NEW') setIsAddingNew(true); else setCategory(e.target.value); }} className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white focus:outline-none">
                  {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  <option value="ADD_NEW" className="font-bold text-blue-400">+ Thêm mới...</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input type="text" autoFocus value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nhập tên..." className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white focus:outline-none" />
                  <button type="button" onClick={() => setIsAddingNew(false)} className="p-3 bg-gray-800 rounded-xl text-gray-400"><X size={16} /></button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Ngày</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Ghi chú</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Vd: Tiền cà phê..." className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white focus:outline-none" />
          </div>

          <div className="flex gap-2 mt-4">
            {editData && (
              <button type="button" onClick={handleDelete} className="p-4 bg-gray-800 rounded-xl text-red-500 hover:bg-gray-700">
                <Trash2 size={24} />
              </button>
            )}
            <button type="submit" disabled={isSaving} className={`flex-1 py-4 rounded-xl text-lg font-bold text-black ${isIncome ? 'bg-green-400' : 'bg-red-400'}`}>
              {isSaving ? 'Đang lưu...' : 'Lưu Giao Dịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}