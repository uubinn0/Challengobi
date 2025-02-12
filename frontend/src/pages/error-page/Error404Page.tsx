import React from 'react';
import error404Image from '../../assets/error-404.png';

const Error404Page: React.FC = () => {
  return (
    <div>
      <img src={error404Image} alt="404 Error" />
      <h1>404 에러</h1>
      <p>죄송합니다! 찾으시는 페이지가 없습니다.</p>
    </div>
  );
};

export default Error404Page;