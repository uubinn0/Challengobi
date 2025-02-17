import React, { useState } from "react";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ko } from 'date-fns/locale';
import styles from "./AddModal.module.scss";
import SuccessModal from './SuccessModal';
import ChallengeAPI from '../../features/challenge/api';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddModal: React.FC<AddModalProps> = ({ isOpen, onClose }) => {
  // 내일 날짜 계산
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);  // 시간을 00:00:00으로 설정

  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    startDate: tomorrow, // 기본값을 내일로 설정
    period: "",
    price: "",
    people: "",
    isPrivate: true  // 기본값을 private으로 설정
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = [
    { value: 1, label: '카페/디저트' },
    { value: 2, label: '외식' },
    { value: 3, label: '장보기' },
    { value: 4, label: '쇼핑' },
    { value: 5, label: '문화생활' },
    { value: 6, label: '취미/여가' },
    { value: 7, label: '술/담배' },
    { value: 8, label: '교통' },
    { value: 9, label: '기타' }
  ];

  const periods = [
    { value: '7', label: '7일' },
    { value: '14', label: '14일' },
    { value: '21', label: '21일' },
    { value: '28', label: '28일' }
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // API에 전송할 데이터 형식에 맞게 변환
      const challengeData = {
        challenge_category: Number(formData.category),
        creator_id: 1,
        challenge_title: formData.title,
        challenge_info: formData.description,
        period: Number(formData.period),
        start_date: formData.startDate,
        budget: Number(formData.price),
        max_participants: Number(formData.people),
        is_private: formData.isPrivate  // isPrivate 값을 is_private으로 전송
      };

      // 챌린지 생성 API 호출
      await ChallengeAPI.createChallenge(challengeData);
      
      // 성공 모달 표시
      setShowSuccess(true);
    } catch (error) {
      console.error('챌린지 생성 실패:', error);
      alert('챌린지 생성에 실패했습니다. 다시 시도해주세요.');
    }
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

  const handlePrivacyToggle = (isPrivate: boolean) => {
    setFormData(prev => ({
      ...prev,
      isPrivate
    }));
  };

  // 모든 필드가 채워졌는지 확인하는 함수
  const isFormValid = () => {
    return (
      formData.category !== "" &&
      formData.title.trim() !== "" &&
      formData.description.trim() !== "" &&
      formData.period !== "" &&
      formData.price.trim() !== "" &&
      formData.people.trim() !== ""
    );
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
                  <option key={category.value} value={category.value}>{category.label}</option>
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
                  minDate={tomorrow}
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

            <div className={styles.formGroup}>
              <label>챌린지 공개 여부</label>
              <div className={styles.privacyButtons}>
                <button
                  type="button"
                  className={`${styles.privacyButton} ${formData.isPrivate ? styles.active : ''}`}
                  onClick={() => handlePrivacyToggle(true)}
                >
                  Private
                </button>
                <button
                  type="button"
                  className={`${styles.privacyButton} ${!formData.isPrivate ? styles.active : ''}`}
                  onClick={() => handlePrivacyToggle(false)}
                >
                  Public
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className={`${styles.submitButton} ${!isFormValid() ? styles.disabled : ''}`}
              disabled={!isFormValid()}
            >
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