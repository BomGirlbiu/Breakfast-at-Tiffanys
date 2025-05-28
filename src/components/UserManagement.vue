<template>
  <div class="user-management">
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
      <button class="add-user-btn" @click="showAddUserModal = true">
        <span class="icon">+</span> 添加用户
      </button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="control-panel">
      <div class="search-container">
        <input 
          type="search" 
          v-model="searchTerm" 
          placeholder="搜索用户..." 
          class="search-input"
        >
        <i class="search-icon">🔍</i>
      </div>
      
      <div class="filters">
        <select v-model="roleFilter" class="filter-select">
          <option value="all">所有角色</option>
          <option value="admin">管理员</option>
          <option value="staff">员工</option>
          <option value="cashier">收银员</option>
        </select>
        
        <select v-model="statusFilter" class="filter-select">
          <option value="all">所有状态</option>
          <option value="active">在职</option>
          <option value="inactive">离职</option>
        </select>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="user-table-container">
      <table class="user-table">
        <thead>
          <tr>
            <th>用户信息</th>
            <th>角色</th>
            <th>联系方式</th>
            <th>入职日期</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td class="user-info">
              <img :src="user.avatar" :alt="user.name" class="user-avatar">
              <div class="user-details">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-id">ID: {{ user.id }}</div>
              </div>
            </td>
            <td>
              <span :class="['role-badge', user.role]">
                {{ getRoleName(user.role) }}
              </span>
            </td>
            <td>
              <div class="contact-info">
                <div>{{ user.phone }}</div>
                <div class="email">{{ user.email }}</div>
              </div>
            </td>
            <td>{{ formatDate(user.joinDate) }}</td>
            <td>
              <span :class="['status-badge', user.status]">
                {{ user.status === 'active' ? '在职' : '离职' }}
              </span>
            </td>
            <td class="actions">
              <button class="action-btn edit" @click="editUser(user)">
                <span class="icon">✏️</span>
              </button>
              <button class="action-btn delete" @click="confirmDelete(user)">
                <span class="icon">🗑️</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 添加/编辑用户模态框 -->
    <div v-if="showAddUserModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingUser ? '编辑用户' : '添加用户' }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveUser" class="user-form">
            <div class="form-group">
              <label>姓名</label>
              <input type="text" v-model="userForm.name" required>
            </div>
            <div class="form-group">
              <label>角色</label>
              <select v-model="userForm.role" required>
                <option value="admin">管理员</option>
                <option value="staff">员工</option>
                <option value="cashier">收银员</option>
              </select>
            </div>
            <div class="form-group">
              <label>手机号码</label>
              <input type="tel" v-model="userForm.phone" required>
            </div>
            <div class="form-group">
              <label>邮箱</label>
              <input type="email" v-model="userForm.email" required>
            </div>
            <div class="form-group">
              <label>入职日期</label>
              <input type="date" v-model="userForm.joinDate" required>
            </div>
            <div class="form-group">
              <label>状态</label>
              <select v-model="userForm.status" required>
                <option value="active">在职</option>
                <option value="inactive">离职</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeModal">取消</button>
              <button type="submit" class="save-btn">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content delete-confirm">
        <h3>确认删除</h3>
        <p>确定要删除用户 "{{ userToDelete?.name }}" 吗？此操作不可恢复。</p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showDeleteModal = false">取消</button>
          <button class="delete-btn" @click="deleteUser">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5050/api';

