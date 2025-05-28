// import { Icon } from "element-ui";
import Vue from "vue";
import VueRouter from "vue-router";
import Home from '@/components/Home.vue';
import WelcomePage from '@/components/WelcomePage.vue';
import BreadOrderManagement from '@/components/BreadOrderManagement.vue';
import AnalyticsPage from '@/components/BreadInfo.vue';
import BreadInventory from '@/components/BreadInventory.vue';
import FinancialPage from '@/components/FinancialPage.vue';
import UserManagement from '@/components/UserManagement.vue';
import LoginPage from '@/components/LoginPage.vue';
Vue.use(VueRouter);

const routes = [
  {
    path: '/login',
    name: '登录',
    component: LoginPage
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/index',
    component: Home,
    children: [
      { path: '', component: WelcomePage }, // 默认显示WelcomePage
      {
        name: "主页",
        path: 'home',
        component: WelcomePage
      },
      {
        name: "财务分析",
        path: 'analytics',
        component: AnalyticsPage
      },
      {
        name: "面包库存",
        path: 'bread-inventory',
        component: BreadInventory
      },
      {
        name: "面包订单管理",
        path: 'bread-order-management',
        component: BreadOrderManagement
      },
      {
        name: "财务分析",
        path: 'financial',
        component: FinancialPage
      },
      {
        name: "用户管理",
        path: 'user-management',
        component: UserManagement
      }
      // 其他children...
    ]
  }
];

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};

const router = new VueRouter({
  routes,
  mode: "history",
});

export default router;
export { routes };