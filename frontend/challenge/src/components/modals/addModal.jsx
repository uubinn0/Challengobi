import React from "react";
import styles from "./AddModal.module.scss";

const AddModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;  // 모달이 닫혀있으면 렌더링 안 함

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Add New Item</h2>
        <p>여기에 원하는 추가 UI를 넣으세요.</p>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default AddModal;