export default {
  name: 'UserManagement',
  data() {
    return {
      searchTerm: '',
      roleFilter: 'all',
      statusFilter: 'all',
      showAddUserModal: false,
      showDeleteModal: false,
      editingUser: null,
      userToDelete: null,
      userForm: {
        name: '',
        role: 'staff',
        phone: '',
        email: '',
        joinDate: '',
        status: 'active'
      },
      users: [],
      // 注释掉静态用户数据
      /*
      users: [
        {
          id: 'U001',
          name: '张三',
          role: 'admin',
          phone: '13800138000',
          email: 'zhangsan@example.com',
          joinDate: '2023-01-15',
          status: 'active',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        {
          id: 'U002',
          name: '李四',
          role: 'staff',
          phone: '13800138001',
          email: 'lisi@example.com',
          joinDate: '2023-03-20',
          status: 'active',
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
        },
        {
          id: 'U003',
          name: '王五',
          role: 'cashier',
          phone: '13800138002',
          email: 'wangwu@example.com',
          joinDate: '2023-06-10',
          status: 'inactive',
          avatar: 'https://randomuser.me/api/portraits/men/67.jpg'
        }
      ]
      */
    }
  },
  computed: {
    filteredUsers() {
      return this.users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            user.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            user.phone.includes(this.searchTerm) ||
                            user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
        
        const matchesRole = this.roleFilter === 'all' || user.role === this.roleFilter
        const matchesStatus = this.statusFilter === 'all' || user.status === this.statusFilter
        
        return matchesSearch && matchesRole && matchesStatus
      })
    }
  },
  methods: {
    // 获取用户数据
    async fetchUsers() {
      try {
        const response = await axios.get(`${API_BASE_URL}/users`);
        // 转换API返回的数据格式以匹配组件需要的格式
        this.users = response.data.map(user => ({
          id: `U${String(user.id).padStart(3, '0')}`,
          name: user.username,
          role: user.role || 'staff', // API中可能没有这个字段
          phone: user.phone,
          email: user.email,
          joinDate: user.created_at.split('T')[0], // 从ISO日期格式中提取日期部分
          status: 'active', // API中可能没有这个字段
          avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`
        }));
      } catch (error) {
        console.error('Error fetching users:', error);
        alert('获取用户数据失败');
      }
    },
    
    getRoleName(role) {
      const roleNames = {
        admin: '管理员',
        staff: '员工',
        cashier: '收银员'
      }
      return roleNames[role] || role
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString('zh-CN')
    },
    
    editUser(user) {
      this.editingUser = user
      this.userForm = { ...user }
      this.showAddUserModal = true
    },
    
    confirmDelete(user) {
      this.userToDelete = user
      this.showDeleteModal = true
    },
    
    async deleteUser() {
      if (this.userToDelete) {
        try {
          // 从ID中提取数字部分
          const userId = parseInt(this.userToDelete.id.replace('U', ''));
          await axios.delete(`${API_BASE_URL}/users/${userId}`);
          await this.fetchUsers();
        } catch (error) {
          console.error('Error deleting user:', error);
          alert('删除用户失败');
        }
        this.showDeleteModal = false;
        this.userToDelete = null;
      }
    },
    
    async saveUser() {
      try {
        if (this.editingUser) {
          // 更新现有用户
          const userId = parseInt(this.editingUser.id.replace('U', ''));
          await axios.put(`${API_BASE_URL}/users/${userId}`, {
            username: this.userForm.name,
            email: this.userForm.email,
            phone: this.userForm.phone
          });
        } else {
          // 添加新用户
          const newUser = {
            username: this.userForm.name,
            password: 'password123', // 默认密码
            email: this.userForm.email,
            phone: this.userForm.phone
          };
          await axios.post(`${API_BASE_URL}/users/register`, newUser);
        }
        
        await this.fetchUsers();
        this.closeModal();
      } catch (error) {
        console.error('Error saving user:', error);
        alert('保存用户失败');
      }
    },
    
    closeModal() {
      this.showAddUserModal = false;
      this.editingUser = null;
      this.userForm = {
        name: '',
        role: 'staff',
        phone: '',
        email: '',
        joinDate: '',
        status: 'active'
      }
    }
  },
  
  // 在组件创建时获取数据
  created() {
    this.fetchUsers();
  }
}
</script>

<style scoped>
.user-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.add-user-btn {
  background-color: #f8b500;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: background-color 0.2s;
}

.add-user-btn:hover {
  background-color: #e6a800;
}

.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}

.search-container {
  position: relative;
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #f8b500;
  box-shadow: 0 0 0 2px rgba(248, 181, 0, 0.2);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.filters {
  display: flex;
  gap: 10px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 120px;
  transition: border-color 0.3s;
}

.filter-select:focus {
  outline: none;
  border-color: #f8b500;
  box-shadow: 0 0 0 2px rgba(248, 181, 0, 0.2);
}

.user-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th,
.user-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.user-table th {
  background-color: #f8b500;
  color: white;
  font-weight: 500;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.user-id {
  font-size: 12px;
  color: #666;
}

.role-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.admin {
  background-color: #fff3e0;
  color: #e65100;
}

.role-badge.staff {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.role-badge.cashier {
  background-color: #e3f2fd;
  color: #1976d2;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.email {
  font-size: 12px;
  color: #666;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.inactive {
  background-color: #ffebee;
  color: #c62828;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn.edit {
  background-color: #f8b500;
  color: white;
}

.action-btn.delete {
  background-color: #f44336;
  color: white;
}

.action-btn:hover {
  opacity: 0.8;
}

/* 模态框样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  color: #666;
}

.form-group input,
.form-group select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #f8b500;
  box-shadow: 0 0 0 2px rgba(248, 181, 0, 0.2);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.cancel-btn,
.save-btn,
.delete-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.cancel-btn {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #333;
}

.cancel-btn:hover {
  background-color: #e5e5e5;
}

.save-btn {
  background-color: #f8b500;
  color: white;
}

.save-btn:hover {
  background-color: #e6a800;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

.delete-confirm {
  max-width: 400px;
  text-align: center;
}

.delete-confirm h3 {
  margin: 0 0 16px 0;
  color: #333;
}

.delete-confirm p {
  margin: 0 0 24px 0;
  color: #666;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

@media (max-width: 768px) {
  .control-panel {
    flex-direction: column;
  }
  
  .filters {
    width: 100%;
  }
  
  .filter-select {
    flex: 1;
  }
  
  .user-table {
    display: block;
    overflow-x: auto;
  }
  
  .modal-content {
    margin: 20px;
  }
}
</style> 