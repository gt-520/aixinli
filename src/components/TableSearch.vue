<template>
  <el-form ref="ruleFormRef" :model="formData">
    <el-row :gutter="24">
        <template v-for="item in searchFormItems" :key="item.prop">
          <el-col v-bind="item.col">
            <el-form-item :label="item.label" :prop="item.prop">
              <component :is="isComp(item.comp)" :placeholder="item.placeholder" v-model="formData[item.prop]">
                  <template v-if="item.comp === 'select'">
                        <el-option label="全部" value="" />
                        <el-option v-for="option in item.options" :key="option.value" :label="option.label" :value="option.value" />
                  </template>
              </component>
            </el-form-item>
          </el-col>
        </template>
    </el-row>
    <el-row>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button  @click="handleReset(ruleFormRef)">重置</el-button>
    </el-row>
  </el-form>
</template>

<script setup>
import { reactive,ref,computed } from 'vue'

const ruleFormRef = ref()
const formData = reactive({})
const props = defineProps({
  formItems: {
    type: Array,
    default: () => []
  }
})

const searchFormItems = computed(() => {
  const { formItems } = props
  formItems.forEach(item => {
    item.col = { xs : 24, sm : 12, md : 8, lg : 6, xl : 6 }
  })
  return formItems
})



const emit = defineEmits(['search'])

const handleSearch = () => {
  emit('search', formData)
}
const handleReset = (formRef) => {
  if (!formRef) return
  formRef.resetFields()
  emit('search', formData)
}

const isComp = (comp) => {
  return {
    input: 'el-input',
    select: 'el-select'
  }[comp]
}
</script>
