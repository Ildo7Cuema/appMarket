import fs from 'fs'

const FEATURES_FILE = new URL('./enabled-features.json', import.meta.url).pathname.replace(
  /^\/([a-z]:)/i,
  '$1',
)

try {
  if (fs.existsSync(FEATURES_FILE)) {
    fs.unlinkSync(FEATURES_FILE)
  }
  console.log('Funcionalidades desativadas com sucesso')
  process.exit(0)
} catch (error) {
  console.error('Erro ao desativar funcionalidades:', error)
  process.exit(1)
}
