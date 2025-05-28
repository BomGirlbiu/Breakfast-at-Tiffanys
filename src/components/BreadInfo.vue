<template>
  <div class="bread-info">
    <div class="header-actions">
      <h1 class="page-title">面包信息管理</h1>
      <button class="add-bread-btn" @click="addNewBread">上架新品</button>
    </div>
    
    <!-- 搜索和视图切换 -->
    <div class="control-panel">
      <div class="search-container">
        <input 
          type="search" 
          v-model="searchTerm" 
          placeholder="搜索面包..." 
          class="search-input"
        >
        <i class="search-icon">🔍</i>
      </div>
      
      <div class="view-controls">
        <button 
          :class="['view-btn', { active: view === 'grid' }]" 
          @click="view = 'grid'"
        >
          网格视图
        </button>
        <button 
          :class="['view-btn', { active: view === 'table' }]" 
          @click="view = 'table'"
        >
          表格视图
        </button>
      </div>
    </div>
    
    <!-- 分类选择器 -->
    <div class="category-selector">
      <button 
        :class="['category-btn', { active: selectedCategory === 'all' }]" 
        @click="selectedCategory = 'all'"
      >
        全部分类
      </button>
      <button 
        v-for="category in categories" 
        :key="category.id"
        :class="['category-btn', { active: selectedCategory === category.id }]" 
        @click="selectedCategory = category.id"
      >
        {{ category.name }}
      </button>
    </div>
    
    <!-- 网格视图 -->
    <div v-if="view === 'grid'" class="grid-view">
      <div v-for="category in filteredCategories" :key="category.id" class="category-section">
        <h2 class="category-title">{{ category.name }}</h2>
        <div class="bread-grid">
          <div 
            v-for="bread in getBreadByCategory(category.id)" 
            :key="bread.id" 
            class="bread-card"
          >
            <div class="bread-card-header">
              <h3 class="bread-name">{{ bread.name }}</h3>
              <span class="price-tag">¥{{ bread.price.toFixed(2) }}</span>
            </div>
            <div class="bread-card-content">
              <div class="bread-image-container">
                <img :src="bread.image" :alt="bread.name" class="bread-image">
              </div>
              <div class="bread-details">
                <div class="ingredients-list">
                  <h4>原料:</h4>
                  <ul>
                    <li v-for="(amount, ingredient) in bread.ingredients" :key="ingredient">
                      {{ ingredient }}: {{ amount }}
                    </li>
                  </ul>
                </div>
                <div class="bread-description">
                  {{ bread.description }}
                </div>
              </div>
              <div class="action-buttons">
                <button class="edit-btn" @click="editBread(bread)">编辑信息</button>
                <button class="delete-btn" @click="deleteBread(bread)">删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 无结果提示 -->
      <div v-if="filteredCategories.length === 0" class="no-results">
        没有找到匹配的面包产品
      </div>
    </div>
    
    <!-- 表格视图 -->
    <div v-else class="table-view">
      <div v-for="category in filteredCategories" :key="category.id" class="category-section">
        <h2 class="category-title">{{ category.name }}</h2>
        <table class="bread-table">
          <thead>
            <tr>
              <th class="image-col">图片</th>
              <th>名称</th>
              <th>价格</th>
              <th>原料</th>
              <th>描述</th>
              <th class="action-col">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bread in getBreadByCategory(category.id)" :key="bread.id">
              <td>
                <img :src="bread.image" :alt="bread.name" class="table-bread-image">
              </td>
              <td class="bread-name">{{ bread.name }}</td>
              <td>¥{{ bread.price.toFixed(2) }}</td>
              <td>
                <div class="ingredients-cell">
                  <span v-for="(amount, ingredient) in bread.ingredients" :key="ingredient">
                    {{ ingredient }}: {{ amount }}
                  </span>
                </div>
              </td>
              <td class="description-cell">{{ bread.description }}</td>
              <td class="action-col">
                <button class="table-action-btn edit" @click="editBread(bread)">编辑</button>
                <button class="table-action-btn delete" @click="deleteBread(bread)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 无结果提示 -->
      <div v-if="filteredCategories.length === 0" class="no-results">
        没有找到匹配的面包产品
      </div>
    </div>
    
    <!-- 分页 -->
    <div class="pagination">
      <div class="pagination-info">
        显示 {{ totalFilteredBread }} 个面包中的 {{ totalFilteredBread }} 个
      </div>
      <div class="pagination-controls">
        <button class="pagination-btn" disabled>
          &lt;
        </button>
        <span class="pagination-text">第 1 页，共 1 页</span>
        <button class="pagination-btn" disabled>
          &gt;
        </button>
      </div>
    </div>

    <!-- 编辑面包信息模态框 -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>编辑面包信息</h2>
          <button class="close-btn" @click="closeEditModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveBreadInfo" class="bread-form">
            <div class="form-group">
              <label>名称</label>
              <input type="text" v-model="editingBread.name" required>
            </div>
            <div class="form-group">
              <label>价格</label>
              <input type="number" v-model="editingBread.price" step="0.01" required>
            </div>
            <div class="form-group">
              <label>分类</label>
              <select v-model="editingBread.categoryId" required>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>描述</label>
              <textarea v-model="editingBread.description" rows="3" required></textarea>
            </div>
            <div class="form-group">
              <label>原料</label>
              <div v-for="(amount, ingredient, index) in editingBread.ingredients" :key="index" class="ingredient-input">
                <input type="text" v-model="ingredientNames[index]" placeholder="原料名称" required>
                <input type="text" v-model="ingredientAmounts[index]" placeholder="用量" required>
                <button type="button" class="remove-ingredient" @click="removeIngredient(index)">×</button>
              </div>
              <button type="button" class="add-ingredient" @click="addIngredient">添加原料</button>
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeEditModal">取消</button>
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
        <p>确定要删除面包 "{{ breadToDelete?.name }}" 吗？此操作不可恢复。</p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeDeleteModal">取消</button>
          <button class="delete-btn" @click="confirmDelete">确认删除</button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      加载中...
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5050/api';

