<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center bg-grey-1">
        <div class="q-pa-md text-center" style="max-width: 600px">
          <q-icon name="block" color="negative" size="xl" class="q-mb-md" />
          <h4 class="text-weight-bold q-mb-sm">Conta Inativa</h4>
          <p class="text-body1 q-mb-lg">
            Sua conta está atualmente inativa. Entre em contato com o administrador do sistema para
            mais informações.
          </p>

          <div class="q-mt-lg">
            <q-btn color="primary" label="Voltar ao login" @click="$router.push('/login')" />
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'InactiveAccountPage',
}
</script>

<style scoped>
.q-page {
  min-height: 100vh;
}
</style>
