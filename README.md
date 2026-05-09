# TaskFlow 前端

一个基于 Vue3 + TypeScript + Pinia + Vue Router + Tailwind CSS + Element Plus 的任务管理与协作系统前端项目。

## 技术栈

- **框架**: Vue 3
- **语言**: TypeScript
- **构建工具**: Vite
- **路由**: Vue Router
- **状态管理**: Pinia
- **UI 组件库**: Element Plus
- **样式**: Tailwind CSS
- **HTTP 客户端**: Axios
- **实时通信**: Socket.IO Client
- **图表**: ECharts
- **日期处理**: Day.js
- **测试**: Playwright

## 项目结构

```
src/
├── components/          # 组件
│   ├── CommentList.vue  # 评论列表
│   ├── Footer.vue       # 页脚
│   ├── Nav.vue          # 导航栏
│   ├── Toast.vue        # 全局提示
│   └── UserSelector.vue # 用户选择器
├── router/              # 路由配置
│   └── index.ts
├── services/            # API 服务
│   ├── api.ts           # Axios 实例与拦截器
│   ├── activityService.ts   # 活动日志
│   ├── attachmentService.ts # 附件
│   ├── authService.ts       # 认证
│   ├── batchService.ts      # 批量操作
│   ├── commentService.ts    # 评论
│   ├── filterService.ts     # 筛选
│   ├── groupService.ts      # 任务组
│   ├── notificationService.ts # 通知
│   ├── permissionService.ts   # 权限
│   ├── reminderService.ts     # 提醒
│   ├── reportService.ts       # 报表
│   ├── settingsService.ts     # 设置
│   ├── statsService.ts        # 统计
│   ├── tagService.ts          # 标签
│   ├── taskService.ts         # 任务
│   ├── teamService.ts         # 团队
│   ├── toast.ts               # 轻提示封装
│   ├── userService.ts         # 用户
│   └── websocket.ts           # WebSocket 封装
├── store/               # Pinia 状态管理
│   ├── stats.ts         # 统计状态
│   ├── task.ts          # 任务状态
│   └── user.ts          # 用户状态
├── styles/              # 样式文件
│   ├── element-plus-overrides.css # Element Plus 样式覆盖
│   └── index.css        # 全局样式
├── types/               # 类型定义
│   ├── advanced.ts      # 高级类型
│   ├── auto-imports.d.ts # 自动导入声明
│   ├── components.d.ts   # 组件声明
│   ├── models.ts         # 数据模型接口
│   └── shims-vue.d.ts    # Vue 模块声明
├── views/               # 页面组件
│   ├── ActivityView.vue     # 活动日志
│   ├── DashboardView.vue    # 仪表盘
│   ├── GroupCreateView.vue  # 创建任务组
│   ├── GroupDetailView.vue  # 任务组详情
│   ├── GroupEditView.vue    # 编辑任务组
│   ├── GroupTasksView.vue   # 组内任务
│   ├── GroupsView.vue       # 任务组列表
│   ├── InboxView.vue        # 通知收件箱
│   ├── LoginView.vue        # 登录
│   ├── ProfileView.vue      # 个人资料
│   ├── RegisterView.vue     # 注册
│   ├── RemindersView.vue    # 提醒管理
│   ├── ReportsView.vue      # 报表统计
│   ├── SettingsView.vue     # 系统设置
│   ├── TagsView.vue         # 标签管理
│   ├── TaskCreateView.vue   # 创建任务
│   ├── TaskDetailView.vue   # 任务详情
│   ├── TaskListView.vue     # 任务列表
│   ├── TeamView.vue         # 团队管理
│   └── permission/          # 权限管理
│       ├── Index.vue
│       ├── MenuManagement.vue
│       ├── UserManagement.vue
│       └── UserPermissionManagement.vue
├── App.vue              # 根组件
└── main.ts              # 入口文件
```

## 启动说明

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run typecheck   # TypeScript 类型检查
npm run lint        # ESLint 检查
npm run format      # Prettier 格式化
```

### 运行测试

```bash
npm run test        # 运行 Playwright 测试
npm run test:ui     # UI 模式运行测试
npm run test:report # 查看测试报告
```

## 环境配置

项目使用 `.env.development` 文件进行开发环境配置，可根据需要修改。

## 主要功能模块

1. **用户认证**
   - 注册
   - 登录
   - 退出登录
   - 个人资料管理

2. **任务管理**
   - 任务列表展示
   - 任务详情查看
   - 任务创建、编辑、删除
   - 任务状态更新
   - 筛选与排序

3. **任务组**
   - 创建、编辑、删除任务组
   - 组内任务管理

4. **标签管理**
   - 创建、编辑、删除标签
   - 任务标签关联

5. **提醒功能**
   - 任务提醒设置
   - 提醒列表管理

6. **协作功能**
   - 任务评论
   - 实时消息推送（WebSocket）
   - 通知收件箱
   - 团队管理

7. **数据统计**
   - 仪表盘数据概览
   - 活动日志
   - 报表与图表（ECharts）

8. **权限管理**
   - 菜单权限配置
   - 用户权限管理
   - 用户角色分配

9. **系统设置**
   - 个人设置
   - 系统偏好配置

## 已完成功能

- 基础目录结构搭建
- Vite / TypeScript 配置
- 路由配置与页面开发（20+ 页面）
- Tailwind CSS 集成
- Element Plus 集成与样式覆盖
- API 封装与 Axios 拦截器
- Pinia 状态管理
- WebSocket / Socket.IO 实时通信
- 类型定义与自动导入
- 评论、通知、提醒组件
- 用户选择器组件
- 权限管理模块
- 数据统计与图表展示
- 移动端响应式适配
- Playwright 端到端测试
- ESLint + Prettier 代码规范

## 开发规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 代码规范
- 组件使用 Vue 3 Composition API
- 状态管理使用 Pinia
- 样式优先使用 Tailwind CSS，必要时使用 Element Plus 组件
- 使用 unplugin-auto-import / unplugin-vue-components 自动导入

## 文档

项目文档位于 `docs/` 目录下，包含：

- `api-spec.md`: API 接口说明
- `openapi.yaml`: OpenAPI 规范
- `project-overview.md`: 项目概述
- `responsive-fix-plan.md`: 响应式适配计划
- `测试问题报告.md`: 测试问题汇总
- `后端问题清单.md`: 后端对接问题
