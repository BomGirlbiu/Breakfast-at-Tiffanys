<template>
    <div class="welcome-page">
      <header class="header">
        <div class="logo-container">
          <img :src="logo" alt="蒂芙尼早餐&面包" class="logo" />
        </div>
        <h1 class="title">欢迎使用蒂芙尼早餐&面包管理系统</h1>
        <p class="subtitle">高效管理您的面包店业务</p>
      </header>
  
      <div class="dashboard-summary">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="icon-orders"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ todayOrders }}</h3>
            <p class="stat-label">今日订单</p>
          </div>
        </div>
  
        <div class="stat-card">
          <div class="stat-icon">
            <i class="icon-revenue"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">¥{{ todayRevenue }}</h3>
            <p class="stat-label">今日收入</p>
          </div>
        </div>
  
        <div class="stat-card">
          <div class="stat-icon">
            <i class="icon-products"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ totalProducts }}</h3>
            <p class="stat-label">产品总数</p>
          </div>
        </div>
  
        <div class="stat-card">
          <div class="stat-icon">
            <i class="icon-customers"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ totalCustomers }}</h3>
            <p class="stat-label">会员总数</p>
          </div>
        </div>
      </div>
  
      <div class="welcome-message">
        <h2 class="message-title">店长，您好！</h2>
        <p class="message-content">
          欢迎回到蒂芙尼早餐&面包管理系统。在这里，您可以轻松管理店铺的日常运营，
          包括订单处理、库存管理、会员管理以及销售报表等功能。
        </p>
        <p class="message-content">
          今天是 {{ currentDate }}，祝您工作顺利！
        </p>
      </div>
  
      <div class="quick-actions">
        <h3 class="actions-title">快捷操作</h3>
        <div class="action-buttons">
          <button class="action-button" @click="navigateTo('orders')">
            <i class="icon-new-order"></i>
            <span>新订单</span>
          </button>
          <button class="action-button" @click="navigateTo('inventory')">
            <i class="icon-inventory"></i>
            <span>库存管理</span>
          </button>
          <button class="action-button" @click="navigateTo('products')">
            <i class="icon-add-product"></i>
            <span>添加产品</span>
          </button>
          <button class="action-button" @click="navigateTo('reports')">
            <i class="icon-reports"></i>
            <span>销售报表</span>
          </button>
        </div>
      </div>
  
      <div class="recent-activities">
        <h3 class="activities-title">最近活动</h3>
        <div class="activity-list">
          <div v-for="(activity, index) in recentActivities" :key="index" class="activity-item">
            <div class="activity-time">{{ activity.time }}</div>
            <div class="activity-description">{{ activity.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'WelcomePage',
    data() {
      return {
        logo: '/placeholder.svg?height=80&width=80',
        todayOrders: 24,
        todayRevenue: '3,680.00',
        totalProducts: 68,
        totalCustomers: 1256,
        currentDate: '',
        recentActivities: [
          { time: '09:45', description: '李明完成了一笔¥245的订单' },
          { time: '09:30', description: '系统自动更新了库存信息' },
          { time: '09:15', description: '张经理添加了3个新产品' },
          { time: '08:50', description: '王小姐注册成为新会员' },
          { time: '08:30', description: '今日营业开始' }
        ]
      }
    },
    created() {
      this.getCurrentDate();
    },
    methods: {
      getCurrentDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const weekday = weekdays[now.getDay()];
        this.currentDate = `${year}年${month}月${day}日 ${weekday}`;
      },
      navigateTo(route) {
        // 在实际应用中，这里会使用Vue Router进行导航
        console.log(`导航到: ${route}`);
        // this.$router.push(`/${route}`);
      }
    }
  }
  </script>
  
  <style scoped>
  .welcome-page {
    max-width: 100%;
    margin: 0;
    padding: 0;
    font-family: 'Microsoft YaHei', sans-serif;
  }
  
  .header {
    text-align: center;
    margin-bottom: 24px;
  }
  
  .logo-container {
    margin-bottom: 12px;
  }
  
  .logo {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .title {
    font-size: 24px;
    color: #2c3e50;
    margin-bottom: 8px;
  }
  
  .subtitle {
    font-size: 14px;
    color: #7f8c8d;
  }
  
  .dashboard-summary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .stat-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    background-color: #f8f9fa;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
  }
  
  .stat-content {
    flex: 1;
  }
  
  .stat-value {
    font-size: 20px;
    font-weight: bold;
    color: #2c3e50;
    margin: 0;
  }
  
  .stat-label {
    font-size: 13px;
    color: #7f8c8d;
    margin: 4px 0 0 0;
  }
  
  .welcome-message {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  .message-title {
    font-size: 18px;
    color: #2c3e50;
    margin-top: 0;
    margin-bottom: 12px;
  }
  
  .message-content {
    font-size: 14px;
    color: #34495e;
    line-height: 1.5;
    margin-bottom: 8px;
  }
  
  .quick-actions {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  .actions-title {
    font-size: 16px;
    color: #2c3e50;
    margin-top: 0;
    margin-bottom: 16px;
  }
  
  .action-buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  
  .action-button {
    background-color: #f8f9fa;
    border: none;
    border-radius: 8px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .action-button:hover {
    background-color: #e9ecef;
    transform: translateY(-2px);
  }
  
  .action-button i {
    font-size: 20px;
    margin-bottom: 8px;
    color: #3498db;
  }
  
  .action-button span {
    font-size: 13px;
    color: #2c3e50;
  }
  
  .recent-activities {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  .activities-title {
    font-size: 16px;
    color: #2c3e50;
    margin-top: 0;
    margin-bottom: 16px;
  }
  
  .activity-item {
    display: flex;
    padding: 10px 0;
    border-bottom: 1px solid #f1f1f1;
  }
  
  .activity-item:last-child {
    border-bottom: none;
  }
  
  .activity-time {
    width: 50px;
    color: #7f8c8d;
    font-size: 13px;
  }
  
  .activity-description {
    flex: 1;
    color: #34495e;
    font-size: 13px;
  }
  
  /* 为了适应不同屏幕尺寸 */
  @media (max-width: 992px) {
    .dashboard-summary {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .action-buttons {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 576px) {
    .dashboard-summary {
      grid-template-columns: 1fr;
    }
    
    .action-buttons {
      grid-template-columns: 1fr;
    }
  }
  
  /* 图标样式 */
  .icon-orders:before { content: "📋"; }
  .icon-revenue:before { content: "💰"; }
  .icon-products:before { content: "🍞"; }
  .icon-customers:before { content: "👥"; }
  .icon-new-order:before { content: "📝"; }
  .icon-inventory:before { content: "📦"; }
  .icon-add-product:before { content: "➕"; }
  .icon-reports:before { content: "📊"; }
  </style>