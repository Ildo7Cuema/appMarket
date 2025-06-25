<template>
  <q-page class="category-page">
    <!-- Header com gradiente -->
    <div class="header-section q-px-lg q-pt-lg q-pb-xl">
      <div class="row items-center justify-between">
        <div class="col-12 col-md-8">
          <div class="text-h4 text-weight-bold text-white">Gestão de Categorias</div>
          <div class="text-subtitle1 text-grey-3 q-mt-sm">
            Gerencie as categorias dos produtos do sistema
          </div>
        </div>
      </div>
    </div>

    <div class="content-container q-px-lg q-mt-xl">
      <q-card class="data-table-card">
        <q-card-section class="q-pb-none">
          <div class="row items-center justify-between q-mb-md">
            <div class="column">
              <div class="text-h6 text-weight-bold text-primary">Lista de Categorias</div>
              <div class="text-caption text-grey-7">Gerencie as categorias disponíveis</div>
            </div>
            <q-btn
              color="primary"
              icon="add"
              label="Nova Categoria"
              @click="showDialog = true"
              class="action-btn"
              unelevated
            >
              <q-tooltip>Adicionar nova categoria</q-tooltip>
            </q-btn>
          </div>
          <div class="row items-center q-mb-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model="filter"
                dense
                outlined
                placeholder="Pesquisar categorias..."
                class="search-input"
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="primary" />
                </template>
                <template v-slot:append>
                  <q-icon v-if="filter" name="clear" class="cursor-pointer" @click="filter = ''" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <q-table
            :rows="categories"
            :columns="columns"
            row-key="id"
            :loading="loading"
            flat
            bordered
            dense
            binary-state-sort
            class="modern-table"
            :rows-per-page-options="[10, 20, 50]"
            @row-click="onRowClick"
          >
            <template v-slot:loading>
              <q-inner-loading showing color="primary">
                <q-spinner-dots size="50px" color="primary" />
              </q-inner-loading>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props" class="text-center">
                <q-btn-group flat>
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="edit"
                    @click.stop="editCategory(props.row)"
                    class="q-mx-xs"
                  >
                    <q-tooltip>Editar Categoria</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    @click.stop="confirmDelete(props.row)"
                    class="q-mx-xs"
                  >
                    <q-tooltip>Excluir Categoria</q-tooltip>
                  </q-btn>
                </q-btn-group>
              </q-td>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-md text-grey-7">
                <q-icon name="sentiment_dissatisfied" size="24px" class="q-mr-sm" />
                Nenhuma categoria encontrada
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- Diálogo de Categoria -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 500px" class="dialog-card">
        <q-card-section class="bg-gradient-primary text-white">
          <div class="text-h6">{{ editMode ? 'Editar' : 'Nova' }} Categoria</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup class="text-white" />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveCategory" class="q-gutter-md">
            <q-input
              v-model="form.name"
              label="Nome"
              outlined
              dense
              :rules="[(val) => !!val || 'Nome é obrigatório']"
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="category" color="primary" />
              </template>
            </q-input>

            <q-input
              v-model="form.description"
              label="Descrição"
              outlined
              dense
              type="textarea"
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="description" color="primary" />
              </template>
            </q-input>

            <div class="row justify-end q-mt-md">
              <q-btn label="Cancelar" color="grey" flat class="q-mr-sm" v-close-popup />
              <q-btn
                :label="editMode ? 'Salvar' : 'Criar'"
                type="submit"
                color="primary"
                :loading="loading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import productService from '../services/product.service'

