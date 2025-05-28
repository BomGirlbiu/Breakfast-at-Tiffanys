<template>
  <div class="financial-page">
    <h1 class="page-title">财务分析</h1>
    
    <!-- 功能区域选择 -->
    <div class="function-tabs">
      <button 
        :class="['tab-button', { active: activeTab === 'analysis' }]" 
        @click="activeTab = 'analysis'">
        财务分析
      </button>
      <button 
        :class="['tab-button', { active: activeTab === 'expense-manage' }]" 
        @click="activeTab = 'expense-manage'">
        支出管理
      </button>
    </div>
    
    <!-- 财务分析部分 -->
    <div v-if="activeTab === 'analysis'">
      <!-- 财务概览卡片 -->
      <div class="financial-overview">
        <div class="overview-card income">
          <h3>选定期间收入</h3>
          <div v-if="loading.summary" class="loading-spinner"></div>
          <template v-else>
            <div class="amount">¥{{ formatNumber(monthlyIncome) }}</div>
            <div class="trend" :class="{ 'up': incomeTrend > 0, 'down': incomeTrend < 0 }">
              {{ incomeTrend > 0 ? '+' : '' }}{{ incomeTrend }}%
            </div>
          </template>
        </div>
        <div class="overview-card expense">
          <h3>选定期间支出</h3>
          <div v-if="loading.summary" class="loading-spinner"></div>
          <template v-else>
            <div class="amount">¥{{ formatNumber(monthlyExpense) }}</div>
            <div class="trend" :class="{ 'up': expenseTrend > 0, 'down': expenseTrend < 0 }">
              {{ expenseTrend > 0 ? '+' : '' }}{{ expenseTrend }}%
            </div>
          </template>
        </div>
        <div class="overview-card profit">
          <h3>选定期间利润</h3>
          <div v-if="loading.summary" class="loading-spinner"></div>
          <template v-else>
            <div class="amount">¥{{ formatNumber(monthlyProfit) }}</div>
            <div class="trend" :class="{ 'up': profitTrend > 0, 'down': profitTrend < 0 }">
              {{ profitTrend > 0 ? '+' : '' }}{{ profitTrend }}%
            </div>
          </template>
        </div>
      </div>

      <!-- 日期范围选择器 -->
      <div class="date-filter-section">
        <div class="date-range">
          <span>日期范围：</span>
          <input type="date" v-model="startDate" class="date-input" @change="handleDateChange">
          <span>至</span>
          <input type="date" v-model="endDate" class="date-input" @change="handleDateChange">
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-container">
        <!-- 收入支出趋势图 -->
        <div class="chart-card">
          <h3>收入支出趋势</h3>
          <div v-if="loading.trends" class="chart-loading">加载中...</div>
          <div ref="trendChart" class="chart"></div>
        </div>
        
        <!-- 收入构成饼图 -->
        <div class="chart-card">
          <h3>收入构成</h3>
          <div v-if="loading.incomePie" class="chart-loading">加载中...</div>
          <div ref="incomePieChart" class="chart"></div>
        </div>
        
        <!-- 支出构成饼图 -->
        <div class="chart-card">
          <h3>支出构成</h3>
          <div v-if="loading.expensePie" class="chart-loading">加载中...</div>
          <div ref="expensePieChart" class="chart"></div>
        </div>
      </div>

      <!-- 详细数据表格 -->
      <div class="data-table-container">
        <h3>财务明细</h3>
        <div class="table-controls">
          <div class="date-range">
            <input type="date" v-model="startDate" class="date-input">
            <span>至</span>
            <input type="date" v-model="endDate" class="date-input">
          </div>
          <div class="table-filters">
            <select v-model="selectedType" class="filter-select">
              <option value="all">全部类型</option>
              <option value="income">收入</option>
              <option value="expense">支出</option>
            </select>
          </div>
        </div>
        
        <div v-if="loading.transactions" class="table-loading">
          <div class="loading-spinner"></div>
          <div>加载交易数据中...</div>
        </div>
        
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>类型</th>
              <th>分类</th>
              <th>金额</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredTransactions" :key="item.id">
              <td>{{ formatDate(item.date) }}</td>
              <td>
                <span :class="['type-badge', item.type]">
                  {{ item.type === 'income' ? '收入' : '支出' }}
                </span>
              </td>
              <td>{{ item.category }}</td>
              <td :class="item.type === 'income' ? 'income-amount' : 'expense-amount'">
                {{ item.type === 'income' ? '+' : '-' }}¥{{ formatNumber(item.amount) }}
              </td>
              <td>{{ item.note }}</td>
            </tr>
            <tr v-if="filteredTransactions.length === 0">
              <td colspan="5" class="no-data">没有符合条件的交易记录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 支出管理部分 -->
    <div v-if="activeTab === 'expense-manage'" class="expense-manage">
      <div class="expense-header">
        <h3>支出管理</h3>
        <button class="add-button" @click="openExpenseDialog(null)">添加支出</button>
      </div>

      <!-- 支出筛选器 -->
      <div class="filter-section">
        <div class="date-range">
          <input type="date" v-model="startDate" class="date-input">
          <span>至</span>
          <input type="date" v-model="endDate" class="date-input">
        </div>
        <div class="category-filter">
          <select v-model="selectedCategory" class="filter-select">
            <option value="">全部类别</option>
            <option v-for="category in expenseCategories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
      </div>

      <!-- 支出列表 -->
      <div v-if="loading.expenses" class="loading-container">
        <div class="loading-spinner"></div>
        <div>加载支出数据中...</div>
      </div>
      <div v-else class="expense-list">
        <table class="data-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>类别</th>
              <th>金额</th>
              <th>备注</th>
              <th>创建人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="expense in filteredExpenses" :key="expense.id">
              <td>{{ formatDate(expense.expenseDate) }}</td>
              <td>
                <span class="category-badge">{{ expense.category }}</span>
              </td>
              <td class="expense-amount">¥{{ formatNumber(expense.amount) }}</td>
              <td>{{ expense.note || '无' }}</td>
              <td>{{ expense.createdBy }}</td>
              <td class="actions">
                <button class="action-button edit" @click="openExpenseDialog(expense)">编辑</button>
                <button class="action-button delete" @click="confirmDeleteExpense(expense)">删除</button>
              </td>
            </tr>
            <tr v-if="filteredExpenses.length === 0">
              <td colspan="6" class="no-data">没有符合条件的支出记录</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 支出编辑对话框 -->
      <div v-if="showExpenseDialog" class="dialog-overlay" @click.self="showExpenseDialog = false">
        <div class="dialog-content">
          <h3>{{ currentExpense.id ? '编辑支出' : '添加支出' }}</h3>
          <form @submit.prevent="saveExpense">
            <div class="form-group">
              <label for="expenseDate">支出日期</label>
              <input type="date" id="expenseDate" v-model="currentExpense.expenseDate" required>
            </div>
            <div class="form-group">
              <label for="category">支出类别</label>
              <select id="category" v-model="currentExpense.category" required>
                <option v-for="category in expenseCategories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="amount">金额</label>
              <input type="number" id="amount" v-model="currentExpense.amount" step="0.01" min="0" required>
            </div>
            <div class="form-group">
              <label for="note">备注</label>
              <textarea id="note" v-model="currentExpense.note" rows="3"></textarea>
            </div>
            <div class="form-buttons">
              <button type="button" class="cancel-button" @click="showExpenseDialog = false">取消</button>
              <button type="submit" class="save-button">保存</button>
            </div>
          </form>
        </div>
      </div>

      <!-- 删除确认对话框 -->
      <div v-if="showDeleteDialog" class="dialog-overlay" @click.self="showDeleteDialog = false">
        <div class="dialog-content delete-dialog">
          <h3>确认删除</h3>
          <p>您确定要删除这条支出记录吗？此操作不可撤销。</p>
          <div class="form-buttons">
            <button class="cancel-button" @click="showDeleteDialog = false">取消</button>
            <button class="delete-button" @click="deleteExpense">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import axios from 'axios'

