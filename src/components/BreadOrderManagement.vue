<template>
  <div class="bread-order-management">
    <header class="header">
      <div class="logo">
        <h1>蒂芙尼早餐&面包</h1>
        <span class="subtitle">面包订单管理系统</span>
      </div>
      <div class="actions">
        <button class="btn btn-primary" @click="showAddOrderModal = true">
          <i class="icon-plus"></i> 新增订单
        </button>
        <button class="btn btn-secondary" @click="refreshOrders">
          <i class="icon-refresh"></i> 刷新数据
        </button>
      </div>
    </header>

    <div class="dashboard">
      <div class="card order-stats">
        <div class="stat-item">
          <div class="stat-value">{{ totalOrders }}</div>
          <div class="stat-label">总订单</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ pendingOrders }}</div>
          <div class="stat-label">待处理</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ processingOrders }}</div>
          <div class="stat-label">处理中</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ completedOrders }}</div>
          <div class="stat-label">已完成</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ cancelledOrders }}</div>
          <div class="stat-label">已取消</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">¥{{ totalRevenue.toFixed(2) }}</div>
          <div class="stat-label">总收入</div>
        </div>
      </div>

      <div class="card search-filters">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索订单号、客户名称或电话..." 
            @input="filterOrders"
          />
          <i class="icon-search"></i>
        </div>
        <div class="filters">
          <div class="filter-group">
            <label>订单状态</label>
            <select v-model="statusFilter" @change="filterOrders">
              <option value="">全部状态</option>
              <option value="pending">待处理</option>
              <option value="processing">处理中</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          <div class="filter-group">
            <label>下单日期</label>
            <div class="date-range">
              <input type="date" v-model="dateRange.start" @change="filterOrders" />
              <span>至</span>
              <input type="date" v-model="dateRange.end" @change="filterOrders" />
            </div>
          </div>
          <button class="btn btn-filter" @click="filterOrders">
            <i class="icon-filter"></i> 筛选
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>面包订单列表</h2>
          <div class="header-actions">
            <div class="sort-options">
              <label>排序:</label>
              <select v-model="sortKey" @change="sortOrders">
                <option value="orderDate">下单日期</option>
                <option value="orderNumber">订单编号</option>
                <option value="customerName">客户姓名</option>
                <option value="totalAmount">订单金额</option>
              </select>
              <button class="btn-icon" @click="toggleSortOrder">
                <i :class="sortOrder === 'asc' ? 'icon-sort-up' : 'icon-sort-down'"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div class="table-container">
          <table class="orders-table" v-if="filteredOrders.length > 0">
            <thead>
              <tr>
                <th>订单编号</th>
                <th>客户姓名</th>
                <th>联系电话</th>
                <th>下单日期</th>
                <th>取餐时间</th>
                <th>面包种类</th>
                <th>订单金额</th>
                <th>订单状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in paginatedOrders" :key="order.id" :class="{'selected': selectedOrder && selectedOrder.id === order.id}">
                <td>{{ order.orderNumber }}</td>
                <td>{{ order.customerName }}</td>
                <td>{{ order.phone }}</td>
                <td>{{ formatDate(order.orderDate) }}</td>
                <td>{{ formatTime(order.pickupTime) }}</td>
                <td>{{ order.items.length }}</td>
                <td>¥{{ order.totalAmount.toFixed(2) }}</td>
                <td>
                  <span class="status-badge" :class="order.status">
                    {{ getStatusText(order.status) }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button class="btn-icon" @click="viewOrderDetails(order)" title="查看详情">
                    <i class="icon-eye"></i>
                  </button>
                  <button class="btn-icon" @click="editOrder(order)" title="编辑订单">
                    <i class="icon-edit"></i>
                  </button>
                  <button class="btn-icon" @click="confirmDeleteOrder(order)" title="删除订单">
                    <i class="icon-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="empty-state" v-else>
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01MCAxMDBDNzcuNjE0MiAxMDAgMTAwIDc3LjYxNDIgMTAwIDUwQzEwMCAyMi4zODU4IDc3LjYxNDIgMCA1MCAwQzIyLjM4NTggMCAwIDIyLjM4NTggMCA1MEMwIDc3LjYxNDIgMjIuMzg1OCAxMDAgNTAgMTAwWiIgZmlsbD0iI0YzRjRGNiIvPgo8cGF0aCBkPSJNNTAgNjBDNTUuNTIyOSA2MCA2MCA1NS41MjI5IDYwIDUwQzYwIDQ0LjQ3NzEgNTUuNTIyOSA0MCA1MCA0MEM0NC40NzcxIDQwIDQwIDQ0LjQ3NzEgNDAgNTBDNDAgNTUuNTIyOSA0NC40NzcxIDYwIDUwIDYwWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTQwIDUwQzQwIDQ0LjQ3NzEgNDQuNDc3MSA0MCA1MCA0MEM1NS41MjI5IDQwIDYwIDQ0LjQ3NzEgNjAgNTAiIHN0cm9rZT0iI0UyRThGMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+" class="empty-icon" alt="No data" />
            <p>没有找到符合条件的订单</p>
            <button class="btn btn-secondary" @click="resetFilters">重置筛选条件</button>
          </div>
        </div>
        
        <div class="pagination" v-if="totalPages > 1">
          <button class="btn-page" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
            <i class="icon-chevron-left"></i>
          </button>
          <div class="page-numbers">
            <button 
              v-for="page in displayedPages" 
              :key="page" 
              class="btn-page" 
              :class="{ active: currentPage === page }"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
          </div>
          <button class="btn-page" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
            <i class="icon-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 订单详情侧边栏 -->
    <div class="order-sidebar" :class="{ active: selectedOrder !== null }">
      <div class="sidebar-header">
        <h2>订单详情</h2>
        <button class="btn-close" @click="closeOrderDetails">
          <i class="icon-close"></i>
        </button>
      </div>
      
      <div class="sidebar-content" v-if="selectedOrder">
        <div class="order-info-header">
          <div class="order-number">订单编号: <strong>{{ selectedOrder.orderNumber }}</strong></div>
          <div class="order-date">下单时间: {{ formatDateTime(selectedOrder.orderDate) }}</div>
          <div class="order-status">
            <span class="status-badge" :class="selectedOrder.status">
              {{ getStatusText(selectedOrder.status) }}
            </span>
          </div>
        </div>
        
        <div class="info-section">
          <h3>客户信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>姓名:</label>
              <div>{{ selectedOrder.customerName }}</div>
            </div>
            <div class="info-item">
              <label>电话:</label>
              <div>{{ selectedOrder.phone }}</div>
            </div>
            <div class="info-item" v-if="selectedOrder.address">
              <label>地址:</label>
              <div>{{ selectedOrder.address }}</div>
            </div>
            <div class="info-item">
              <label>取餐时间:</label>
              <div>{{ formatDateTime(selectedOrder.pickupTime) }}</div>
            </div>
            <div class="info-item">
              <label>支付方式:</label>
              <div>{{ getPaymentMethodText(selectedOrder.paymentMethod) }}</div>
            </div>
          </div>
        </div>
        
        <div class="info-section">
          <h3>面包商品</h3>
          <div class="bread-items">
            <div class="bread-item" v-for="(item, index) in selectedOrder.items" :key="index">
              <div class="bread-image">
                <img :src="getBreadImage(item.breadType)" :alt="item.name" />
              </div>
              <div class="bread-details">
                <div class="bread-name">{{ item.name }}</div>
                <div class="bread-type">{{ getBreadTypeText(item.breadType) }}</div>
                <div class="bread-price">¥{{ item.price.toFixed(2) }} × {{ item.quantity }}</div>
              </div>
              <div class="bread-total">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
            </div>
          </div>
        </div>
        
        <div class="info-section" v-if="selectedOrder.notes">
          <h3>订单备注</h3>
          <div class="order-notes">{{ selectedOrder.notes }}</div>
        </div>
        
        <div class="order-summary">
          <div class="summary-row">
            <span>商品小计:</span>
            <span>¥{{ calculateSubtotal(selectedOrder.items).toFixed(2) }}</span>
          </div>
          <div class="summary-row" v-if="selectedOrder.discount > 0">
            <span>折扣金额:</span>
            <span>-¥{{ selectedOrder.discount.toFixed(2) }}</span>
          </div>
          <div class="summary-row" v-if="selectedOrder.deliveryFee > 0">
            <span>配送费用:</span>
            <span>¥{{ selectedOrder.deliveryFee.toFixed(2) }}</span>
          </div>
          <div class="summary-row total">
            <span>订单总计:</span>
            <span>¥{{ selectedOrder.totalAmount.toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="sidebar-actions">
          <button 
            class="btn btn-primary" 
            @click="updateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status))"
            :disabled="selectedOrder.status === 'completed' || selectedOrder.status === 'cancelled'"
          >
            {{ getStatusActionText(selectedOrder.status) }}
          </button>
          <button class="btn btn-secondary" @click="printOrder(selectedOrder)">
            打印订单
          </button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑订单模态框 -->
    <div class="modal" v-if="showAddOrderModal || showEditOrderModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ showEditOrderModal ? '编辑面包订单' : '新增面包订单' }}</h3>
          <button class="btn-close" @click="closeOrderModal">
            <i class="icon-close"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveOrder">
            <div class="form-section">
              <h4>客户信息</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>客户姓名 <span class="required">*</span></label>
                  <input type="text" v-model="orderForm.customerName" required>
                </div>
                <div class="form-group">
                  <label>联系电话 <span class="required">*</span></label>
                  <input type="tel" v-model="orderForm.phone" required>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>取餐时间 <span class="required">*</span></label>
                  <input type="datetime-local" v-model="orderForm.pickupTime" required>
                </div>
                <div class="form-group">
                  <label>支付方式 <span class="required">*</span></label>
                  <select v-model="orderForm.paymentMethod" required>
                    <option value="cash">现金支付</option>
                    <option value="wechat">微信支付</option>
                    <option value="alipay">支付宝</option>
                    <option value="card">银行卡</option>
                  </select>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group full-width">
                  <label>地址</label>
                  <input type="text" v-model="orderForm.address">
                </div>
              </div>
            </div>
            
            <div class="form-section">
              <div class="section-header">
                <h4>面包商品</h4>
                <button type="button" class="btn btn-sm" @click="addBreadItem">
                  <i class="icon-plus"></i> 添加商品
                </button>
              </div>
              
              <div class="bread-items-form">
                <div class="bread-item-form" v-for="(item, index) in orderForm.items" :key="index">
                  <div class="form-row">
                    <div class="form-group">
                      <label>面包名称 <span class="required">*</span></label>
                      <input type="text" v-model="item.name" required>
                    </div>
                    <div class="form-group">
                      <label>面包类型 <span class="required">*</span></label>
                      <select v-model="item.breadType" required>
                        <option value="sourdough">酸面团面包</option>
                        <option value="baguette">法棍面包</option>
                        <option value="croissant">牛角面包</option>
                        <option value="wholewheat">全麦面包</option>
                        <option value="brioche">布里欧面包</option>
                        <option value="rye">黑麦面包</option>
                        <option value="ciabatta">夏巴塔面包</option>
                        <option value="bagel">贝果面包</option>
                        <option value="focaccia">佛卡夏面包</option>
                        <option value="cake">蛋糕</option>
                        <option value="other">其他</option>
                      </select>
                    </div>
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label>单价 (¥) <span class="required">*</span></label>
                      <input type="number" v-model="item.price" min="0" step="0.01" required>
                    </div>
                    <div class="form-group">
                      <label>数量 <span class="required">*</span></label>
                      <input type="number" v-model="item.quantity" min="1" required>
                    </div>
                    <button type="button" class="btn-icon remove-item" @click="removeBreadItem(index)" title="移除商品">
                      <i class="icon-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="no-items-message" v-if="orderForm.items.length === 0">
                请添加至少一项面包商品
              </div>
            </div>
            
            <div class="form-section">
              <h4>其他信息</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>订单状态 <span class="required">*</span></label>
                  <select v-model="orderForm.status" required>
                    <option value="pending">待处理</option>
                    <option value="processing">处理中</option>
                    <option value="completed">已完成</option>
                    <option value="cancelled">已取消</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>折扣金额 (¥)</label>
                  <input type="number" v-model="orderForm.discount" min="0" step="0.01">
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>配送费 (¥)</label>
                  <input type="number" v-model="orderForm.deliveryFee" min="0" step="0.01">
                </div>
                <div class="form-group">
                  <label>订单总计 (¥)</label>
                  <div class="calculated-total">{{ calculateOrderTotal().toFixed(2) }}</div>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group full-width">
                  <label>备注信息</label>
                  <textarea v-model="orderForm.notes" rows="3"></textarea>
                </div>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeOrderModal">取消</button>
              <button type="submit" class="btn btn-primary" :disabled="orderForm.items.length === 0">保存订单</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div class="modal" v-if="showDeleteConfirmation">
      <div class="modal-content confirmation-modal">
        <h3>确认删除</h3>
        <p>您确定要删除订单 <strong>#{{ orderToDelete.orderNumber }}</strong> 吗？此操作无法撤销。</p>
        <div class="confirmation-actions">
          <button class="btn btn-secondary" @click="cancelDelete">取消</button>
          <button class="btn btn-danger" @click="deleteOrder">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'BreadOrderManagement',
  data() {
    return {
      // 订单数据
      orders: [],
      filteredOrders: [],
      selectedOrder: null,
      
      // 筛选和排序
      searchQuery: '',
      statusFilter: '',
      dateRange: {
        start: '',
        end: ''
      },
      sortKey: 'orderDate',
      sortOrder: 'desc',
      
      // 分页
      currentPage: 1,
      pageSize: 10,
      
      // 模态框状态
      showAddOrderModal: false,
      showEditOrderModal: false,
      showDeleteConfirmation: false,
      orderToDelete: null,
      
      // 订单表单
      orderForm: {
        customerName: '',
        phone: '',
        address: '',
        pickupTime: '',
        paymentMethod: 'cash',
        status: 'pending',
        notes: '',
        items: [],
        discount: 0,
        deliveryFee: 0
      }
    };
  },
  computed: {
    // 总订单数
    totalOrders() {
      return this.orders.length;
    },
    
    // 待处理订单数
    pendingOrders() {
      return this.orders.filter(order => order.status === 'pending').length;
    },
    
    // 处理中订单数
    processingOrders() {
      return this.orders.filter(order => order.status === 'processing').length;
    },
    
    // 已完成订单数
    completedOrders() {
      return this.orders.filter(order => order.status === 'completed').length;
    },
    
    // 已取消订单数
    cancelledOrders() {
      return this.orders.filter(order => order.status === 'cancelled').length;
    },
    
    // 总收入
    totalRevenue() {
      return this.orders
        .filter(order => order.status === 'completed')
        .reduce((total, order) => total + parseFloat(order.totalAmount), 0);
    },
    
    // 总页数
    totalPages() {
      return Math.ceil(this.filteredOrders.length / this.pageSize);
    },
    
    // 当前页订单
    paginatedOrders() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.filteredOrders.slice(startIndex, endIndex);
    },
    
    // 显示的页码
    displayedPages() {
      const pages = [];
      const maxDisplayedPages = 5;
      
      if (this.totalPages <= maxDisplayedPages) {
        // 总页数小于等于最大显示页数，显示所有页码
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 总页数大于最大显示页数
        const halfDisplay = Math.floor(maxDisplayedPages / 2);
        
        // 当前页靠近开始
        if (this.currentPage <= halfDisplay + 1) {
          for (let i = 1; i <= maxDisplayedPages; i++) {
            pages.push(i);
          }
        }
        // 当前页靠近结束
        else if (this.currentPage >= this.totalPages - halfDisplay) {
          for (let i = this.totalPages - maxDisplayedPages + 1; i <= this.totalPages; i++) {
            pages.push(i);
          }
        }
        // 当前页在中间
        else {
          for (let i = this.currentPage - halfDisplay; i <= this.currentPage + halfDisplay; i++) {
            pages.push(i);
          }
        }
      }
      
      return pages;
    }
  },
  created() {
    this.loadOrders();
  },
  methods: {
    // 加载订单数据
    async loadOrders() {
      try {
        // 从后端API获取数据
        const response = await axios.get('http://localhost:5050/api/orders');
        console.log('获取到订单数据:', response.data.length);
        
        // 处理日期字符串为Date对象，并确保数值字段为数字类型
        this.orders = response.data.map(order => ({
          ...order,
          orderDate: new Date(order.orderDate),
          pickupTime: order.pickupTime ? new Date(order.pickupTime) : null,
          totalAmount: parseFloat(order.totalAmount),
          discount: parseFloat(order.discount || 0),
          deliveryFee: parseFloat(order.deliveryFee || 0),
          items: order.items.map(item => ({
            ...item,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity)
          }))
        }));
        
        this.filterOrders();
      } catch (error) {
        console.error('加载订单数据失败:', error);
        this.orders = [];
        this.filterOrders();
      }
    },
    
    // 刷新订单数据
    async refreshOrders() {
      try {
        await this.loadOrders();
        this.selectedOrder = null;
        this.$nextTick(() => {
          alert('订单数据已刷新');
        });
      } catch (error) {
        console.error('刷新订单数据失败:', error);
        alert('刷新订单数据失败，请重试');
      }
    },
    
    // 筛选订单
    filterOrders() {
      let result = [...this.orders];
      
      // 搜索条件筛选
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(order => 
          (order.orderNumber && order.orderNumber.toLowerCase().includes(query)) ||
          (order.customerName && order.customerName.toLowerCase().includes(query)) ||
          (order.phone && order.phone.includes(query))
        );
      }
      
      // 状态筛选
      if (this.statusFilter) {
        result = result.filter(order => order.status === this.statusFilter);
      }
      
      // 日期范围筛选
      if (this.dateRange.start) {
        const startDate = new Date(this.dateRange.start);
        startDate.setHours(0, 0, 0, 0);
        result = result.filter(order => {
          const orderDate = new Date(order.orderDate);
          return orderDate >= startDate;
        });
      }
      
      if (this.dateRange.end) {
        const endDate = new Date(this.dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        result = result.filter(order => {
          const orderDate = new Date(order.orderDate);
          return orderDate <= endDate;
        });
      }
      
      this.filteredOrders = this.sortOrders(result);
      this.currentPage = 1; // 重置到第一页
    },
    
    // 重置筛选条件
    resetFilters() {
      this.searchQuery = '';
      this.statusFilter = '';
      this.dateRange.start = '';
      this.dateRange.end = '';
      this.filterOrders();
    },
    
    // 排序订单
    sortOrders(ordersToSort = null) {
      const orders = ordersToSort || [...this.filteredOrders];
      
      return orders.sort((a, b) => {
        let valueA = a[this.sortKey];
        let valueB = b[this.sortKey];
        
        // 日期类型特殊处理
        if (this.sortKey === 'orderDate' || this.sortKey === 'pickupTime') {
          valueA = new Date(valueA).getTime();
          valueB = new Date(valueB).getTime();
        }
        
        // 字符串类型特殊处理
        if (typeof valueA === 'string') {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }
        
        // 根据排序方向返回比较结果
        if (this.sortOrder === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
    },
    
    // 切换排序方向
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      this.filteredOrders = this.sortOrders();
    },
    
    // 更改页码
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    
    // 查看订单详情
    viewOrderDetails(order) {
      this.selectedOrder = order;
    },
    
    // 关闭订单详情
    closeOrderDetails() {
      this.selectedOrder = null;
    },
    
    // 编辑订单
    editOrder(order) {
      // 复制订单数据到表单
      this.orderForm = {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        phone: order.phone,
        address: order.address || '',
        pickupTime: this.formatDateTimeForInput(order.pickupTime),
        paymentMethod: order.paymentMethod,
        status: order.status,
        notes: order.notes || '',
        items: JSON.parse(JSON.stringify(order.items)), // 深拷贝
        discount: order.discount || 0,
        deliveryFee: order.deliveryFee || 0
      };
      
      this.showEditOrderModal = true;
    },
    
    // 确认删除订单
    confirmDeleteOrder(order) {
      this.orderToDelete = order;
      this.showDeleteConfirmation = true;
    },
    
    // 取消删除
    cancelDelete() {
      this.orderToDelete = null;
      this.showDeleteConfirmation = false;
    },
    
    // 删除订单
    async deleteOrder() {
      try {
        await axios.delete(`http://localhost:5050/api/orders/${this.orderToDelete.id}`);

        // 重新加载订单数据
        await this.loadOrders();
        
        // 如果删除的是当前选中的订单，则清除选中
        if (this.selectedOrder && this.selectedOrder.id === this.orderToDelete.id) {
          this.selectedOrder = null;
        }
        
        this.showDeleteConfirmation = false;
        this.orderToDelete = null;
        alert('订单删除成功');
      } catch (error) {
        console.error('删除订单失败:', error);
        alert('删除订单失败，请重试');
      }
    },
    
    // 更新订单状态
    async updateOrderStatus(orderId, newStatus) {
      try {
        await axios.put(`http://localhost:5050/api/orders/${orderId}/status`, {
          status: newStatus
        });

        // 重新加载订单数据
        await this.loadOrders();
        
        // 如果当前有选中的订单，也更新它的状态
        if (this.selectedOrder && this.selectedOrder.id === orderId) {
          this.selectedOrder.status = newStatus;
        }
      } catch (error) {
        console.error('更新订单状态失败:', error);
        alert('更新订单状态失败，请重试');
      }
    },
    
    // 打印订单
    printOrder(order) {
      // 在实际应用中，这里应该调用打印功能
      console.log('打印订单:', order.orderNumber);
      alert(`正在打印订单 #${order.orderNumber}`);
    },
    
    // 添加面包商品
    addBreadItem() {
      this.orderForm.items.push({
        name: '',
        breadType: 'sourdough',
        price: 0,
        quantity: 1
      });
    },
    
    // 移除面包商品
    removeBreadItem(index) {
      this.orderForm.items.splice(index, 1);
    },
    
    // 关闭订单模态框
    closeOrderModal() {
      this.showAddOrderModal = false;
      this.showEditOrderModal = false;
      this.resetOrderForm();
    },
    
    // 重置订单表单
    resetOrderForm() {
      this.orderForm = {
        customerName: '',
        phone: '',
        address: '',
        pickupTime: '',
        paymentMethod: 'cash',
        status: 'pending',
        notes: '',
        items: [],
        discount: 0,
        deliveryFee: 0
      };
      
      // 添加一个默认的空商品项
      this.addBreadItem();
    },
    
    // 保存订单
    async saveOrder() {
      try {
        const totalAmount = this.calculateOrderTotal();
        
        // 确保数据类型正确
        const orderData = {
          ...this.orderForm,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          discount: parseFloat(this.orderForm.discount || 0),
          deliveryFee: parseFloat(this.orderForm.deliveryFee || 0),
          items: this.orderForm.items.map(item => ({
            ...item,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity)
          }))
        };

        if (this.showEditOrderModal) {
          // 更新现有订单
          await axios.put(`http://localhost:5050/api/orders/${this.orderForm.id}`, orderData);
          console.log('订单更新成功:', orderData);
        } else {
          // 创建新订单
          await axios.post('http://localhost:5050/api/orders', orderData);
          console.log('订单创建成功:', orderData);
        }

        // 重新加载订单数据
        await this.loadOrders();
        this.closeOrderModal();
        alert(this.showEditOrderModal ? '订单更新成功' : '订单创建成功');
      } catch (error) {
        console.error('保存订单失败:', error);
        alert('保存订单失败，请重试');
      }
    },
    
    // 计算订单小计
    calculateSubtotal(items) {
      return items.reduce((total, item) => total + (parseFloat(item.price) * parseInt(item.quantity)), 0);
    },
    
    // 计算订单总计
    calculateOrderTotal() {
      const subtotal = this.calculateSubtotal(this.orderForm.items);
      const discount = parseFloat(this.orderForm.discount) || 0;
      const deliveryFee = parseFloat(this.orderForm.deliveryFee) || 0;
      return subtotal - discount + deliveryFee;
    },
    
    // 获取订单状态文本
    getStatusText(status) {
      const statusMap = {
        'pending': '待处理',
        'processing': '处理中',
        'completed': '已完成',
        'cancelled': '已取消'
      };
      return statusMap[status] || status;
    },
    
    // 获取支付方式文本
    getPaymentMethodText(method) {
      const methodMap = {
        'cash': '现金支付',
        'wechat': '微信支付',
        'alipay': '支付宝',
        'card': '银行卡'
      };
      return methodMap[method] || method;
    },
    
    // 获取面包类型文本
    getBreadTypeText(type) {
      const typeMap = {
        'sourdough': '酸面团面包',
        'baguette': '法棍面包',
        'croissant': '牛角面包',
        'wholewheat': '全麦面包',
        'brioche': '布里欧面包',
        'rye': '黑麦面包',
        'ciabatta': '夏巴塔面包',
        'bagel': '贝果面包',
        'focaccia': '佛卡夏面包',
        'cake': '蛋糕',
        'other': '其他'
      };
      return typeMap[type] || type;
    },
    
    // 获取面包图片
    getBreadImage(type) {
      // 在实际应用中，这里应该返回不同面包类型的图片URL
      // 这里使用一个简单的占位符图片
      return `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI0Y1RjVGNSIvPgo8cGF0aCBkPSJNMjAgMjBINDRWNDRIMjBWMjBaIiBmaWxsPSIjRThFOEU4Ii8+CjxwYXRoIGQ9Ik0zMiAyMEMzOC42Mjc0IDIwIDQ0IDI1LjM3MjYgNDQgMzJDNDQgMzguNjI3NCAzOC42Mjc0IDQ0IDMyIDQ0QzI1LjM3MjYgNDQgMjAgMzguNjI3NCAyMCAzMkMyMCAyNS4zNzI2IDI1LjM3MjYgMjAgMzIgMjBaIiBmaWxsPSIjRTBFMEUwIi8+Cjwvc3ZnPg==`;
    },
    
    // 获取下一个状态
    getNextStatus(status) {
      const statusFlow = {
        'pending': 'processing',
        'processing': 'completed',
        'completed': 'completed',
        'cancelled': 'pending'
      };
      return statusFlow[status] || status;
    },
    
    // 获取状态操作文本
    getStatusActionText(status) {
      const actionMap = {
        'pending': '开始处理',
        'processing': '标记完成',
        'completed': '已完成',
        'cancelled': '重新处理'
      };
      return actionMap[status] || '更新状态';
    },
    
    // 格式化日期
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },
    
    // 格式化时间
    formatTime(date) {
      if (!date) return '';
      const d = new Date(date);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    },
    
    // 格式化日期时间
    formatDateTime(date) {
      if (!date) return '';
      return `${this.formatDate(date)} ${this.formatTime(date)}`;
    },
    
    // 格式化日期时间为输入框格式
    formatDateTimeForInput(date) {
      if (!date) return '';
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
  }
};
</script>

<style>
/* 全局样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  background-color: #f5f7fa;
}

.bread-order-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

/* 头部样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.logo {
  display: flex;
  flex-direction: column;
}

.logo h1 {
  font-size: 24px;
  color: #1a202c;
  margin: 0;
  font-weight: 700;
}

.subtitle {
  font-size: 14px;
  color: #718096;
  margin-top: 4px;
}

.actions {
  display: flex;
  gap: 12px;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border: none;
  font-size: 14px;
  gap: 6px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 4px 12px;
  font-size: 12px;
}

.btn-primary {
  background-color: #4a5568;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2d3748;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #cbd5e0;
}

.btn-danger {
  background-color: #e53e3e;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c53030;
}

.btn-filter {
  background-color: #edf2f7;
  color: #4a5568;
}

.btn-filter:hover {
  background-color: #e2e8f0;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: #4a5568;
  transition: all 0.2s;
}

.btn-icon:hover {
  background-color: #edf2f7;
}

.btn-page {
  min-width: 32px;
  height: 32px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  color: #4a5568;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  background-color: #edf2f7;
}

.btn-page.active {
  background-color: #4a5568;
  color: white;
  border-color: #4a5568;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #718096;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #4a5568;
}

/* 卡片样式 */
.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  overflow: hidden;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 仪表盘统计卡片 */
.dashboard {
  margin-bottom: 24px;
}

.order-stats {
  display: flex;
  padding: 20px;
  margin-bottom: 24px;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 0 15px;
  border-right: 1px solid #e2e8f0;
}

.stat-item:last-child {
  border-right: none;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #718096;
}

/* 搜索和筛选 */
.search-filters {
  padding: 16px 20px;
  margin-bottom: 24px;
}

.search-box {
  position: relative;
  margin-bottom: 16px;
}

.search-box input {
  width: 100%;
  padding: 10px 12px;
  padding-right: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #4a5568;
}

.search-box i {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 500;
  color: #718096;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-range input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  flex: 1;
  font-size: 14px;
}

.date-range span {
  color: #718096;
}

/* 排序选项 */
.sort-options {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-options label {
  font-size: 14px;
  color: #718096;
}

.sort-options select {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
}

/* 表格样式 */
.table-container {
  overflow-x: auto;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.orders-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
}

.orders-table tr:hover {
  background-color: #f7fafc;
}

.orders-table tr.selected {
  background-color: #edf2f7;
}

.orders-table tr:last-child td {
  border-bottom: none;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

.status-badge.pending {
  background-color: #feebc8;
  color: #c05621;
}

.status-badge.processing {
  background-color: #bee3f8;
  color: #2b6cb0;
}

.status-badge.completed {
  background-color: #c6f6d5;
  color: #276749;
}

.status-badge.cancelled {
  background-color: #fed7d7;
  color: #c53030;
}

.actions-cell {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

/* 空状态 */
.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #718096;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.empty-state p {
  margin-bottom: 16px;
  font-size: 16px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  gap: 8px;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

/* 侧边栏 */
.order-sidebar {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100vh;
  background-color: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
}

.order-sidebar.active {
  right: 0;
}

.sidebar-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8fafc;
}

.sidebar-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.order-info-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.order-number {
  font-size: 16px;
  color: #1a202c;
  margin-bottom: 4px;
}

.order-date {
  font-size: 14px;
  color: #718096;
  margin-bottom: 8px;
}

.info-section {
  margin-bottom: 24px;
}

.info-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 12px;
  color: #718096;
  font-weight: 500;
}

.info-item div {
  font-size: 14px;
  color: #1a202c;
}

/* 面包商品列表 */
.bread-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bread-item {
  display: flex;
  padding: 12px;
  background-color: #f8fafc;
  border-radius: 6px;
  gap: 12px;
  align-items: center;
}

.bread-image {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
}

.bread-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bread-details {
  flex: 1;
}

.bread-name {
  font-weight: 500;
  color: #1a202c;
  margin-bottom: 2px;
}

.bread-type {
  font-size: 12px;
  color: #718096;
  margin-bottom: 4px;
}

.bread-price {
  font-size: 12px;
  color: #4a5568;
}

.bread-total {
  font-weight: 600;
  color: #1a202c;
}

/* 订单备注 */
.order-notes {
  padding: 12px;
  background-color: #f8fafc;
  border-radius: 6px;
  font-size: 14px;
  color: #4a5568;
  font-style: italic;
  line-height: 1.5;
}

/* 订单总结 */
.order-summary {
  background-color: #f8fafc;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 24px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #4a5568;
}

.summary-row.total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  font-weight: 600;
  font-size: 16px;
  color: #1a202c;
}

.sidebar-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

/* 模态框 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modal-slide-in 0.3s ease;
}

@keyframes modal-slide-in {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.modal-body {
  padding: 20px;
}

.confirmation-modal {
  max-width: 400px;
  padding: 24px;
  text-align: center;
}

.confirmation-modal h3 {
  margin-bottom: 16px;
}

.confirmation-modal p {
  margin-bottom: 24px;
  color: #4a5568;
}

.confirmation-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

/* 表单样式 */
.form-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.form-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.form-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  flex: 1;
  min-width: 200px;
}

