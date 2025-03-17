import axios from 'axios'

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'

export default {
  // Category methods
  async getCategories() {
    try {
      const response = await axios.get(`${API_URL}/categories`)
      return response.data
    } catch (error) {
      throw new Error('Erro ao buscar categorias: ' + error.message)
    }
  },

  async createCategory(category) {
    try {
      const response = await axios.post(`${API_URL}/categories`, category)
      return response.data
    } catch (error) {
      throw new Error('Erro ao criar categoria: ' + error.message)
    }
  },

  async updateCategory(id, category) {
    try {
      const response = await axios.put(`${API_URL}/categories/${id}`, category)
      return response.data
    } catch (error) {
      throw new Error('Erro ao atualizar categoria: ' + error.message)
    }
  },

  async deleteCategory(id) {
    try {
      const response = await axios.delete(`${API_URL}/categories/${id}`)
      return response.data
    } catch (error) {
      throw new Error('Erro ao excluir categoria: ' + error.message)
    }
  },

  // Product methods
  async getProducts() {
    try {
      const response = await axios.get(`${API_URL}/products`)
      // Include categories information
      const products = response.data.map(async (product) => {
        if (product.category_id) {
          const category = await axios.get(`${API_URL}/categories/${product.category_id}`)
          return {
            ...product,
            stock: product.quantity, // Map quantity to stock
            category: category.data,
          }
        }
        return {
          ...product,
          stock: product.quantity, // Map quantity to stock
          category: null,
        }
      })
      return Promise.all(products)
    } catch (error) {
      throw new Error('Erro ao buscar produtos: ' + error.message)
    }
  },

  async getProduct(id) {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`)
      const product = response.data
      product.stock = product.quantity // Map quantity to stock

      if (product.category_ids && product.category_ids.length > 0) {
        const categories = await Promise.all(
          product.category_ids.map((id) => {
            return axios.get(`${API_URL}/categories/${id}`)
          }),
        )
        return {
          ...product,
          categories: categories.map((c) => c.data),
        }
      }
      return {
        ...product,
        categories: [],
      }
    } catch (error) {
      throw new Error('Erro ao buscar produto: ' + error.message)
    }
  },

  async createProduct(product) {
    try {
      if (!product.code) {
        throw new Error('Código do produto é obrigatório')
      }
      const response = await axios.post(`${API_URL}/products`, {
        ...product,
        quantity: product.stock, // Map stock to quantity
        image_url: product.image_url || null,
        price_with_tax: product.taxable ? product.price * 1.14 : null,
      })

      // Fetch category if it exists
      const createdProduct = response.data
      createdProduct.stock = createdProduct.quantity // Map quantity to stock

      if (product.category_id) {
        const category = await axios.get(`${API_URL}/categories/${product.category_id}`)
        return {
          ...product,
          category: category.data,
        }
      }
      return {
        ...product,
        category: null,
      }
    } catch (error) {
      throw new Error('Erro ao criar produto: ' + error.message)
    }
  },

  async updateProduct(id, product) {
    try {
      if (!product.code) {
        throw new Error('Código do produto é obrigatório')
      }
      const response = await axios.put(`${API_URL}/products/${id}`, {
        ...product,
        quantity: product.stock, // Map stock to quantity
        image_url: product.image_url || null,
        price_with_tax: product.taxable ? product.price * 1.14 : null,
      })

      // Fetch category if it exists
      const updatedProduct = response.data
      updatedProduct.stock = updatedProduct.quantity // Map quantity to stock

      if (updatedProduct.category_id) {
        const category = await axios.get(`${API_URL}/categories/${updatedProduct.category_id}`)
        return {
          ...updatedProduct,
          category: category.data,
        }
      }
      return {
        ...updatedProduct,
        category: null,
      }
    } catch (error) {
      throw new Error('Erro ao atualizar produto: ' + error.message)
    }
  },

  async deleteProduct(id) {
    try {
      // First check if product exists
      const product = await this.getProduct(id)
      if (!product) {
        throw new Error('Produto não encontrado')
      }

      // Delete the product
      const response = await axios.delete(`${API_URL}/products/${id}`)
      return response.data
    } catch (error) {
      throw new Error('Erro ao excluir produto: ' + error.message)
    }
  },

  // Export products to Excel
  async uploadImage(file) {
    try {
      const response = await axios.post(`${API_URL}/upload`, file, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw new Error('Erro ao fazer upload da imagem: ' + error.message)
    }
  },

  async exportProducts(products) {
    try {
      const XLSX = await import('xlsx')

      // Prepare worksheet data
      const data = products.map((product) => ({
        Código: product.code,
        Nome: product.name,
        Descrição: product.description,
        Categoria: product.category?.name || 'Sem categoria',
        Preço: product.price,
        Estoque: product.stock,
        'Criado em': new Date(product.created_at).toLocaleDateString(),
        'Atualizado em': new Date(product.updated_at).toLocaleDateString(),
      }))

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(data)

      // Create workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos')

      // Generate Excel file as binary string
      const wbout = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'binary',
      })

      // Convert to ArrayBuffer
      const buffer = new ArrayBuffer(wbout.length)
      const view = new Uint8Array(buffer)
      for (let i = 0; i < wbout.length; i++) {
        view[i] = wbout.charCodeAt(i) & 0xff
      }

      return buffer
    } catch (error) {
      throw new Error('Erro ao exportar produtos: ' + error.message)
    }
  },
}
