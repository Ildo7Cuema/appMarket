<template>
  <q-layout class="bg-blue-7">
    <q-page-container>
      <q-page class="subscription-page">
        <div class="hero-section text-center q-mt-lg">
          <div class="text-h6 text-weight-bold q-mb-sm">
            Informações de activação
            <q-icon name="workspace_premium" size="50px" color="yellow-5"></q-icon>
          </div>
          <div class="text-sm text-yellow-4">
            <div></div>
            Status atual da sua assinatura (<span class="text-bold text-red-8"> Expirada *</span>)

            <div class="contact-info">
              <q-btn
                flat
                color="indigo-1"
                dense
                icon="email"
                label="suporte@appmarket2.com"
                type="a"
                href="mailto:suporte@appmarket.com"
              />
              <q-btn
                flat
                color="indigo-1"
                dense
                icon="phone"
                label="+244 921 923 232"
                type="a"
                href="tel:+244921923232"
                class="q-ml-md"
              />
              <q-btn
                flat
                color="indigo-1"
                dense
                icon="location_on"
                label="Huíla, Angola"
                class="q-ml-md"
              />
            </div>
          </div>
        </div>

        <div class="status-container">
          <q-card class="status-card">
            <q-card-section>
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-md-12">
                  <q-card class="q-pa-md">
                    <div class="row q-mb-md">
                      <div class="text-h6">Preços por Período</div>
                      <q-space />

                      <div class="text-sm text-red-14 text-center">
                        <q-btn flat to="/login"><q-icon name="lock" size="lg"></q-icon></q-btn>
                        <q-icon name="workspace_premium" size="lg" color="yellow-5"></q-icon>
                        Adquira uma activação
                      </div>
                    </div>
                    <div class="row">
                      <q-list class="row text-indigo-5">
                        <q-item class="col-6 q-pt-none">
                          <q-item-section avatar>
                            <q-icon name="event" color="primary" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label
                              >Mensal: {{ currentPlan.pricingDetails.mensal }}</q-item-label
                            >
                          </q-item-section>
                        </q-item>
                        <q-item class="col-6 q-pt-none">
                          <q-item-section avatar>
                            <q-icon name="event" color="primary" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label
                              >Trimestral: {{ currentPlan.pricingDetails.trimestral }}</q-item-label
                            >
                          </q-item-section>
                        </q-item>

                        <q-item class="col-6 q-pt-none">
                          <q-item-section avatar>
                            <q-icon name="event_note" color="primary" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label
                              >Semestral: {{ currentPlan.pricingDetails.semestral }}</q-item-label
                            >
                          </q-item-section>
                        </q-item>

                        <q-item class="col-6 q-pt-none">
                          <q-item-section avatar>
                            <q-icon name="event_available" color="primary" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label
                              >Anual: {{ currentPlan.pricingDetails.anual }}</q-item-label
                            >
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                  </q-card>
                </div>
              </div>

              <q-card class="q-pa-md q-mb-md">
                <div class="row text-h6 q-mb-md text-center">
                  <div class="col-12">Benefícios Incluídos</div>
                </div>
                <div class="row q-col-gutter-md">
                  <div
                    v-for="(benefit, index) in currentPlan.benefits"
                    :key="index"
                    class="col-12 col-md-6"
                  >
                    <q-item class="q-mt-none">
                      <q-item-section avatar>
                        <q-icon name="check_circle" color="positive" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ benefit }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                </div>
              </q-card>
            </q-card-section>
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
const currentPlan = {
  name: 'Profissional',
  description: 'Para empresas em crescimento',
  price: '25.000 Kz/mês',
  expiration: '31/12/2025',
  features: [
    'Até 20 usuários',
    'Suporte prioritário',
    'Relatórios avançados',
    '5GB de armazenamento',
    'Integração com ERP',
  ],
  pricingDetails: {
    mensal: '25.000,00 Kz',
    trimestral: '75.000,00 Kz',
    semestral: '150.000,00 Kz',
    anual: '248.000,00 Kz',
  },
  benefits: [
    'Relatórios detalhados',
    'Gestão de estoque',
    'Controle de vendas',
    'Gestão de funcionários',
    'Suporte prioritário 24/7',
  ],
}
</script>

<style scoped>
.q-card {
  max-width: 800px;
  margin: 0 auto;
}
</style>
