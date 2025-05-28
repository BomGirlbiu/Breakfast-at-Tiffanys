<template>
  <div class="bread-inventory">
    <h1 class="page-title">面包库存管理</h1>
    
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
              <span :class="['stock-badge', bread.inStock ? 'in-stock' : 'out-of-stock']">
                {{ bread.inStock ? '有货' : '缺货' }}
              </span>
            </div>
            <div class="bread-card-content">
              <div class="bread-image-container">
                <img :src="bread.image" :alt="bread.name" class="bread-image">
              </div>
              <div class="bread-details">
                <div class="bread-stock">
                  库存: <span class="stock-value">{{ bread.stock }}</span>
                </div>
                <div class="bread-price">¥{{ bread.price.toFixed(2) }}</div>
              </div>
              <button 
                class="update-btn" 
                :disabled="!bread.inStock"
                @click="openStockModal(bread)"
              >
                {{ bread.inStock ? '更新库存' : '补充库存' }}
              </button>
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
              <th>库存</th>
              <th>状态</th>
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
              <td>{{ bread.stock }}</td>
              <td>
                <span :class="['stock-badge', bread.inStock ? 'in-stock' : 'out-of-stock']">
                  {{ bread.inStock ? '有货' : '缺货' }}
                </span>
              </td>
              <td class="action-col">
                <button 
                  class="table-action-btn" 
                  :disabled="!bread.inStock"
                  @click="openStockModal(bread)"
                >
                  {{ bread.inStock ? '更新' : '补充' }}
                </button>
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

    <!-- 弹窗部分 -->
    <div v-if="showStockModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>更新库存</h2>
          <button class="close-btn" @click="closeStockModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>库存数量</label>
            <input type="number" v-model="newStock" min="0" />
          </div>
          <div class="form-group">
            <label>是否上架</label>
            <select v-model="newInStock">
              <option :value="true">上架（有货）</option>
              <option :value="false">下架（缺货）</option>
            </select>
          </div>
          <div class="form-actions">
            <button class="cancel-btn" @click="closeStockModal">取消</button>
            <button class="save-btn" @click="updateStock">保存</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5050/api';

