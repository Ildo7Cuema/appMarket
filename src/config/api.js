// Configuração da API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
export const DEFAULT_IMAGE_URL = '/images/product-placeholder.png'

// Função para obter URL completa de imagens
export function getFullImageUrl(url) {
  console.log('getFullImageUrl recebeu:', url)

  if (!url) {
    console.log('URL vazia, retornando placeholder')
    return DEFAULT_IMAGE_URL
  }

  // Se a URL já começar com http, retorná-la diretamente
  if (url.startsWith('http')) {
    console.log('URL já tem http, retornando original:', url)
    return url
  }

  // Se a URL começar com /uploads, usar a URL base da API
  if (url.startsWith('/uploads')) {
    const fullUrl = `${API_BASE_URL}${url}`
    console.log('URL construída com base para uploads:', fullUrl)
    return fullUrl
  }

  // Caso contrário, prefixar com a URL base da API
  const fullUrl = `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
  console.log('URL construída com base:', fullUrl)
  return fullUrl
}

// Log para debug
console.log('API_BASE_URL configurada como:', API_BASE_URL)
