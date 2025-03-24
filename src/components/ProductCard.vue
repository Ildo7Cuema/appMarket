<template>
  <q-card class="product-card">
    <q-img :src="imageUrl" style="height: 140px" fit="contain" @error="handleImageError" />
    <q-card-section>
      <div class="text-subtitle2">{{ product.name }}</div>
      <div class="text-caption">{{ product.code }}</div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { getFullImageUrl, DEFAULT_IMAGE_URL } from '../config/api'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

// Adicionar console.log para depurar as URLs das imagens
console.log('URL da imagem do produto no ProductCard:', props.product.image_url)
const imageUrl = computed(() => {
  return getFullImageUrl(props.product.image_url)
})

function handleImageError(evt) {
  console.error('Erro ao carregar imagem do produto', evt)
  evt.target.src = DEFAULT_IMAGE_URL
}
</script>

<style scoped>
.product-card {
  width: 100%;
  max-width: 250px;
}
</style>
