<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <q-table
          dense
          title="Categorias"
          :rows="categories"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :filter="filter"
          @row-click="onRowClick"
        >
          <template v-slot:top-right>
            <q-input v-model="filter" outlined dense placeholder="Pesquisar" class="q-mr-sm" />
            <q-btn color="primary" label="Nova Categoria" @click="showDialog = true" />
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-x-sm">
              <q-btn
                round
                dense
                flat
                color="primary"
                icon="edit"
                @click.stop="editCategory(props.row)"
              />
              <q-btn
                round
                dense
                flat
                color="negative"
                icon="delete"
                @click.stop="confirmDelete(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <q-dialog v-model="showDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ editMode ? 'Editar Categoria' : 'Nova Categoria' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveCategory">
            <q-input
              v-model="form.name"
              label="Nome"
              outlined
              dense
              :rules="[(val) => !!val || 'Nome é obrigatório']"
            />

            <q-input
              v-model="form.description"
              label="Descrição"
              outlined
              dense
              type="textarea"
              class="q-mt-sm"
            />

            <div class="row q-mt-md justify-end">
              <q-btn label="Cancelar" flat color="negative" v-close-popup class="q-mr-sm" />
              <q-btn type="submit" label="Salvar" color="primary" />
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
      { name: 'name', label: 'Nome', field: 'name', align: 'left', sortable: true },
      { name: 'description', label: 'Descrição', field: 'description', align: 'left' },
      { name: 'actions', label: 'Ações', align: 'right' },
    ]

    const loadCategories = async () => {
      try {
        loading.value = true
        categories.value = await productService.getCategories()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.message,
        })
      } finally {
        loading.value = false
      }
    }

    const saveCategory = async () => {
      try {
        if (editMode.value) {
          await productService.updateCategory(form.value.id, form.value)
          $q.notify({
            type: 'positive',
            message: 'Categoria atualizada com sucesso',
          })
        } else {
          await productService.createCategory(form.value)
          $q.notify({
            type: 'positive',
            message: 'Categoria criada com sucesso',
          })
        }
        showDialog.value = false
        loadCategories()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.message,
        })
      } finally {
        formClean()
      }
    }

    const formClean = () => {
      form.value = {
        id: null,
        name: '',
        description: '',
      }
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
        title: 'Confirmar',
        message: `Tem certeza que deseja excluir a categoria ${row.name}?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await productService.deleteCategory(row.id)
          $q.notify({
            type: 'positive',
            message: 'Categoria excluída com sucesso',
          })
          loadCategories()
        } catch (error) {
          $q.notify({
            type: 'negative',
            message: error.message,
          })
        } finally {
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
.q-table {
  height: calc(100vh - 150px);
}
</style>
