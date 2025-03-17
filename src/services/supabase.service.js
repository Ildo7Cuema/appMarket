import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sjnrmclxdfgrmqnxhqzf.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqbnJtY2x4ZGZncm1xbnhocXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4NTg1MTYsImV4cCI6MjA1NzQzNDUxNn0.QZeHbhKw1RqzMbpkhgOQJC1lgLzspZivf7nQcRBS7Ww'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Funções básicas de autenticação
export const auth = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  },
}

// Funções de gerenciamento de assinaturas
export const subscriptions = {
  async createSubscription(userId, plan, period) {
    const { data, error } = await supabase
      .from('Assinaturas')
      .insert([
        {
          user_id: userId,
          plan,
          period,
          status: 'active',
          start_date: new Date().toISOString(),
        },
      ])
      .select()
    return { data, error }
  },

  async getSubscription(userId) {
    const { data, error } = await supabase
      .from('Assinaturas')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },
}
