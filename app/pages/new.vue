<template>
  <ReviewForm v-if="route.query.tipo === 'review'" :key="'review'" />
  <PostForm v-else :key="'post'" />
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Nova publicação · GearHub' })

const route = useRoute()
</script>