export default {
  name: 'BreadInfo',
  data() {
    return {
      searchTerm: '',
      view: 'grid',
      selectedCategory: 'all',
      showEditModal: false,
      showDeleteModal: false,
      editingBread: null,
      breadToDelete: null,
      ingredientNames: [],
      ingredientAmounts: [],
      categories: [],
      breadData: [],
      loading: false,
      error: null
    }
  },
  computed: {
    filteredBread() {
      return this.breadData.filter(bread => 
        bread.name.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
        (this.selectedCategory === 'all' || bread.categoryId === this.selectedCategory)
      );
    },
    
    filteredCategories() {
      if (this.selectedCategory === 'all') {
        return this.categories.filter(category => 
          this.breadData.some(bread => 
            bread.categoryId === category.id && 
            bread.name.toLowerCase().includes(this.searchTerm.toLowerCase())
          )
        );
      } else {
        return this.categories.filter(category => 
          category.id === this.selectedCategory &&
          this.breadData.some(bread => 
            bread.categoryId === category.id && 
            bread.name.toLowerCase().includes(this.searchTerm.toLowerCase())
          )
        );
      }
    },
    
    totalFilteredBread() {
      return this.filteredBread.length;
    }
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await axios.get(`${API_BASE_URL}/categories`);
        this.categories = response.data;
      } catch (error) {
        this.error = '获取分类失败';
        console.error('Error fetching categories:', error);
      }
    },

    async fetchBreads() {
      this.loading = true;
      try {
        const params = {};
        if (this.selectedCategory !== 'all') {
          params.category = this.selectedCategory;
        }
        if (this.searchTerm) {
          params.search = this.searchTerm;
        }
        
        const response = await axios.get(`${API_BASE_URL}/breads`, { params });
        this.breadData = response.data;
      } catch (error) {
        this.error = '获取面包数据失败';
        console.error('Error fetching breads:', error);
      } finally {
        this.loading = false;
      }
    },

    getBreadByCategory(categoryId) {
      return this.breadData.filter(bread => 
        bread.categoryId === categoryId &&
        bread.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    },

    async saveBreadInfo() {
      try {
        // 更新原料对象
        const ingredients = {};
        this.ingredientNames.forEach((name, index) => {
          if (name && this.ingredientAmounts[index]) {
            ingredients[name] = this.ingredientAmounts[index];
          }
        });
        this.editingBread.ingredients = ingredients;

        if (this.editingBread.id) {
          // 更新现有面包
          await axios.put(`${API_BASE_URL}/breads/${this.editingBread.id}`, this.editingBread);
        } else {
          // 创建新面包
          await axios.post(`${API_BASE_URL}/breads`, this.editingBread);
        }
        
        await this.fetchBreads();
        this.closeEditModal();
      } catch (error) {
        this.error = '保存面包信息失败';
        console.error('Error saving bread:', error);
      }
    },

    async confirmDelete() {
      if (this.breadToDelete) {
        try {
          await axios.delete(`${API_BASE_URL}/breads/${this.breadToDelete.id}`);
          await this.fetchBreads();
          this.closeDeleteModal();
        } catch (error) {
          this.error = '删除面包失败';
          console.error('Error deleting bread:', error);
        }
      }
    },

    editBread(bread) {
      this.editingBread = JSON.parse(JSON.stringify(bread));
      this.ingredientNames = Object.keys(this.editingBread.ingredients);
      this.ingredientAmounts = Object.values(this.editingBread.ingredients);
      this.showEditModal = true;
    },

    deleteBread(bread) {
      this.breadToDelete = bread;
      this.showDeleteModal = true;
    },

    addIngredient() {
      this.ingredientNames.push('');
      this.ingredientAmounts.push('');
    },

    removeIngredient(index) {
      this.ingredientNames.splice(index, 1);
      this.ingredientAmounts.splice(index, 1);
    },

    closeEditModal() {
      this.showEditModal = false;
      this.editingBread = null;
      this.ingredientNames = [];
      this.ingredientAmounts = [];
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
      this.breadToDelete = null;
    },

    addNewBread() {
      this.editingBread = {
        name: '',
        price: '',
        image: '',
        categoryId: this.categories.length ? this.categories[0].id : '',
        description: '',
        ingredients: {},
        stock: 0,
        inStock: true
      };
      this.ingredientNames = [];
      this.ingredientAmounts = [];
      this.showEditModal = true;
    }
  },
  watch: {
    searchTerm() {
      this.fetchBreads();
    },
    selectedCategory() {
      this.fetchBreads();
    }
  },
  async created() {
    await this.fetchCategories();
    await this.fetchBreads();
  }
}
</script>

