<template>
  <div class="login-container">
    <div class="background-elements">
      <div v-for="n in 10" :key="n" class="moving-block" :style="getRandomBlockStyle(n)"></div>
    </div>
    
    <div class="logo-container">
      <h1 class="logo">面包店管理系统</h1>
    </div>
    
    <div class="login-card">
      <h2 class="card-title">登录系统</h2>
      
      <div class="form-group">
        <label for="email">用户名</label>
        <input type="text" id="email" v-model="username" class="form-input" />
      </div>
      
      <div class="form-group">
        <div class="password-header">
          <label for="password">密码</label>
          <a href="#" class="forgot-link">忘记密码?</a>
        </div>
        <input type="password" id="password" v-model="password" class="form-input" />
      </div>
      
      <div class="remember-me">
        <input type="checkbox" id="remember" v-model="staySignedIn" />
        <label for="remember">保持一周登录状态</label>
      </div>
      
      <button class="continue-btn" @click="login">登录</button>
      
      <div class="sso-option">
        <a href="#" class="sso-link">使用单点登录 (Google) 登录</a>
      </div>
      
      <div v-if="error" class="login-error">{{ error }}</div>
    </div>
    
    <div class="signup-prompt">
      没有账号? <a href="#" class="signup-link">注册</a>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'LoginPage',
  data() {
    return {
      username: '',
      password: '',
      staySignedIn: false,
      error: ''
    }
  },
  methods: {
    async login() {
      this.error = '';
      if (!this.username || !this.password) {
        this.error = '请输入用户名和密码';
        return;
      }
      
      try {
        // 登录接口
        const response = await axios.post('http://localhost:5050/api/users/login', {
          username: this.username,
          password: this.password
        });
        
        // 登录成功，保存用户信息到 localStorage/sessionStorage
        if (this.staySignedIn) {
          localStorage.setItem('user', JSON.stringify(response.data));
        } else {
          sessionStorage.setItem('user', JSON.stringify(response.data));
        }
        
        // 跳转到主页
        this.$router.replace('/index');
      } catch (err) {
        console.error('登录错误:', err);
        this.error = err.response?.data?.message || '登录失败，请检查账号密码';
      }
    },
    getRandomBlockStyle(index) {
      const sizes = [60, 80, 100, 120, 150];
      const delays = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];
      const durations = [15, 20, 25, 30];
      const opacities = [0.1, 0.15, 0.2];
      
      return {
        width: sizes[index % sizes.length] + 'px',
        height: sizes[index % sizes.length] + 'px',
        animationDelay: delays[index % delays.length] + 's',
        animationDuration: durations[index % durations.length] + 's',
        opacity: opacities[index % opacities.length],
        top: Math.floor(Math.random() * 100) + '%',
        left: Math.floor(Math.random() * 100) + '%'
      };
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-family: Arial, sans-serif;
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.background-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.moving-block {
  position: absolute;
  background-color: #5a6acf;
  transform: rotate(45deg);
  animation: moveBlock linear infinite;
}

@keyframes moveBlock {
  0% {
    transform: rotate(45deg) translate(-100px, -100px);
  }
  100% {
    transform: rotate(45deg) translate(calc(100vw + 200px), calc(100vh + 200px));
  }
}

.logo-container {
  margin-bottom: 20px;
  text-align: center;
}

.logo {
  color: #5a6acf;
  font-size: 2.5rem;
  font-weight: bold;
}

.login-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 450px;
  margin-bottom: 20px;
}

.card-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 25px;
  font-weight: 500;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.password-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.forgot-link {
  color: #5a6acf;
  text-decoration: none;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.remember-me {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.remember-me input {
  margin-right: 8px;
}

.continue-btn {
  width: 100%;
  padding: 14px;
  background-color: #5a6acf;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 15px;
}

.continue-btn:hover {
  background-color: #4a59b8;
}

.sso-option {
  text-align: center;
  margin-bottom: 10px;
}

.sso-link {
  color: #5a6acf;
  text-decoration: none;
  font-size: 0.9rem;
}

.signup-prompt {
  text-align: center;
  color: #333;
  font-size: 0.9rem;
}

.signup-link {
  color: #5a6acf;
  text-decoration: none;
  font-weight: 500;
}

a:hover {
  text-decoration: underline;
}

.login-error {
  color: #f44336;
  background: #fff0f0;
  border-radius: 4px;
  padding: 10px;
  margin: 10px 0 0 0;
  text-align: center;
  font-size: 15px;
}
</style>