export default {
  name: 'FinancialPage',
  data() {
    return {
      // 概览数据
      monthlyIncome: 0,
      monthlyExpense: 0,
      monthlyProfit: 0,
      incomeTrend: 0,
      expenseTrend: 0,
      profitTrend: 0,

      // 日期范围
      startDate: this.getDefaultStartDate(),
      endDate: this.getDefaultEndDate(),
      selectedType: 'all',

      // 图表实例
      trendChart: null,
      incomePieChart: null,
      expensePieChart: null,

      // 交易数据
      transactions: [],
      
      // 支出管理相关数据
      expenses: [],
      expenseCategories: [],
      selectedCategory: '',
      currentExpense: {
        id: null,
        expenseDate: '',
        category: '',
        amount: 0,
        note: '',
        createdBy: 'admin'
      },
      showExpenseDialog: false,
      showDeleteDialog: false,
      expenseToDelete: null,
      
      // 加载状态
      loading: {
        summary: false,
        trends: false,
        incomePie: false,
        expensePie: false,
        transactions: false,
        expenses: false
      },
      
      // API基础URL
      apiBaseUrl: 'http://localhost:5050/api',

      // 功能区域选择
      activeTab: 'analysis'
    }
  },
  computed: {
    filteredTransactions() {
      return this.transactions.filter(item => {
        // 将字符串日期转换为Date对象进行比较
        const itemDate = new Date(item.date.split('T')[0])
        const startDateObj = new Date(this.startDate)
        const endDateObj = new Date(this.endDate)
        
        // 添加调试日志
        console.log('过滤交易记录:', item.id, itemDate, startDateObj <= itemDate, itemDate <= endDateObj)
        
        const dateInRange = startDateObj <= itemDate && itemDate <= endDateObj
        const typeMatch = this.selectedType === 'all' || item.type === this.selectedType
        return dateInRange && typeMatch
      })
    },
    filteredExpenses() {
      return this.expenses.filter(expense => {
        // 日期过滤
        const expenseDate = new Date(expense.expenseDate.split('T')[0])
        const startDateObj = new Date(this.startDate)
        const endDateObj = new Date(this.endDate)
        const dateInRange = startDateObj <= expenseDate && expenseDate <= endDateObj
        
        // 类别过滤
        const categoryMatch = !this.selectedCategory || expense.category === this.selectedCategory
        
        return dateInRange && categoryMatch
      })
    }
  },
  watch: {
    selectedCategory() {
      // 当选择的类别变化时更新过滤结果
      console.log('支出类别筛选变更为:', this.selectedCategory)
      this.fetchExpenses()
    }
  },
  mounted() {
    this.initCharts()
    this.fetchData()
    this.fetchExpenseCategories()
  },
  methods: {
    // 获取默认开始日期（当年1月1日）
    getDefaultStartDate() {
      return '2024-01-01'
    },
    
    // 获取默认结束日期（2024年12月31日）
    getDefaultEndDate() {
      return '2024-12-31'
    },
    
    // 格式化日期时间
    formatDateTime(date) {
      return date + 'T00:00:00'
    },
    
    // 获取所有数据
    fetchData() {
      console.log('开始获取财务数据...')
      this.fetchMonthlySummary()
      this.fetchTrends()
      this.fetchIncomeComposition()
      this.fetchExpenseComposition()
      this.fetchTransactions()
      this.fetchExpenses()
    },
    
    // 获取月度概览数据
    async fetchMonthlySummary() {
      this.loading.summary = true
      try {
        console.log('正在计算选定期间财务数据...')
        
        const startDateTime = this.formatDateTime(this.startDate)
        const endDateTime = this.formatDateTime(this.endDate)
        
        // 获取收入数据
        const incomeResponse = await axios.get(`${this.apiBaseUrl}/finance/transactions`, {
          params: {
            startDate: startDateTime,
            endDate: endDateTime
          }
        })
        
        // 获取支出数据
        const expenseResponse = await axios.get(`${this.apiBaseUrl}/expenses`, {
          params: {
            startDate: startDateTime,
            endDate: endDateTime
          }
        })
        
        // 计算收入总额
        const incomeTransactions = incomeResponse.data.filter(transaction => transaction.type === 'income')
        const totalIncome = incomeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
        
        // 计算支出总额
        const totalExpense = expenseResponse.data.reduce((sum, expense) => sum + expense.amount, 0)
        
        // 计算利润
        const totalProfit = totalIncome - totalExpense
        
        // 获取上个月同期数据进行同比计算
        const prevStartDate = this.getPreviousPeriod(this.startDate)
        const prevEndDate = this.getPreviousPeriod(this.endDate)
        
        const prevStartDateTime = this.formatDateTime(prevStartDate)
        const prevEndDateTime = this.formatDateTime(prevEndDate)
        
        // 获取上期收入数据
        const prevIncomeResponse = await axios.get(`${this.apiBaseUrl}/finance/transactions`, {
          params: {
            startDate: prevStartDateTime,
            endDate: prevEndDateTime
          }
        })
        
        // 获取上期支出数据
        const prevExpenseResponse = await axios.get(`${this.apiBaseUrl}/expenses`, {
          params: {
            startDate: prevStartDateTime,
            endDate: prevEndDateTime
          }
        })
        
        // 计算上期收入总额
        const prevIncomeTransactions = prevIncomeResponse.data.filter(transaction => transaction.type === 'income')
        const prevTotalIncome = prevIncomeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
        
        // 计算上期支出总额
        const prevTotalExpense = prevExpenseResponse.data.reduce((sum, expense) => sum + expense.amount, 0)
        
        // 计算上期利润
        const prevTotalProfit = prevTotalIncome - prevTotalExpense
        
        // 计算同比变化率
        const incomeTrendValue = prevTotalIncome > 0 ? ((totalIncome - prevTotalIncome) / prevTotalIncome * 100) : 0
        const expenseTrendValue = prevTotalExpense > 0 ? ((totalExpense - prevTotalExpense) / prevTotalExpense * 100) : 0
        const profitTrendValue = prevTotalProfit > 0 ? ((totalProfit - prevTotalProfit) / prevTotalProfit * 100) : 0
        
        console.log('计算的财务数据:', {
          当前收入: totalIncome,
          当前支出: totalExpense,
          当前利润: totalProfit,
          上期收入: prevTotalIncome,
          上期支出: prevTotalExpense,
          上期利润: prevTotalProfit,
          收入趋势: incomeTrendValue,
          支出趋势: expenseTrendValue,
          利润趋势: profitTrendValue
        })
        
        // 更新数据
        this.monthlyIncome = totalIncome
        this.monthlyExpense = totalExpense
        this.monthlyProfit = totalProfit
        this.incomeTrend = incomeTrendValue.toFixed(1)
        this.expenseTrend = expenseTrendValue.toFixed(1)
        this.profitTrend = profitTrendValue.toFixed(1)
      } catch (error) {
        console.error('计算财务数据失败:', error)
        if (error.response) {
          console.error('错误状态码:', error.response.status)
          console.error('错误响应:', error.response.data)
        }
        // 重置数据
        this.monthlyIncome = 0
        this.monthlyExpense = 0
        this.monthlyProfit = 0
        this.incomeTrend = 0
        this.expenseTrend = 0
        this.profitTrend = 0
      } finally {
        this.loading.summary = false
      }
    },
    
    // 获取上一个时间段的日期
    getPreviousPeriod(dateStr) {
      const date = new Date(dateStr)
      date.setMonth(date.getMonth() - 1)
      return date.toISOString().split('T')[0]
    },
    
    // 处理日期变化
    handleDateChange() {
      console.log('日期范围变更为:', this.startDate, '至', this.endDate)
      this.fetchMonthlySummary()
      this.fetchTrends()
      this.fetchIncomeComposition()
      this.fetchExpenseComposition()
      this.fetchTransactions()
      this.fetchExpenses()
    },
    
    // 获取趋势数据
    async fetchTrends() {
      this.loading.trends = true
      try {
        console.log('正在生成趋势数据...')
        
        const startDateTime = this.formatDateTime(this.startDate)
        const endDateTime = this.formatDateTime(this.endDate)
        
        // 获取交易数据
        const transactionsResponse = await axios.get(`${this.apiBaseUrl}/finance/transactions`, {
          params: {
            startDate: startDateTime,
            endDate: endDateTime
          }
        })
        
        const incomeTransactions = transactionsResponse.data.filter(transaction => 
          transaction.type === 'income'
        )
        
        // 获取支出数据
        const expensesResponse = await axios.get(`${this.apiBaseUrl}/expenses`, {
          params: {
            startDate: startDateTime,
            endDate: endDateTime
          }
        })
        
        const expenses = expensesResponse.data
        
        // 准备月份标签和数据
        const months = this.getMonthsInRange(this.startDate, this.endDate)
        const labels = months.map(date => `${date.getFullYear()}年${date.getMonth() + 1}月`)
        
        // 按月份统计收入
        const incomeData = new Array(months.length).fill(0)
        incomeTransactions.forEach(transaction => {
          const transactionDate = new Date(transaction.date)
          const monthIndex = this.findMonthIndex(months, transactionDate)
          if (monthIndex !== -1) {
            incomeData[monthIndex] += transaction.amount
          }
        })
        
        // 按月份统计支出
        const expenseData = new Array(months.length).fill(0)
        expenses.forEach(expense => {
          const expenseDate = new Date(expense.expenseDate)
          const monthIndex = this.findMonthIndex(months, expenseDate)
          if (monthIndex !== -1) {
            expenseData[monthIndex] += expense.amount
          }
        })
        
        // 计算利润
        const profitData = months.map((_, index) => {
          return +(incomeData[index] - expenseData[index]).toFixed(2)
        })
        
        // 确保数据为两位小数
        const formattedIncomeData = incomeData.map(value => +value.toFixed(2))
        const formattedExpenseData = expenseData.map(value => +value.toFixed(2))
        
        console.log('生成的趋势数据:', {
          labels,
          income: formattedIncomeData,
          expense: formattedExpenseData,
          profit: profitData
        })
        
        // 更新趋势图
        this.updateTrendChart(labels, formattedIncomeData, formattedExpenseData, profitData)
      } catch (error) {
        console.error('生成趋势数据失败:', error)
        if (error.response) {
          console.error('错误状态码:', error.response.status)
          console.error('错误响应:', error.response.data)
        }
      } finally {
        this.loading.trends = false
      }
    },
    
    // 获取日期范围内的所有月份
    getMonthsInRange(startDateStr, endDateStr) {
      const startDate = new Date(startDateStr)
      const endDate = new Date(endDateStr)
      
      // 确保日期是月份的第一天，方便比较
      const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
      const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
      
      const months = []
      const current = new Date(start)
      
      while (current <= end) {
        months.push(new Date(current))
        current.setMonth(current.getMonth() + 1)
      }
      
      return months
    },
    
    // 查找日期对应的月份索引
    findMonthIndex(months, date) {
      const targetYear = date.getFullYear()
      const targetMonth = date.getMonth()
      
      return months.findIndex(month => 
        month.getFullYear() === targetYear && month.getMonth() === targetMonth
      )
    },
    
    // 获取收入构成数据
    async fetchIncomeComposition() {
      this.loading.incomePie = true
      try {
        console.log('正在获取收入构成数据...')
        
        const startDateTime = this.formatDateTime(this.startDate)
        const endDateTime = this.formatDateTime(this.endDate)
        
        // 从/api/finance/transactions接口获取原始交易数据
        const response = await axios.get(`${this.apiBaseUrl}/finance/transactions`, {
          params: {
            startDate: startDateTime,
            endDate: endDateTime
          }
        })
        
        const transactionsData = response.data
        console.log('原始交易数据:', transactionsData)
        
        // 筛选出收入类型的交易记录
        const incomeTransactions = transactionsData.filter(transaction => transaction.type === 'income')
        
        // 按类别分组统计收入金额
        const incomeByCategory = {}
        let totalIncome = 0
        
        for (const transaction of incomeTransactions) {
          const category = transaction.category
          if (!incomeByCategory[category]) {
            incomeByCategory[category] = 0
          }
          incomeByCategory[category] += transaction.amount
          totalIncome += transaction.amount
        }
        
        // 转换为饼图所需格式，并计算百分比
        const chartData = []
        for (const [category, amount] of Object.entries(incomeByCategory)) {
          const percentage = (amount / totalIncome * 100) || 0
          chartData.push({
            name: category,
            value: amount.toFixed(2),
            percentage: percentage.toFixed(1)
          })
        }
        
        // 按金额降序排序
        chartData.sort((a, b) => b.value - a.value)
        
        // 如果没有收入数据，添加一条空数据
        if (chartData.length === 0) {
          chartData.push({ name: '暂无收入', value: 0, percentage: 0 })
        }
        
        console.log('处理后的收入构成数据:', chartData)
        
        // 更新收入饼图
        this.updateIncomePieChart(chartData)
      } catch (error) {
        console.error('获取收入构成数据失败:', error)
        if (error.response) {
          console.error('错误状态码:', error.response.status)
          console.error('错误响应:', error.response.data)
        }
      } finally {
        this.loading.incomePie = false
      }
    },
    
    // 获取支出构成数据
    async fetchExpenseComposition() {
      this.loading.expensePie = true
      try {
        console.log('正在获取支出构成数据...')
        
        const startDateTime = this.formatDateTime(this.startDate)
        const endDateTime = this.formatDateTime(this.endDate)
        
        // 从/api/expenses接口获取原始支出数据
        const response = await axios.get(`${this.apiBaseUrl}/expenses`, {
          params: {
            startDate: startDateTime,
            endDate: endDateTime
          }
        })
        
        const expensesData = response.data
        console.log('原始支出数据:', expensesData)
        
        // 按类别分组统计支出金额
        const expenseByCategory = {}
        let totalExpense = 0
        
        for (const expense of expensesData) {
          const category = expense.category
          if (!expenseByCategory[category]) {
            expenseByCategory[category] = 0
          }
          expenseByCategory[category] += expense.amount
          totalExpense += expense.amount
        }
        
        // 转换为饼图所需格式，并计算百分比
        const chartData = []
        for (const [category, amount] of Object.entries(expenseByCategory)) {
          const percentage = (amount / totalExpense * 100) || 0
          chartData.push({
            name: category,
            value: amount.toFixed(2),
            percentage: percentage.toFixed(1)
          })
        }
        
        // 按金额降序排序
        chartData.sort((a, b) => b.value - a.value)
        
        // 如果没有支出数据，添加一条空数据
        if (chartData.length === 0) {
          chartData.push({ name: '暂无支出', value: 0, percentage: 0 })
        }
        
        console.log('处理后的支出构成数据:', chartData)
        
        // 更新支出饼图
        this.updateExpensePieChart(chartData)
      } catch (error) {
        console.error('获取支出构成数据失败:', error)
        if (error.response) {
          console.error('错误状态码:', error.response.status)
          console.error('错误响应:', error.response.data)
        }
      } finally {
        this.loading.expensePie = false
      }
    },
    
    // 获取交易明细数据
    async fetchTransactions() {
      this.loading.transactions = true
      try {
        console.log('正在获取交易明细数据...')
        console.log('日期范围:', this.startDate, '至', this.endDate)
        
        const startDateTime = this.formatDateTime(this.startDate)
        const endDateTime = this.formatDateTime(this.endDate)
        
        // 获取支出数据
        console.log('正在请求支出数据...')
        const expenseResponse = await axios.get(`${this.apiBaseUrl}/expenses`, {
          params: {
            startDate: startDateTime,
            endDate: endDateTime
          }
        })
        console.log('支出数据响应:', expenseResponse.data)
        
        // 获取收入数据
        console.log('正在请求收入数据...')
        const incomeResponse = await axios.get(`${this.apiBaseUrl}/finance/transactions`, {
          params: {
            startDate: startDateTime,
            endDate: endDateTime
          }
        })
        console.log('收入数据响应:', incomeResponse.data)
        
        // 处理支出数据
        const expenses = expenseResponse.data.map(expense => ({
          id: expense.id,
          date: expense.expenseDate,
          type: 'expense',
          category: expense.category,
          amount: expense.amount,
          note: expense.note
        }))
        
        // 处理收入数据
        const incomes = incomeResponse.data.map(income => ({
          id: income.id,
          date: income.date,
          type: 'income',
          category: income.category,
          amount: income.amount,
          note: income.note
        }))
        
        // 合并并排序
        this.transactions = [...expenses, ...incomes].sort((a, b) => {
          return new Date(b.date) - new Date(a.date)
        })
        
        console.log('合并后的交易数据:', this.transactions)
      } catch (error) {
        console.error('获取交易明细数据失败:', error)
        if (error.response) {
          console.error('错误状态码:', error.response.status)
          console.error('错误响应:', error.response.data)
        }
        this.transactions = []
      } finally {
        this.loading.transactions = false
      }
    },
    
    // 获取支出数据
    async fetchExpenses() {
      this.loading.expenses = true
      try {
        console.log('正在获取支出数据...')
        
        const startDateTime = this.formatDateTime(this.startDate)
        const endDateTime = this.formatDateTime(this.endDate)
        
        const response = await axios.get(`${this.apiBaseUrl}/expenses`, {
          params: {
            startDate: startDateTime,
            endDate: endDateTime,
            category: this.selectedCategory || undefined
          }
        })
        
        this.expenses = response.data
        console.log('支出数据:', this.expenses)
      } catch (error) {
        console.error('获取支出数据失败:', error)
        if (error.response) {
          console.error('错误状态码:', error.response.status)
          console.error('错误响应:', error.response.data)
        }
        this.expenses = []
      } finally {
        this.loading.expenses = false
      }
    },
    
    // 获取支出类别
    async fetchExpenseCategories() {
      try {
        console.log('正在获取支出类别...')
        const response = await axios.get(`${this.apiBaseUrl}/expenses/categories`)
        this.expenseCategories = response.data
        console.log('支出类别:', this.expenseCategories)
      } catch (error) {
        console.error('获取支出类别失败:', error)
        // 设置默认类别
        this.expenseCategories = ['原料采购', '人工成本', '水电费用', '设备维护', '店铺租金', '其他支出']
      }
    },
    
    // 初始化图表
    initCharts() {
      // 初始化趋势图
      this.trendChart = echarts.init(this.$refs.trendChart)
      
      // 初始化收入构成饼图
      this.incomePieChart = echarts.init(this.$refs.incomePieChart)
      
      // 初始化支出构成饼图
      this.expensePieChart = echarts.init(this.$refs.expensePieChart)
      
      // 监听窗口大小变化，调整图表大小
      window.addEventListener('resize', this.handleResize)
    },
    
    // 更新趋势图
    updateTrendChart(labels, incomeData, expenseData, profitData) {
      // 计算合适的Y轴最大值
      const allValues = [...incomeData, ...expenseData, ...profitData]
      const maxValue = Math.max(...allValues)
      const yAxisMax = Math.ceil(maxValue * 1.1 / 1000) * 1000 // 向上取整到最近的1000
      
      this.trendChart.setOption({
        title: {
          text: '收支趋势',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            let result = params[0].name + '<br/>'
            params.forEach(param => {
              const color = param.color
              const marker = `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${color};"></span>`
              result += marker + param.seriesName + ': ¥' + param.value.toLocaleString('zh-CN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) + '<br/>'
            })
            return result
          }
        },
        legend: {
          data: ['收入', '支出', '利润'],
          top: 'bottom'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: labels,
          axisLabel: {
            rotate: labels.length > 6 ? 45 : 0
          }
        },
        yAxis: {
          type: 'value',
          max: yAxisMax,
          axisLabel: {
            formatter: value => '¥' + value.toLocaleString('zh-CN')
          }
        },
        series: [
          {
            name: '收入',
            type: 'line',
            data: incomeData,
            itemStyle: {
              color: '#4CAF50'
            },
            lineStyle: {
              width: 3
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(76, 175, 80, 0.4)' },
                { offset: 1, color: 'rgba(76, 175, 80, 0.1)' }
              ])
            },
            smooth: true,
            symbol: 'circle',
            symbolSize: 8
          },
          {
            name: '支出',
            type: 'line',
            data: expenseData,
            itemStyle: {
              color: '#F44336'
            },
            lineStyle: {
              width: 3
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(244, 67, 54, 0.4)' },
                { offset: 1, color: 'rgba(244, 67, 54, 0.1)' }
              ])
            },
            smooth: true,
            symbol: 'circle',
            symbolSize: 8
          },
          {
            name: '利润',
            type: 'line',
            data: profitData,
            itemStyle: {
              color: '#2196F3'
            },
            lineStyle: {
              width: 3
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(33, 150, 243, 0.4)' },
                { offset: 1, color: 'rgba(33, 150, 243, 0.1)' }
              ])
            },
            smooth: true,
            symbol: 'circle',
            symbolSize: 8
          }
        ]
      })
    },
    
    // 更新收入构成饼图
    updateIncomePieChart(data) {
      const chartData = data.map(item => ({
        name: item.name,
        value: parseFloat(item.value)
      }))
      
      this.incomePieChart.setOption({
        title: {
          text: '收入构成'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          type: 'scroll'
        },
        series: [
          {
            name: '收入来源',
            type: 'pie',
            radius: '50%',
            data: chartData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              show: true,
              formatter: '{b}: {d}%'
            }
          }
        ]
      })
    },
    
    // 更新支出构成饼图
    updateExpensePieChart(data) {
      const chartData = data.map(item => ({
        name: item.name,
        value: parseFloat(item.value)
      }))
      
      this.expensePieChart.setOption({
        title: {
          text: '支出构成'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          type: 'scroll'
        },
        series: [
          {
            name: '支出类别',
            type: 'pie',
            radius: '50%',
            data: chartData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              show: true,
              formatter: '{b}: {d}%'
            }
          }
        ]
      })
    },
    
    handleResize() {
      this.trendChart?.resize()
      this.incomePieChart?.resize()
      this.expensePieChart?.resize()
    },
    
    formatNumber(num) {
      return num.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    
    formatDate(dateStr) {
      const date = new Date(dateStr)
      return date.toLocaleDateString('zh-CN')
    },
    
    // 打开支出编辑对话框
    openExpenseDialog(expense) {
      if (expense) {
        // 编辑现有支出
        this.currentExpense = {
          id: expense.id,
          expenseDate: expense.expenseDate.split('T')[0],
          category: expense.category,
          amount: expense.amount,
          note: expense.note || '',
          createdBy: expense.createdBy
        }
      } else {
        // 添加新支出
        const today = new Date().toISOString().split('T')[0]
        this.currentExpense = {
          id: null,
          expenseDate: today,
          category: this.expenseCategories.length > 0 ? this.expenseCategories[0] : '',
          amount: 0,
          note: '',
          createdBy: 'admin'
        }
      }
      this.showExpenseDialog = true
    },
    
    // 保存支出
    async saveExpense() {
      try {
        console.log('保存支出:', this.currentExpense)
        
        const expenseData = {
          ...this.currentExpense,
          expenseDate: this.formatDateTime(this.currentExpense.expenseDate),
          amount: parseFloat(this.currentExpense.amount)
        }
        
        let response
        
        if (this.currentExpense.id) {
          // 更新已有支出
          response = await axios.put(`${this.apiBaseUrl}/expenses/${this.currentExpense.id}`, expenseData)
          console.log('支出更新成功:', response.data)
        } else {
          // 创建新支出
          response = await axios.post(`${this.apiBaseUrl}/expenses`, expenseData)
          console.log('支出创建成功:', response.data)
        }
        
        // 关闭对话框并刷新数据
        this.showExpenseDialog = false
        this.fetchExpenses()
        this.fetchExpenseComposition()
        this.fetchIncomeComposition()
        this.fetchTrends()
        this.fetchMonthlySummary()
      } catch (error) {
        console.error('保存支出失败:', error)
        if (error.response) {
          console.error('错误状态码:', error.response.status)
          console.error('错误响应:', error.response.data)
          alert(`保存支出失败: ${error.response.data.message || '未知错误'}`)
        } else {
          alert('保存支出失败，请检查网络连接')
        }
      }
    },
    
    // 确认删除支出
    confirmDeleteExpense(expense) {
      this.expenseToDelete = expense
      this.showDeleteDialog = true
    },
    
    // 删除支出
    async deleteExpense() {
      try {
        console.log('删除支出:', this.expenseToDelete)
        
        const response = await axios.delete(`${this.apiBaseUrl}/expenses/${this.expenseToDelete.id}`)
        console.log('支出删除成功:', response.data)
        
        // 关闭对话框并刷新数据
        this.showDeleteDialog = false
        this.expenseToDelete = null
        this.fetchExpenses()
        this.fetchExpenseComposition()
        this.fetchIncomeComposition()
        this.fetchTrends()
        this.fetchMonthlySummary()
      } catch (error) {
        console.error('删除支出失败:', error)
        if (error.response) {
          console.error('错误状态码:', error.response.status)
          console.error('错误响应:', error.response.data)
          alert(`删除支出失败: ${error.response.data.message || '未知错误'}`)
        } else {
          alert('删除支出失败，请检查网络连接')
        }
      }
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    this.trendChart?.dispose()
    this.incomePieChart?.dispose()
    this.expensePieChart?.dispose()
  }
}
</script>