export default {
  setup() {
    const $q = useQuasar()
    const categories = ref([])
    const loading = ref(false)
    const filter = ref('')
    const showDialog = ref(false)
    const editMode = ref(false)
    const form = ref({
      id: null,
      name: '',
      description: '',
    })

    const columns = [
      {
        name: 'name',
        label: 'Nome',
        field: 'name',
        align: 'left',
        sortable: true,
        style: 'width: 40%',
      },
      {
        name: 'description',
        label: 'Descrição',
        field: 'description',
        align: 'left',
        style: 'width: 50%',
      },
      {
        name: 'actions',
        label: 'Ações',
        align: 'center',
        style: 'width: 10%',
      },
    ]

    const loadCategories = async () => {
      try {
        loading.value = true
        categories.value = await productService.getCategories()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.message,
          position: 'top',
          timeout: 2500,
        })
      } finally {
        loading.value = false
      }
    }

    const saveCategory = async () => {
      try {
        loading.value = true
        if (editMode.value) {
          await productService.updateCategory(form.value.id, form.value)
          $q.notify({
            type: 'positive',
            message: 'Categoria atualizada com sucesso',
            position: 'top',
            timeout: 2500,
          })
        } else {
          await productService.createCategory(form.value)
          $q.notify({
            type: 'positive',
            message: 'Categoria criada com sucesso',
            position: 'top',
            timeout: 2500,
          })
        }
        showDialog.value = false
        loadCategories()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.message,
          position: 'top',
          timeout: 2500,
        })
      } finally {
        loading.value = false
        formClean()
      }
    }

    const formClean = () => {
      form.value = {
        id: null,
        name: '',
        description: '',
      }
      editMode.value = false
    }

    const onRowClick = (evt, row) => {
      form.value = { ...row }
      editMode.value = true
      showDialog.value = true
    }

    const editCategory = (row) => {
      form.value = { ...row }
      editMode.value = true
      showDialog.value = true
    }

    const confirmDelete = (row) => {
      $q.dialog({
        title: 'Confirmar Exclusão',
        message: `Tem certeza que deseja excluir a categoria "${row.name}"?`,
        cancel: {
          label: 'Cancelar',
          flat: true,
          color: 'grey',
        },
        ok: {
          label: 'Excluir',
          color: 'negative',
        },
        persistent: true,
      }).onOk(async () => {
        try {
          loading.value = true
          await productService.deleteCategory(row.id)
          $q.notify({
            type: 'positive',
            message: 'Categoria excluída com sucesso',
            position: 'top',
            timeout: 2500,
          })
          loadCategories()
        } catch (error) {
          // Mostrar erro detalhado em diálogo se a mensagem for longa
          if (error.message.length > 100) {
            $q.dialog({
              title: 'Erro ao Excluir Categoria',
              message: error.message,
              html: true,
              ok: {
                label: 'Entendi',
                color: 'primary',
              },
              style: 'max-width: 600px',
              class: 'error-dialog',
            })
          } else {
            $q.notify({
              type: 'negative',
              message: error.message,
              position: 'top',
              timeout: 5000,
              multiLine: true,
              actions: [
                {
                  icon: 'close',
                  color: 'white',
                },
              ],
            })
          }
        } finally {
          loading.value = false
          formClean()
        }
      })
    }

    onMounted(() => {
      loadCategories()
    })

    return {
      categories,
      loading,
      filter,
      showDialog,
      editMode,
      form,
      columns,
      saveCategory,
      onRowClick,
      editCategory,
      confirmDelete,
    }
  },
}
</script>

<style scoped>
.category-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.header-section {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
  border-radius: 0 0 30px 30px;
  margin-bottom: -60px;
  padding-bottom: 100px;
}

.content-container {
  position: relative;
  z-index: 1;
}

.data-table-card {
  border-radius: 16px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.data-table-card:hover {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
}

.search-input {
  max-width: 100%;
  transition: all 0.3s ease;
}

.search-input:focus-within {
  transform: translateY(-1px);
}

.modern-table {
  border-radius: 8px;
  overflow: hidden;
}

.modern-table :deep(.q-table__top),
.modern-table :deep(.q-table__bottom) {
  padding: 12px 16px;
  background: #f8fafc;
}

.modern-table :deep(th) {
  font-weight: 600;
  color: #1976d2;
  background: #f8fafc;
  font-size: 0.813rem;
  transition: all 0.3s ease;
  padding: 8px 12px;
  height: 40px;
}

.modern-table :deep(td) {
  padding: 6px 12px;
  font-size: 0.813rem;
  height: 36px;
}

.modern-table :deep(tr) {
  height: 36px;
}

.modern-table :deep(.q-table__grid-content) {
  background: #f8fafc;
}

.modern-table :deep(.q-table__bottom) {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  min-height: 40px;
}

.modern-table :deep(.q-btn) {
  padding: 4px;
  min-height: 32px;
  min-width: 32px;
}

.modern-table :deep(.q-btn__content) {
  font-size: 1.1rem;
}

.modern-table :deep(tbody tr:nth-child(even)) {
  background: #fafbfc;
}

.modern-table :deep(tbody tr:hover) {
  background: #f0f7ff !important;
}

.modern-table :deep(.q-inner-loading) {
  background: rgba(255, 255, 255, 0.9);
}

.modern-table :deep(.q-table__bottom--nodata) {
  min-height: 100px;
  font-size: 0.875rem;
}

.action-btn {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.dialog-card {
  border-radius: 16px;
  overflow: hidden;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
}

/* Responsividade */
@media (max-width: 599px) {
  .header-section {
    border-radius: 0 0 20px 20px;
    margin-bottom: -40px;
    padding-bottom: 80px;
  }

  .content-container {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }

  .modern-table :deep(th),
  .modern-table :deep(td) {
    padding: 6px 8px;
    font-size: 0.75rem;
    height: 32px;
  }

  .modern-table :deep(tr) {
    height: 32px;
  }

  .modern-table :deep(.q-btn) {
    padding: 3px;
    min-height: 28px;
    min-width: 28px;
  }

  .dialog-card {
    width: 90vw;
    min-width: unset !important;
  }
}

/* Estilo para diálogo de erro */
:deep(.error-dialog .q-dialog__inner > div) {
  border-radius: 12px;
}

:deep(.error-dialog .q-card__section--vert) {
  white-space: pre-line;
  line-height: 1.6;
  font-size: 14px;
}

:deep(.error-dialog .q-card__section--vert strong) {
  color: #d32f2f;
  font-weight: 600;
}

:deep(.error-dialog) {
  max-width: 600px;
}

@media (max-width: 599px) {
  :deep(.error-dialog) {
    margin: 16px;
    max-width: calc(100vw - 32px);
  }
}
</style>