export default {
  name: 'BreadInventory',
  data() {
    return {
      searchTerm: '',
      view: 'grid',
      selectedCategory: 'all',
      categories: [
        { id: 'french', name: '法式面包' },
        { id: 'whole-wheat', name: '全麦面包' },
        { id: 'specialty', name: '特色面包' },
        { id: 'sweet', name: '甜面包' }
      ],
      breadData: [
        {
          id: 1,
          name: '法式长棍面包',
          price: 15.99,
          stock: 24,
          inStock: true,
          image: 'https://via.placeholder.com/80',
          categoryId: 'french'
        },
        {
          id: 2,
          name: '法式乡村面包',
          price: 18.50,
          stock: 12,
          inStock: true,
          image: 'https://via.placeholder.com/80',
          categoryId: 'french'
        },
        {
          id: 3,
          name: '全麦面包',
          price: 12.5,
          stock: 18,
          inStock: true,
          image: 'https://via.placeholder.com/80',
          categoryId: 'whole-wheat'
        },
        {
          id: 4,
          name: '全麦核桃面包',
          price: 16.99,
          stock: 8,
          inStock: true,
          image: 'https://via.placeholder.com/80',
          categoryId: 'whole-wheat'
        },
        {
          id: 5,
          name: '芝麻面包',
          price: 9.99,
          stock: 0,
          inStock: false,
          image: 'https://via.placeholder.com/80',
          categoryId: 'specialty'
        },
        {
          id: 6,
          name: '核桃面包',
          price: 18.5,
          stock: 12,
          inStock: true,
          image: 'https://via.placeholder.com/80',
          categoryId: 'specialty'
        },
        {
          id: 7,
          name: '葡萄干面包',
          price: 14.99,
          stock: 8,
          inStock: true,
          image: 'https://via.placeholder.com/80',
          categoryId: 'sweet'
        },
        {
          id: 8,
          name: '黑麦面包',
          price: 16.5,
          stock: 0,
          inStock: false,
          image: 'https://via.placeholder.com/80',
          categoryId: 'specialty'
        },
        {
          id: 9,
          name: '奶油面包',
          price: 11.99,
          stock: 15,
          inStock: true,
          image: 'https://via.placeholder.com/80',
          categoryId: 'sweet'
        },
        {
          id: 10,
          name: '蔓越莓面包',
          price: 19.99,
          stock: 6,
          inStock: true,
          image: 'https://via.placeholder.com/80',
          categoryId: 'sweet'
        }
      ],
      showStockModal: false,
      stockBread: null,
      newStock: 0,
      newInStock: true
    }
  },
  computed: {
    // 根据搜索词过滤面包
    filteredBread() {
      return this.breadData.filter(bread => 
        bread.name.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
        (this.selectedCategory === 'all' || bread.categoryId === this.selectedCategory)
      );
    },
    
    // 获取过滤后的分类（只显示有面包的分类）
    filteredCategories() {
      if (this.selectedCategory === 'all') {
        // 如果选择全部，只返回有匹配面包的分类
        return this.categories.filter(category => 
          this.breadData.some(bread => 
            bread.categoryId === category.id && 
            bread.name.toLowerCase().includes(this.searchTerm.toLowerCase())
          )
        );
      } else {
        // 如果选择特定分类，只返回该分类（如果有匹配的面包）
        return this.categories.filter(category => 
          category.id === this.selectedCategory &&
          this.breadData.some(bread => 
            bread.categoryId === category.id && 
            bread.name.toLowerCase().includes(this.searchTerm.toLowerCase())
          )
        );
      }
    },
    
    // 计算过滤后的面包总数
    totalFilteredBread() {
      return this.filteredBread.length;
    }
  },
  methods: {
    // 根据分类获取面包
    getBreadByCategory(categoryId) {
      return this.breadData.filter(bread => 
        bread.categoryId === categoryId &&
        bread.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    },
    openStockModal(bread) {
      this.stockBread = { ...bread };
      this.newStock = bread.stock;
      this.newInStock = bread.inStock;
      this.showStockModal = true;
    },
    async updateStock() {
      try {
        const stockData = {
          stock: this.newStock,
          inStock: this.newInStock
        };
        
        const response = await axios.put(
          `${API_BASE_URL}/breads/${this.stockBread.id}/stock`, 
          stockData
        );
        
        // 更新本地数据
        const index = this.breadData.findIndex(b => b.id === this.stockBread.id);
        if (index !== -1) {
          this.breadData[index] = {
            ...this.breadData[index],
            stock: this.newStock,
            inStock: this.newInStock
          };
        }
        
        this.showStockModal = false;
        this.stockBread = null;
        alert('库存更新成功');
      } catch (error) {
        console.error('库存更新失败:', error);
        alert(error.response?.data?.message || '库存更新失败，请重试');
      }
    },
    closeStockModal() {
      this.showStockModal = false;
      this.stockBread = null;
    },
  }
}
</script>

<style scoped>
.bread-inventory {
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

/* 控制面板样式 */
.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.search-container {
  position: relative;
  width: 300px;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 32px;
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
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #666;
}

.view-controls {
  display: flex;
  gap: 8px;
}

.view-btn {
  padding: 8px 12px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.view-btn.active {
  background-color: #f8b500;
  color: white;
  border-color: #f8b500;
}

/* 分类选择器样式 */
.category-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.category-btn {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.category-btn.active {
  background-color: #f8b500;
  color: white;
  border-color: #f8b500;
}

/* 分类标题 */
.category-title {
  font-size: 18px;
  margin: 20px 0 10px 0;
  padding-bottom: 5px;
  border-bottom: 2px solid #f8b500;
  color: #333;
}

/* 网格视图样式 */
.bread-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.bread-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.bread-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.bread-card-header {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  background-color: #f9f9f9;
}

.bread-name {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: #333;
}

.stock-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.in-stock {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.out-of-stock {
  background-color: #ffebee;
  color: #c62828;
}

.bread-card-content {
  padding: 12px;
}

.bread-image-container {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.bread-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.bread-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.bread-stock {
  font-size: 14px;
  color: #666;
}

.stock-value {
  font-weight: 500;
  color: #333;
}

.bread-price {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.update-btn {
  width: 100%;
  padding: 8px 0;
  background-color: #f8b500;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.update-btn:hover:not(:disabled) {
  background-color: #e6a800;
}

.update-btn:disabled {
  background-color: #ffeeba;
  cursor: not-allowed;
}

/* 表格视图样式 */
.bread-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
}

.bread-table th,
.bread-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.bread-table th {
  background-color: #f8b500;
  color: white;
  font-weight: 500;
}

.image-col {
  width: 80px;
}

.action-col {
  width: 100px;
  text-align: right;
}

.table-bread-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.table-action-btn {
  padding: 6px 12px;
  background-color: #f8b500;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.table-action-btn:hover:not(:disabled) {
  background-color: #e6a800;
}

.table-action-btn:disabled {
  background-color: #ffeeba;
  color: #666;
  cursor: not-allowed;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
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
  width: 32px;
  height: 32px;
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
  color: #ccc;
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

/* 无结果提示 */
.no-results {
  padding: 40px;
  text-align: center;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #eee;
  color: #666;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .control-panel {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .bread-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .pagination {
    flex-direction: column;
    gap: 10px;
  }
}

/* 弹窗样式 */
.modal {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  max-height: 80%;
  overflow-y: auto;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
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
  gap: 10px;
}

.cancel-btn,
.save-btn {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
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
  background-color: #f8b500;
  border: none;
  color: white;
}

.save-btn:hover {
  background-color: #e6a800;
}
</style>