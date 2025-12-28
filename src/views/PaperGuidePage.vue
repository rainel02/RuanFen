<template>
  <div class="paper-guide-page">
    <AppHeader />

    <div class="page-content">
      <div class="container">
        <transition name="fade" mode="out-in">
          <UploadZone v-if="!store.hasPaper" />
          <ReadingGuide v-else />
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppHeader from '../components/AppHeader.vue';
import UploadZone from '../components/guide/UploadZone.vue';
import ReadingGuide from '../components/guide/ReadingGuide.vue';
import { usePaperGuideStore } from '../stores/paperGuide';

const store = usePaperGuideStore();

onMounted(() => {
  store.loadFromStorage();
});
</script>

<style scoped lang="scss">
.paper-guide-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;

  .page-content {
    flex: 1;
    padding: 20px;
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      min-height: calc(100vh - 100px);
      overflow: hidden;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
