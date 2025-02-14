import React, { useState } from "react";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ko } from 'date-fns/locale';
import styles from "./AddModal.module.scss";
import SuccessModal from './SuccessModal';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddModal: React.FC<AddModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    startDate: new Date(),
    period: "",
    price: "",
    people: ""
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = [
    '외식', '장보기', '카페/디저트',
    '교통', '문화생활', '쇼핑',
    '취미/여가', '술/담배', '기타'
  ];

  const periods = [
    { value: '7', label: '7일' },
    { value: '14', label: '14일' },
    { value: '21', label: '21일' },
    { value: '28', label: '28일' }
  ];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 추후 백엔드 통신을 위한 데이터 준비
    const challengeData = {
      ...formData,
      startDate: formData.startDate.toISOString(),
      currentMembers: 1,
      maxMembers: parseInt(formData.people),
      likes: 0,
      wants: 0,
    };

    // 추후 백엔드 API 호출 예정
    console.log('Challenge Data to be sent:', challengeData);
    
    setShowSuccess(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date: Date | null): void => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        startDate: date
      }));
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose();
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <h2 className={styles.title}>새로운 챌린지 만들기</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>챌린지 카테고리</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="">선택</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>챌린지 제목</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="제목을 입력하세요"
              />
            </div>

            <div className={styles.formGroup}>
              <label>챌린지 설명</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="챌린지에 대한 설명을 입력하세요"
              />
            </div>

            <div className={styles.formGroup}>
              <label>챌린지 시작일</label>
              <div className={styles.calendarWrapper}>
                <DatePicker
                  selected={formData.startDate}
                  onChange={handleDateChange}
                  dateFormat="yyyy년 MM월 dd일"
                  className={styles.dateInput}
                  locale={ko}
                  minDate={new Date()}
                  customInput={
                    <input
                      className={styles.dateInput}
                      value={formData.startDate ? formData.startDate.toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      }) : ''}
                      readOnly
                      placeholder="날짜를 선택하세요"
                    />
                  }
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>챌린지 기간</label>
              <select name="period" value={formData.period} onChange={handleChange}>
                <option value="">선택</option>
                {periods.map((period) => (
                  <option key={period.value} value={period.value}>{period.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>챌린지 금액</label>
              <div className={styles.inputWithUnit}>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="1000"
                  min="0"
                />
                <span className={styles.unit}>원</span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>챌린지 인원</label>
              <div className={styles.inputWithUnit}>
                <input
                  type="number"
                  name="people"
                  value={formData.people}
                  onChange={handleChange}
                  min="1"
                />
                <span className={styles.unit}>명</span>
              </div>
            </div>

            <button type="submit" className={styles.submitButton}>
              챌린지 등록하기
            </button>
          </form>
        </div>
      </div>
      <SuccessModal 
        isOpen={showSuccess} 
        onClose={handleSuccessClose}
      />
    </>
  );
};

export default AddModal;