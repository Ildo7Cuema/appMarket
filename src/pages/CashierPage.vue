<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Cashier Dashboard</div>

    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h6">Sales Operations</div>

        <q-list bordered>
          <q-item clickable v-ripple>
            <q-item-section>
              <q-item-label>New Sale</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section>
              <q-item-label>Sales History</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  const role = localStorage.getItem('role')
  if (role !== 'cashier') {
    router.push('/')
  }
})
</script>