<style scoped>
.financial-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

/* 财务概览卡片样式 */
.financial-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.overview-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  min-height: 120px;
}

.overview-card h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 16px;
}

.amount {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.trend {
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.trend.up {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.trend.down {
  background-color: #ffebee;
  color: #c62828;
}

/* 图表区域样式 */
.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
}

.chart-card h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
}

.chart {
  height: 300px;
  width: 100%;
}

.chart-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #666;
  font-size: 14px;
}

/* 数据表格样式 */
.data-table-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
}

.data-table-container h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: border-color 0.3s;
}

.date-input:focus {
  outline: none;
  border-color: #f8b500;
  box-shadow: 0 0 0 2px rgba(248, 181, 0, 0.2);
}

.filter-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 120px;
  transition: border-color 0.3s;
}

.filter-select:focus {
  outline: none;
  border-color: #f8b500;
  box-shadow: 0 0 0 2px rgba(248, 181, 0, 0.2);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f8b500;
  color: white;
  font-weight: 500;
}

.type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.type-badge.income {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.type-badge.expense {
  background-color: #ffebee;
  color: #c62828;
}

.income-amount {
  color: #2e7d32;
}

.expense-amount {
  color: #c62828;
}

.table-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #666;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #f8b500;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.no-data {
  text-align: center;
  color: #666;
  padding: 20px 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .table-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .date-range {
    flex-wrap: wrap;
  }
  
  .data-table {
    display: block;
    overflow-x: auto;
  }
}

