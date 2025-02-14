import React, { useState } from 'react';
import './KeywordSelect.css';

interface KeywordSelectProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (selectedKeywords: string[]) => void;
}

const KeywordSelect: React.FC<KeywordSelectProps> = ({ isOpen, onClose, onComplete }) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  const keywords = [
    '식비', '카페/간식', '술/유흥',
    '생활', '쇼핑', '패션/미용',
    '교통', '주거/통신', '의료/건강'
  ];

  const handleKeywordClick = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };

  const handleComplete = () => {
    onComplete(selectedKeywords);
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
      <h3>거의 다 왔어요!</h3>
      <p>어떤 소비를 줄이고 싶나요?</p>
        <div className="popup-buttons">
          {keywords.map((keyword) => (
            <button
              key={keyword}
              className={`popup-button ${selectedKeywords.includes(keyword) ? 'selected' : ''}`}
              onClick={() => handleKeywordClick(keyword)}
            >
              {keyword}
            </button>
          ))}
        </div>
        <div className="popup-action-buttons">
          <button className="cancel-button" onClick={onClose}>
            취소
          </button>
          <button
            className="complete-button"
            onClick={handleComplete}
            disabled={selectedKeywords.length === 0}
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeywordSelect;
