<template>
  <article v-if="!removed" class="reveal space-y-4" v-reveal>
    <UserAvatar :user="toUser(item.author)" :meta="meta" />

    <div class="glass-card neon-hover group overflow-hidden">
      <MediaGallery v-if="item.images.length" :images="item.images" :alt="`Imagem de ${item.author.displayName}`" />

      <div class="p-6 lg:p-8">
        <h2 v-if="item.title" class="text-xl sm:text-2xl font-semibold tracking-tight leading-snug mb-2">{{ item.title }}</h2>
        <p class="text-sm text-gear-text-secondary leading-relaxed whitespace-pre-line break-words">{{ item.body }}</p>

        <ul v-if="item.tags.length" class="flex flex-wrap gap-x-3 gap-y-1 mt-3" aria-label="Tags">
          <li v-for="tag in item.tags" :key="tag" class="text-xs font-medium text-gear-accent">#{{ tag }}</li>
        </ul>

        <ContentActions
          class="mt-6"
          kind="post"
          :id="item.id"
          :like-count="item.likeCount"
          :comment-count="item.commentCount"
          :liked-by-me="item.likedByMe"
          :saved-by-me="item.savedByMe"
          :mine="item.mine"
          @deleted="removed = true"
        />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { FeedItem } from '~/composables/useFeed'
import { toUser } from '~/composables/useFeed'
import { formatDate } from '~/composables/useGearData'

const props = defineProps<{ item: FeedItem }>()

const removed = ref(false)
const meta = computed(() =>
  [formatDate(props.item.createdAt), props.item.category].filter(Boolean).join(' · '),
)
</script>
