import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ConsumImage.css';

interface ConsumItem {
  id: number;
  place: string;
  time: string;
  amount: number;
  initialAmount: number;
  checked: boolean;
}

interface OcrResultItem {
  store: string;
  time: string;
  amount: string;
}

export const ConsumImage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ConsumItem[]>([]);

  useEffect(() => {
    // 세션 스토리지에서 OCR 결과 가져오기
    const ocrResults = sessionStorage.getItem('ocrResults');
    if (ocrResults) {
      try {
        const parsedResults = JSON.parse(ocrResults);
        console.log('Original OCR results:', parsedResults);

        // 결과 데이터 구조 처리
        let resultsArray = [];
        if (parsedResults[0]?.results) {
          // results 배열에서 데이터 추출
          resultsArray = parsedResults[0].results.map((item: any) => ({
            store: item.store,
            amount: item.expense,
            time: '' // 시간 정보가 없는 경우 빈 문자열
          }));
        }

        console.log('Formatted results:', resultsArray);

        // OCR 결과를 ConsumItem 형식으로 변환
        const formattedItems = resultsArray.map((item: OcrResultItem, index: number) => ({
          id: index + 1,
          place: item.store || '알 수 없는 가맹점',
          time: item.time || '',
          amount: parseInt(String(item.amount)) || 0,
          initialAmount: parseInt(String(item.amount)) || 0,
          checked: false
        }));

        console.log('Final formatted items:', formattedItems);
        setItems(formattedItems);
      } catch (error) {
        console.error('OCR 결과 파싱 오류:', error);
        // 오류 발생 시 빈 배열로 초기화
        setItems([]);
      }
    }
  }, []);

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

  const handleSubmit = async () => {
    const selectedItems = items.filter(item => item.checked);
    const challengeId = sessionStorage.getItem('currentChallengeId');

    if (!challengeId) {
      alert('챌린지 정보를 찾을 수 없습니다.');
      navigate('/challenge');
      return;
    }
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      await axios.post(
        `http://localhost:8000/api/challenges/${challengeId}/expenses/ocr_save/`,
        {
          selected: selectedItems.map(item => ({
            store: item.place,
            amount: item.amount,
            payment_date: new Date().toISOString().split('T')[0]
          }))
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        }
      );
      
      navigate('/challenge/ocr-complete');
    } catch (error) {
      console.error('데이터 저장 중 오류 발생:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('access_token');
        navigate('/login');
        return;
      }
      alert('데이터 저장 중 오류가 발생했습니다.');
    }
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
