import React from 'react';
import styles from './SearchBar.module.scss';

function SearchBar({ placeholder = "검색어를 입력하세요" }) {
  return (
    <div className={styles.searchContainer}>
      <input type="text" className={styles.searchInput} placeholder={placeholder} />
    </div>
  );
}

export default SearchBar;
