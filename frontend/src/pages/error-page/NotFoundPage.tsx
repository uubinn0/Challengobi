import React from 'react';
import notFoundImage from '../../assets/notFoundImage.png';

const NotFoundPage: React.FC = () => {
  return (
    <div>
      <img src={notFoundImage} alt="Not Found" />
      <h1>페이지를 찾을 수 없습니다</h1>
      <p>찾으시는 페이지가 존재하지 않습니다.</p>
    </div>
  );
};

export default NotFoundPage; 