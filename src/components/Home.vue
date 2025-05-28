<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">蒂芙尼早餐&面包</div>
      <nav>
        <ul>
          <li :class="{active: $route.path === '/'}" @click="goTo('/index')"><span class="icon">🏠</span> 主页</li>
          <li :class="{active: $route.path === '/analytics'}" @click="goTo('/index/analytics')"><span class="icon">📊</span> 面包管理</li>
          <li :class="{active: $route.path === '/bread-inventory'}" @click="goTo('/index/bread-inventory')"><span class="icon">🏢</span> 库存管理</li>
          <li :class="{active: $route.path === '/bread-order-management'}" @click="goTo('/index/bread-order-management')"><span class="icon">📁</span> 订单管理</li>
          <li :class="{active: $route.path === '/financial'}" @click="goTo('/index/financial')"><span class="icon"  >🧾</span> 财务分析</li>
          <li :class="{active: $route.path === '/user-management'}" @click="goTo('/index/user-management')"><span class="icon" >👥</span> 用户管理</li>
        </ul>
      </nav>
      <div class="sidebar-bottom">
        <div><span class="icon">⚙️</span> 设置</div>
        <div><span class="icon">❓</span> 帮助</div>
      </div>
    </aside>
    <!-- Main Content -->
    <div class="main-content">
      <!-- Topbar -->
      <header class="topbar">
        <div class="topbar-left">
          <span class="logo-text">蒂芙尼早餐&面包</span>
        </div>
        <div class="topbar-right">
          <div class="notification">
            <svg width="20" height="20" fill="none" stroke="#222" stroke-width="1.5" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"/></svg>
            <span class="dot"></span>
          </div>
          <button class="mode-btn">
            <svg width="22" height="22" fill="none" stroke="#222" stroke-width="1.5" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>
          </button>
          <div class="user-menu" @click="toggleUserMenu">
            <span class="avatar"><img src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar"></span>
            <div class="dropdown-menu" v-if="showUserMenu">
              <div class="user-info">
                <div class="user-name">{{ username }}</div>
                <div class="user-role">{{ userRole }}</div>
              </div>
              <div class="menu-divider"></div>
              <div class="menu-item" @click="viewProfile">
                <span class="menu-icon">👤</span>
                <span>个人信息</span>
              </div>
              <div class="menu-item" @click="logout">
                <span class="menu-icon">🚪</span>
                <span>退出登录</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div class="content">
        <!-- <h1>Dashboard Overview</h1> -->
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Hello',
  data() {
    return {
      showUserMenu: false,
      username: localStorage.getItem('username') || '管理员',
      userRole: localStorage.getItem('userRole') || '系统管理员',
      documentClickListener: null
    }
  },
  methods: {
    goTo(path) {
      if (this.$route.path !== path) {
        this.$router.push(path)
      }
    },
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
    },
    viewProfile() {
      // 关闭菜单
      this.showUserMenu = false
      // 跳转到个人资料页面，暂未实现
      this.$router.push('/index/profile')
    },
    logout() {
      // 清除登录状态
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('userRole')
      
      // 关闭菜单
      this.showUserMenu = false
      
      // 跳转到登录页
      this.$router.push('/login')
    }
  },
  // 点击页面其他地方关闭下拉菜单
  mounted() {
    this.documentClickListener = (e) => {
      const userMenu = document.querySelector('.user-menu')
      if (userMenu && !userMenu.contains(e.target) && this.showUserMenu) {
        this.showUserMenu = false
      }
    }
    document.addEventListener('click', this.documentClickListener)
  },
  beforeDestroy() {
    // 正确移除事件监听器
    if (this.documentClickListener) {
      document.removeEventListener('click', this.documentClickListener)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100dvh;
  height: 100dvh;
  background: #f7f9fb;
  font-family: 'Inter', 'Helvetica', Arial, sans-serif;
  box-sizing: border-box;
}
.sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #ececec;
  display: flex;
  flex-direction: column;
  padding: 0;
  height: 100vh;
  box-sizing: border-box;
}
.logo {
  font-weight: bold;
  font-size: 22px;
  padding: 28px 32px 32px 32px;
  letter-spacing: -1px;
}
.sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sidebar nav ul li {
  padding: 10px 32px;
  color: #222;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 8px;
  margin: 2px 12px;
  font-size: 16px;
  transition: background 0.2s, color 0.2s;
  gap: 14px;
}
.sidebar nav ul li.active,
.sidebar nav ul li:hover {
  background: #f1f5f9;
  color: #111827;
  font-weight: 600;
}
.icon {
  width: 22px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
}
.sidebar-bottom {
  margin-top: auto;
  padding: 24px 32px;
  color: #888;
  font-size: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sidebar-bottom .icon {
  margin-right: 10px;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: calc(100vh - 64px);
  box-sizing: border-box;
  overflow: hidden;
  padding: 0 32px 32px 32px;
}
.topbar {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #ececec;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px 0 0;
  position: relative;
  z-index: 10;
}
.topbar-left {
  display: flex;
  align-items: center;
  gap: 18px;
}
.logo-text {
  font-weight: bold;
  font-size: 22px;
  color: #222;
  margin-left: 32px;
}
.back-arrow {
  font-size: 22px;
  color: #222;
  margin-left: 12px;
  margin-right: 2px;
  font-weight: 400;
}
.topbar-home {
  font-size: 17px;
  color: #222;
  font-weight: 500;
  margin-left: 2px;
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 18px;
}
.notification {
  position: relative;
  display: flex;
  align-items: center;
}
.notification svg {
  display: block;
}
.dot {
  position: absolute;
  top: 0px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid #fff;
}
.mode-btn {
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  padding: 6px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.2s;
}
.mode-btn:hover {
  background: #e5e7eb;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fbbf24;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hello {
  padding: 0;
}
.content {
  flex: 1;
  overflow-y: auto;
  padding-top: 20px;
}
.user-menu {
  position: relative;
  cursor: pointer;
}
.dropdown-menu {
  position: absolute;
  top: 48px;
  right: 0;
  width: 220px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}
.user-info {
  padding: 16px;
  background: #f1f5f9;
}
.user-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}
.user-role {
  font-size: 14px;
  color: #4b5563;
}
.menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
}
.menu-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  transition: background 0.2s;
}
.menu-item:hover {
  background: #f1f5f9;
}
.menu-icon {
  margin-right: 12px;
  width: 20px;
  display: inline-flex;
  justify-content: center;
}
</style>