/* 支出管理样式 */
.expense-manage {
  margin-top: 20px;
}

.expense-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.expense-header h3 {
  margin: 0;
  font-size: 18px;
}

.add-button {
  background-color: #f8b500;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.add-button:hover {
  background-color: #e6a800;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.expense-list {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.category-badge {
  display: inline-block;
  padding: 4px 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-button {
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s;
}

.action-button.edit {
  background-color: #f8b500;
  color: white;
}

.action-button.edit:hover {
  background-color: #e6a800;
}

.action-button.delete {
  background-color: #f44336;
  color: white;
}

.action-button.delete:hover {
  background-color: #d32f2f;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.dialog-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
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

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-button {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #333;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cancel-button:hover {
  background-color: #e5e5e5;
}

.save-button {
  background-color: #f8b500;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.save-button:hover {
  background-color: #e6a800;
}

.delete-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.delete-button:hover {
  background-color: #d32f2f;
}

.delete-dialog {
  width: 350px;
}

/* 功能切换标签样式 */
.function-tabs {
  display: flex;
  margin-bottom: 20px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.tab-button {
  flex: 1;
  padding: 12px;
  border: none;
  background: white;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  transition: all 0.3s;
}

.tab-button.active {
  background-color: #f8b500;
  color: white;
  font-weight: 500;
}

.tab-button:hover:not(.active) {
  background-color: #f5f5f5;
}

/* 日期过滤部分样式 */
.date-filter-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  background: white;
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.date-filter-section .date-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-filter-section .date-input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.date-filter-section .date-input:focus {
  outline: none;
  border-color: #f8b500;
  box-shadow: 0 0 0 2px rgba(248, 181, 0, 0.2);
}
</style>



