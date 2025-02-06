import type React from "react"
import styles from "./SearchBar.module.scss"
import { Search } from "lucide-react"

const SearchBar: React.FC = () => {
  return (
    <div className={styles.searchContainer}>
      <Search className={styles.searchIcon} size={20} color="#806e61" />
      <input type="text" className={styles.searchInput} placeholder="챌린지 검색하기" />
    </div>
  )
}

export default SearchBar

