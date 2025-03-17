<template>
  <q-item
    clickable
    :to="props.link"
    @click="props.action"
    class="menu-item"
    active-class="active-menu-item"
  >
    <q-item-section v-if="props.icon" avatar>
      <q-icon :name="props.icon" :color="props.color" size="24px" />
    </q-item-section>

    <q-item-section>
      <q-item-label class="text-weight-medium">{{ props.title }}</q-item-label>
      <q-item-label caption class="text-caption">{{ props.caption }}</q-item-label>
    </q-item-section>

    <q-item-section side>
      <q-icon name="chevron_right" size="16px" class="text-grey-6" />
    </q-item-section>
  </q-item>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },

  caption: {
    type: String,
    default: '',
  },

  link: {
    type: String,
    default: '#',
  },
  action: {
    type: Function,
    default: null,
  },

  icon: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: 'primary',
  },
})
</script>

<style lang="scss" scoped>
.menu-item {
  border-radius: 8px;
  margin: 4px 8px;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    transform: translateX(4px);
  }

  .q-item__section--avatar {
    min-width: 40px;
  }
}

.active-menu-item {
  background: linear-gradient(145deg, rgba(98, 0, 234, 0.15), rgba(98, 0, 234, 0.1));
  border-left: 6px solid #6200ea;
  box-shadow: 0 2px 8px rgba(98, 0, 234, 0.15);

  .q-item-label {
    color: #6200ea;
    font-weight: 600;
  }

  .q-item-label.caption {
    color: rgba(98, 0, 234, 0.8);
  }

  .q-icon {
    color: #6200ea !important;
    filter: drop-shadow(0 1px 2px rgba(98, 0, 234, 0.2));
  }

  &:hover {
    background: linear-gradient(145deg, rgba(98, 0, 234, 0.2), rgba(98, 0, 234, 0.15));
    transform: translateX(4px);
  }
}
</style>
