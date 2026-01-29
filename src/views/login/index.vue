<template>
  <div class="login-container">
    <!-- 粒子动画背景 -->
    <vue-particles
      id="tsparticles"
      :options="particleOptions"
    />
    <el-card class="login-card">
      <h2 class="title">Snap Hutao服务器管理-登录</h2>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="请输入邮箱"
            clearable
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            style="width: 100%"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { webLoginApi } from '@/api/auth'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'


// 表单实例
const loginFormRef = ref<FormInstance>()

// loading 状态
const loading = ref(false)

// 表单数据
const loginForm = reactive({
  email: '',
  password: '',
})

const router = useRouter()

// 校验规则
const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 个字符', trigger: 'blur' },
  ],
}

// 登录方法
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const response = await webLoginApi(loginForm)
      const userStore = useUserStore()

      // 处理响应数据结构
      const tokenData = response.data || response
      userStore.setToken(tokenData.access_token)

      // 获取用户信息
      await userStore.fetchUserInfo()

      ElMessage.success('登录成功')
      router.push({ path: '/' })
    } catch (error: any) {
      ElMessage.error(error.message || '登录失败，请重试')
    } finally {
      loading.value = false
    }

  })
}

// 粒子配置选项
const particleOptions = ref({
  background: {
    color: "#0d0d0d"
  },
  fpsLimit: 60,

  particles: {
    number: {
      value: 200,
      density: {
        enable: true,
        area: 800
      }
    },

    color: {
      value: "#00bcd4"
    },

    shape: {
      type: "circle"
    },

    opacity: {
      value: 0.6
    },

    size: {
      value: 2
    },

    move: {
      enable: true,
      speed: 0.6,
      direction: "none",
      outModes: "out"
    },

    links: {
      enable: true,
      distance: 120,
      color: "#00bcd4",
      opacity: 0.4,
      width: 1
    }
  },

interactivity: {
  events: {
    onHover: {
      enable: true,
      mode: "grab"
    },
    onClick: {
      enable: true,
      mode: "push"
    }
  },
  modes: {
    grab: {
      distance: 180,
      links: {
        opacity: 0.6
      }
    },
    push: {
      quantity: 4
    }
  }
},
  detectRetina: true
})

</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #409eff, #66b1ff);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 400px;
  padding: 20px;
  position: relative;
  z-index: 10;
}

.title {
  text-align: center;
  margin-bottom: 20px;
}

</style>