.form-group.full-width {
  min-width: 100%;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 6px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4a5568;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.required {
  color: #e53e3e;
}

.calculated-total {
  padding: 8px 12px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-weight: 600;
  color: #1a202c;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* 面包项表单 */
.bread-items-form {
  margin-bottom: 16px;
}

.bread-item-form {
  background-color: #f8fafc;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  position: relative;
}

.bread-item-form:last-child {
  margin-bottom: 0;
}

.remove-item {
  position: absolute;
  top: 8px;
  right: 8px;
}

.no-items-message {
  padding: 12px;
  background-color: #feebc8;
  color: #c05621;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}

/* 图标 */
[class^="icon-"] {
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
}

.icon-plus:before { content: "+"; }
.icon-refresh:before { content: "↻"; }
.icon-search:before { content: "🔍"; }
.icon-filter:before { content: "⚡"; }
.icon-sort-up:before { content: "↑"; }
.icon-sort-down:before { content: "↓"; }
.icon-eye:before { content: "👁"; }
.icon-edit:before { content: "✎"; }
.icon-trash:before { content: "🗑"; }
.icon-close:before { content: "×"; }
.icon-chevron-left:before { content: "←"; }
.icon-chevron-right:before { content: "→"; }

/* 响应式设计 */
@media (max-width: 992px) {
  .order-stats {
    flex-wrap: wrap;
  }
  
  .stat-item {
    flex: 1 0 45%;
    margin-bottom: 16px;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 16px;
  }
  
  .order-sidebar {
    width: 100%;
    right: -100%;
  }
}

@media (max-width: 768px) {
  .actions {
    flex-direction: column;
    width: 100%;
  }
  
  .btn {
    width: 100%;
  }
  
  .stat-item {
    flex: 1 0 100%;
  }
  
  .orders-table th:nth-child(4),
  .orders-table td:nth-child(4),
  .orders-table th:nth-child(5),
  .orders-table td:nth-child(5) {
    display: none;
  }
}

@media (max-width: 576px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .logo {
    margin-bottom: 16px;
  }
  
  .actions {
    width: 100%;
  }
  
  .orders-table th:nth-child(3),
  .orders-table td:nth-child(3),
  .orders-table th:nth-child(6),
  .orders-table td:nth-child(6) {
    display: none;
  }
}
</style>