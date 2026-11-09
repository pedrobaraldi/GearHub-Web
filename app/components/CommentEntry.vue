<template>
  <div class="flex items-start gap-3">
    <UserPhoto :src="comment.author.avatarUrl" :name="comment.author.displayName" class="shrink-0 text-xs" :class="reply ? 'w-6 h-6' : 'w-8 h-8'" />
    <div class="flex-1 min-w-0">
      <p class="text-xs text-gear-muted">
        <NuxtLink :to="`/profile/${comment.author.username}`" class="text-sm font-semibold text-gear-text hover:underline underline-offset-2">{{ comment.author.displayName }}</NuxtLink>
        · {{ formatDate(comment.createdAt) }}
      </p>
      <p class="text-sm text-gear-text-secondary whitespace-pre-line break-words mt-0.5">
        <span v-if="comment.replyTo" class="font-medium text-gear-primary mr-1">@{{ comment.replyTo }}</span>{{ comment.body }}
      </p>
      <div class="flex items-center gap-3 sm:mt-1 text-xs font-medium text-gear-muted">
        <button type="button" class="py-2.5 sm:py-0 transition-colors" :class="comment.likedByMe ? 'text-gear-accent' : 'hover:text-gear-text'" :aria-pressed="comment.likedByMe" @click="$emit('like')">
          Curtir ({{ comment.likeCount }})
        </button>
        <button type="button" class="py-2.5 sm:py-0 hover:text-gear-text transition-colors" @click="$emit('reply')">Responder</button>
        <button v-if="comment.mine" type="button" class="py-2.5 sm:py-0 hover:text-gear-red transition-colors" @click="$emit('remove')">Apagar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/composables/useGearData'
import type { CommentItem } from '~/composables/useInteractions'

defineProps<{ comment: CommentItem, reply?: boolean }>()
defineEmits<{ like: [], reply: [], remove: [] }>()
</script>
