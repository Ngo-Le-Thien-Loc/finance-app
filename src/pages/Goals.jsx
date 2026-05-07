import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Plus } from 'lucide-react';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [itemName, setItemName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  // Tải danh sách mục tiêu từ Cloud
  const fetchGoals = async () => {
    const { data, error } = await supabase.from('saving_goals').select('*');
    if (data) setGoals(data);
    if (error) console.error(error);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // Hàm tạo mục tiêu mới
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!itemName || !targetAmount) return alert('Vui lòng điền đủ thông tin!');

    const { error } = await supabase.from('saving_goals').insert([
      { 
        item_name: itemName, 
        target_amount: parseFloat(targetAmount),
        saved_amount: 0 // Mặc định lúc mới tạo là 0 đồng
      }
    ]);

    if (!error) {
      setItemName('');
      setTargetAmount('');
      setIsAdding(false);
      fetchGoals(); // Tải lại danh sách
    }
  };

  // Hàm nạp thêm tiền vào mục tiêu
  const handleAddMoney = async (goal) => {
    // Dùng hộp thoại mặc định của trình duyệt cho nhanh gọn
    const amountStr = window.prompt(`Bạn muốn cất thêm bao nhiêu tiền để mua "${goal.item_name}"?`);
    if (!amountStr || isNaN(amountStr)) return;

    const newSavedAmount = Number(goal.saved_amount) + Number(amountStr);

    const { error } = await supabase
      .from('saving_goals')
      .update({ saved_amount: newSavedAmount })
      .eq('id', goal.id);

    if (!error) {
      fetchGoals();
    }
  };

  return (
    <div className="pb-24 pt-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kế Hoạch Mua Sắm</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 p-2 rounded-full text-white hover:bg-blue-500 transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Form thêm mục tiêu mới (Ẩn/Hiện khi bấm nút +) */}
      {isAdding && (
        <form onSubmit={handleCreateGoal} className="bg-matte-gray p-4 rounded-xl mb-6 space-y-3 border border-blue-900/50">
          <input 
            type="text" placeholder="Tên món đồ (Vd: Laptop mới)" 
            value={itemName} onChange={(e) => setItemName(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg p-3 text-white focus:outline-none"
          />
          <input 
            type="number" placeholder="Số tiền cần có (Vd: 20000000)" 
            value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg p-3 text-white focus:outline-none"
          />
          <button type="submit" className="w-full bg-blue-600 font-bold py-3 rounded-lg text-white">
            Tạo Mục Tiêu
          </button>
        </form>
      )}

      {/* Danh sách các Thẻ Mục Tiêu */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">Bạn chưa có kế hoạch mua sắm nào.</p>
        ) : (
          goals.map((goal) => {
            const percent = ((goal.saved_amount / goal.target_amount) * 100).toFixed(0);
            const isCompleted = Number(percent) >= 100;

            return (
              <div key={goal.id} className="bg-matte-gray p-5 rounded-2xl shadow-lg border border-gray-800">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{goal.item_name}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${isCompleted ? 'bg-green-900/50 text-green-400' : 'bg-blue-900/50 text-blue-400'}`}>
                    {isCompleted ? 'Đã hoàn thành' : `${percent}%`}
                  </span>
                </div>
                
                <p className="text-sm text-gray-400 mb-3">
                  Đã có: <span className="text-white font-medium">{Number(goal.saved_amount).toLocaleString('vi-VN')} đ</span> 
                  / {Number(goal.target_amount).toLocaleString('vi-VN')} đ
                </p>

                {/* Thanh tiến độ */}
                <div className="w-full bg-black rounded-full h-2 mb-4">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`} 
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  ></div>
                </div>

                {!isCompleted && (
                  <button 
                    onClick={() => handleAddMoney(goal)}
                    className="w-full py-2 rounded-lg border border-gray-700 text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    + Cất thêm tiền
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}