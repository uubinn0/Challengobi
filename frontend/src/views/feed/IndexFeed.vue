<template>
  <div class="feed newsfeed">
    <div class="wrapB">
      <h1>뉴스피드</h1>

      <!-- 실제 피드 데이터를 기반으로 동적 렌더링 -->
      <FeedItem v-for="(feed, index) in feeds" :key="feed.id || index" :feed="feed" />

      <!-- 데이터가 없을 때 표시할 상태 -->
      <div v-if="!feeds.length" class="empty-state">표시할 피드가 없습니다.</div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import FeedItem from '@/components/feed/FeedItem.vue'

export default {
  name: 'IndexFeed',

  components: {
    FeedItem,
  },

  props: {
    keyword: {
      type: String,
      default: '',
    },
  },

  setup(props) {
    const feeds = ref([])

    // 피드 데이터 가져오기
    const fetchFeeds = async () => {
      try {
        // API 호출 로직
        // const response = await feedService.getFeeds(props.keyword)
        // feeds.value = response.data
      } catch (error) {
        console.error('피드 로딩 실패:', error)
      }
    }

    onMounted(fetchFeeds)

    return {
      feeds,
    }
  },
}
</script>

<style lang="scss">
@import '@/components/css/feed/feed-item.scss';
@import '@/components/css/feed/newsfeed.scss';

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>