<style scoped>
/* 全局样式 */
.bread-info {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  color: #333;
}

/* 头部样式 */
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #222;
}

.add-bread-btn {
  background-color: #f8b500;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-bread-btn:hover {
  background-color: #e6a800;
}

/* 控制面板样式 */
.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-container {
  position: relative;
  width: 300px;
}

.search-input {
  width: 100%;
  padding: 10px 15px 10px 40px;
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
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.view-controls {
  display: flex;
  gap: 10px;
}

.view-btn {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 15px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.view-btn.active {
  background-color: #f8b500;
  color: white;
  border-color: #f8b500;
}

/* 分类选择器样式 */
.category-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.category-btn {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.category-btn.active {
  background-color: #f8b500;
  color: white;
  border-color: #f8b500;
}

/* 网格视图样式 */
.category-section {
  margin-bottom: 30px;
}

.category-title {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f8b500;
  color: #333;
}

.bread-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.bread-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  background-color: #fff;
}

.bread-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.bread-card-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  background-color: #f9f9f9;
}

.bread-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.price-tag {
  background-color: #f8b500;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
}

.bread-card-content {
  padding: 15px;
}

.bread-image-container {
  height: 180px;
  overflow: hidden;
  margin-bottom: 15px;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.bread-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.bread-image:hover {
  transform: scale(1.05);
}

.bread-details {
  margin-bottom: 15px;
}

.ingredients-list h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
}

.ingredients-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.ingredients-list li {
  background-color: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.bread-description {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.edit-btn, .delete-btn {
  flex: 1;
  padding: 8px 0;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.edit-btn {
  background-color: #4caf50;
  color: white;
}

.edit-btn:hover {
  background-color: #3d9140;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

/* 表格视图样式 */
.table-view {
  margin-bottom: 30px;
}

.bread-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

.bread-table th, .bread-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.bread-table th {
  background-color: #f8b500;
  color: white;
  font-weight: 500;
}

.bread-table tr:last-child td {
  border-bottom: none;
}

.bread-table tr:hover {
  background-color: #f9f9f9;
}

.table-bread-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.image-col {
  width: 80px;
}

.action-col {
  width: 120px;
}

.ingredients-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ingredients-cell span {
  font-size: 12px;
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
}

.description-cell {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-action-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-right: 5px;
}

.table-action-btn.edit {
  background-color: #4caf50;
  color: white;
}

.table-action-btn.edit:hover {
  background-color: #3d9140;
}

.table-action-btn.delete {
  background-color: #f44336;
  color: white;
}

.table-action-btn.delete:hover {
  background-color: #d32f2f;
}

/* 无结果提示 */
.no-results {
  padding: 30px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #666;
  font-size: 16px;
  margin: 20px 0;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-top: 1px solid #eee;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn:not(:disabled):hover {
  background-color: #f8b500;
  color: white;
  border-color: #f8b500;
}

.pagination-text {
  font-size: 14px;
  color: #666;
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
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

/* 表单样式 */
.bread-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #f8b500;
  box-shadow: 0 0 0 2px rgba(248, 181, 0, 0.2);
}

.ingredient-input {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.ingredient-input input {
  flex: 1;
}

.remove-ingredient {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  width: 30px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.remove-ingredient:hover {
  background-color: #d32f2f;
}

.add-ingredient {
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
  align-self: flex-start;
}

.add-ingredient:hover {
  background-color: #0b7dda;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.cancel-btn, .save-btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
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
  background-color: #4caf50;
  border: none;
  color: white;
}

.save-btn:hover {
  background-color: #3d9140;
}

/* 删除确认模态框 */
.delete-confirm {
  width: 400px;
  padding: 20px;
  text-align: center;
}

.delete-confirm h3 {
  margin-top: 0;
  color: #f44336;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

/* 加载和错误状态 */
.loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  font-size: 18px;
  color: #f8b500;
}

.error {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 10px 15px;
  border-radius: 4px;
  margin: 20px 0;
  font-size: 14px;
  border-left: 4px solid #f44336;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .bread-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
  
  .control-panel {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .search-container {
    width: 100%;
  }
  
  .bread-table {
    display: block;
    overflow-x: auto;
  }
  
  .modal-content {
    width: 95%;
  }
}

@media (max-width: 480px) {
  .bread-grid {
    grid-template-columns: 1fr;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .category-selector {
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 5px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 10px;
  }
}
</style>