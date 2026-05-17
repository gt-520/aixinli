<template>
    <el-dialog
        :title="isEdit ? '编辑文章' : '新增文章'"
        v-model="dialogVisble"
        width="50%"
        @close="handleClose"
    >
        <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
            <el-form-item label="文章标题" prop="title">
                <el-input v-model="formData.title" placeholder="请输入文章标题" maxlength="200" show-word-limit clearable></el-input>
            </el-form-item>
            <el-form-item label="文章分类" prop="categoryId">
                <el-select v-model="formData.categoryId" placeholder="请选择文章分类">
                    <el-option v-for="item in categories" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="文章摘要" prop="summary">
                <el-input type="textarea" v-model="formData.summary" placeholder="请输入文章摘要(可选)" maxlength="1000" show-word-limit clearable :rows="4"></el-input>
            </el-form-item>
            <el-form-item label="标签" prop="tags">
                <el-select v-model="formData.tagArray" placeholder="请输入文章标签(可选)" maxlength="100" show-word-limit clearable :rows="2" multiple filterable tag-separator=",">
                    <el-option v-for="tag in commonTags" :key="tag" :label="tag" :value="tag"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="封面图片">
                <div class="cover-upload">
                    <el-upload
                        class="avatar-uploader"
                        action="#"
                        :before-upload="beforeUpload"
                        :http-request="handleUploadRequest"
                        :show-file-list="false"
                        accept="image/*"
                    >
                        <div v-if="!imgUrl" class="cover-placeholder">
                            <p>点击上传封面图片</p>
                        </div>
                        <img v-else :src="imgUrl" class="cover-image" alt="封面图片">
                    </el-upload>
                    <div v-if="imgUrl" class="cover-remove">
                        <el-button size="small" type="danger" @click="handleRemove">移除封面</el-button>
                    </div>
                </div>
            </el-form-item>
            <el-form-item label="文章内容" prop="content">
                <RichTextEditor
                    v-model="formData.content"
                    placeholder="请输入文章内容，支持富文本格式"
                    :maxCharCount="5000"
                    @change="handleContentChange"
                    @created="handleEditorCreated"
                    min-height="400px"
                ></RichTextEditor>
            </el-form-item>
        </el-form>
            <div v-if="btnPreview">
                <h3>文章内容预览</h3>
                <div v-html="formData.content"></div>
            </div>
        <template #footer>
            <el-button @click="btnPreview = !btnPreview">{{btnPreview ? '隐藏预览' : '预览效果'}}</el-button>
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="loading">{{isEdit ? '更新文章' : '新增文章'}}</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, nextTick,watch } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadFile, createArticle, updateArticle } from '@/api/admin'
import RichTextEditor from '@/components/RichTextEditor.vue'
import { fileBaseUrl } from '@/config/index.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  },
  article: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'sucess'])


const dialogVisble = computed({
    get() {
        return props.modelValue
    },
    set(val) {
        emit('update:modelValue', val)
    }
})

const isEdit = computed(() => !!props.article?.id)

// 监听文章变化
watch(() => props.article, (newVal) => {
    if (newVal) {
        nextTick(() => {
            Object.assign(formData.value, newVal)
            // 使用现有ID
            formData.value.id = newVal.id
            // 使用现有ID
            businessId.value = newVal.id
            //封面Url
            imgUrl.value = fileBaseUrl + newVal.coverImage
        })
    }
})

const handleClose = () => {
    //重置表单
    formRef.value.resetFields()
    //重置ID
    businessId.value = null
    //重置标签
    formData.value.tagArray = []
    //重置封面图片和数据
    handleRemove()
    emit('update:modelValue', false)
}

const formData = ref({
    title: "",
    content: "",
    coverImage: "",
    categoryId: 1,
    summary: "",
    tags: "",
    tagArray: [],
    id: ""
})

const rules = ref({
    title: [
        { required: true, message: '请输入文章标题', trigger: 'blur' },
        { max: 200, message: '文章标题最多200个字符', trigger: 'blur' }
    ],
    categoryId: [
        { required: true, message: '请选择文章分类', trigger: 'change' }
    ],
    content: [
        { required: true, message: '请输入文章内容', trigger: 'blur' },
        { max: 5000, message: '文章内容最多5000个字符', trigger: 'blur' }
    ]
})

const commonTags = [
  '情绪管理', '焦虑', '抑郁', '压力', '睡眠',
  '冥想', '正念', '放松', '心理健康', '自我成长',
  '人际关系', '工作压力', '学习方法', '生活技巧'
]

// 上传封面图片
const imgUrl = ref('')

const beforeUpload = (file) => {
    // 上传前的校验
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
        ElMessage.error('请上传图片文件')
        return false
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
        ElMessage.error('图片大小不能超过5MB')
        return false
    }
    return true
}
const businessId = ref(null)
const handleUploadRequest = async ({ file }) => {
    const businessId = crypto.randomUUID()

    const fileRes = await uploadFile(file, { 
        businessId: businessId.value
     })
     console.log(fileRes)

     //拼接完整图片地址
     imgUrl.value = fileBaseUrl + fileRes.filePath
     formData.coverImage = fileRes.filePath
}
 
 // 移除封面图片
 const handleRemove = () => {
    imgUrl.value = ''
    formData.coverImage = ''
 }

 // 富文本
 const handleContentChange = (data) => {
    console.log(data,'富文本内容')
    formData.content = data.html
 }
 const editorInstance = ref(null)
 const handleEditorCreated = (editor) => {
    editorInstance.value = editor
    //编辑
    if (formData.content && editor) {
        nextTick(() => {
            editorInstance.value.setHtml(formData.content)
        })
    }
 }

 const btnPreview = ref(false)

 //提交
 const formRef = ref()
 const loading = ref(false)
 const handleSubmit = () => {
    formRef.value.validate((valid, fields) => {
        if (valid) {
            loading.value = true
            const submitData = {
                ...formData.value,
                tags: formData.value.tagArray.join(',')
            }
            delete submitData.tagArray
        
        //新增
        if (isEdit.value) {
            submitData.id = businessId.value
            updateArticle(formData.value.id, submitData).then(res => {
            loading.value = false
            emit('sucess')
            })
        } else {
            createArticle(submitData).then(res => {
            loading.value = false
            emit('sucess')
            })
        }
    }
 })
}

</script>

<style lang="scss" scoped>
.cover-placeholder {
    width: 200px;
    height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #8b949e;
    background: #f6f8fa;
}
.cover-image {
    width: 200px;
    height: 120px;
    display:block;
}


</style>
