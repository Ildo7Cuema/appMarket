import CryptoJS from 'crypto-js'

const SECRET_KEY = process.env.VUE_APP_CRYPTO_SECRET || 'default-secret-key'

export default {
  encrypt(data) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()
  },

  decrypt(ciphertext) {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY)
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
    } catch (error) {
      console.error('Decryption failed:', error)
      return null
    }
  },

  generateKey() {
    return CryptoJS.lib.WordArray.random(256 / 8).toString()
  },
}
