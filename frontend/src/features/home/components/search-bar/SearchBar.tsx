import type React from "react"
import { useState } from "react"
import styles from "./SearchBar.module.scss"
import { Search } from "lucide-react"

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={styles.searchContainer}>
      <Search className={styles.searchIcon} size={20} color="#806e61" />
      <input 
        type="text" 
        className={styles.searchInput} 
        placeholder="챌린지 검색하기" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button 
        className={styles.searchButton}
        onClick={handleSearch}
      >
        검색
      </button>
    </div>
  )
}

export default SearchBar

