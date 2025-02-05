import { useNavigate } from 'react-router-dom';
import fishImage from '../../../../assets/ocr-fish.png';
import './OcrComplete.css';

const OcrComplete = () => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/challenge/progress');
  };

  return (
    <div className="ocr-complete-container">
      <img src={fishImage} alt="OCR Complete Fish" className="ocr-fish-image" />
      <div className="ocr-complete-text">
        <p>인증을 완료했습니다</p>
        <p>축하해요!</p>
        <p>한층 더 자린고비에</p>
        <p>가까워졌어요!</p>
      </div>
      <button className="home-button" onClick={handleHomeClick}>
        홈으로 가기
      </button>
    </div>
  );
};

export default OcrComplete;
