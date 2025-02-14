import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ConsumImage.css';

interface ConsumItem {
  id: number;
  place: string;
  time: string;
  amount: number;
  initialAmount: number;
  checked: boolean;
}

export const ConsumImage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ConsumItem[]>([
    { id: 1, place: 'GS25 한밭대점', time: '08:24', amount: 2400, initialAmount: 2400, checked: true },
    { id: 2, place: '아빠손칼국수', time: '12:22', amount: 31000, initialAmount: 31000, checked: false },
    { id: 3, place: '스타벅스 유성점', time: '12:51', amount: 6700, initialAmount: 6700, checked: false },
    { id: 4, place: '이마트 월평점', time: '19:24', amount: 32500, initialAmount: 32500, checked: true },
    { id: 5, place: '이이스크림 할인점', time: '20:48', amount: 2400, initialAmount: 2400, checked: false },
  ]);

  const [editingItem, setEditingItem] = useState<{
    id: number;
    amount: string;
    place: string;
    time: string;
  } | null>(null);

  const handleCheckboxChange = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleItemClick = (id: number, amount: number, place: string, time: string) => {
    setEditingItem({ 
      id, 
      amount: amount.toString(),
      place,
      time
    });
  };

  const handleAmountChange = (value: string) => {
    if (editingItem) {
      if (value === '') {
        setEditingItem({ ...editingItem, amount: '' });
      } else {
        const numValue = parseInt(value) || 0;
        if (numValue >= 0) {
          setEditingItem({ ...editingItem, amount: numValue.toString() });
        }
      }
    }
  };

  const handleAmountSubmit = () => {
    if (editingItem) {
      setItems(items.map(item =>
        item.id === editingItem.id 
          ? { ...item, amount: parseInt(editingItem.amount) || 0 }
          : item
      ));
      setEditingItem(null);
    }
  };

  const totalAmount = items
    .filter(item => item.checked)
    .reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = () => {
    navigate('/challenge/ocr-complete');
  };

  return (
    <div className="consum-container">
      <h2 className="title">소비내역 선택</h2>
      <p className="subtitle">챌린지에 해당하는 소비를 선택하세요!</p>
      
      <div className="items-list">
        {items.map(item => (
          <div key={item.id} className="item">
            <div 
              className="item-info" 
              onClick={() => handleItemClick(item.id, item.amount, item.place, item.time)}
            >
              <div className="place-time">
                <span className="place">{item.place}</span>
                <span className="time">{item.time}</span>
              </div>
              <span className="amount">{item.amount.toLocaleString()}원</span>
            </div>
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => handleCheckboxChange(item.id)}
              className="checkbox"
            />
          </div>
        ))}
      </div>

      {editingItem && (
        <div className="edit-popup">
          <div className="edit-popup-content">
            <div className="edit-popup-header">
              <div className="edit-popup-place">{editingItem.place}</div>
              <div className="edit-popup-time">{editingItem.time}</div>
            </div>
            <div className="edit-popup-input-group">
              <input
                type="number"
                min="0"
                value={editingItem.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="edit-input"
                placeholder={items.find(item => item.id === editingItem.id)?.initialAmount.toString()}
              />
              <span className="edit-input-currency">원</span>
            </div>
            <button onClick={handleAmountSubmit} className="edit-submit">
              확인
            </button>
          </div>
        </div>
      )}

      <div className="total-section">
        <p>총 {totalAmount.toLocaleString()}원을 소비했어요.<br/>남은 금액 50,000원에서 차감돼요.</p>
      </div>

      <button className="submit-button" onClick={handleSubmit}>제출</button>
    </div>
  );
};

export default ConsumImage;
