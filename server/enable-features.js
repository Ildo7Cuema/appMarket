import fs from 'fs'

const FEATURES_FILE = new URL('./enabled-features.json', import.meta.url).pathname.replace(
  /^\/([a-z]:)/i,
  '$1',
)

const features = {
  sales: true,
  stock: true,
  reports: true,
  admin: true,
}

try {
  fs.writeFileSync(FEATURES_FILE, JSON.stringify(features, null, 2))
  console.log('Funcionalidades ativadas com sucesso')
  process.exit(0)
} catch (error) {
  console.error('Erro ao ativar funcionalidades:', error)
  process.exit(1)
}
