# 🔍 Apifox 连接问题排查指南

## 📋 相关文件清单

### 核心配置文件
1. **`vite.config.ts`** - Vite 代理配置（最重要！）
   - 第 27 行：`target` - Apifox Mock 服务地址（默认：`http://127.0.0.1:4523`）
   - 第 33 行：`rewrite` - 项目 ID 配置（**必须替换为你的项目 ID**）

2. **`src/api/request.ts`** - Axios 请求配置
   - 第 18 行：开发环境使用 `/api` 作为 baseURL
   - 会通过 Vite 代理转发到 Apifox

### API 接口文件
3. **`src/api/auth.ts`** - 认证接口（登录、注册等）
4. **`src/api/user.ts`** - 用户接口
5. **`src/api/admin.ts`** - 管理员接口
6. **`src/api/scholar.ts`** - 学者接口

### Store 文件
7. **`src/stores/auth.ts`** - 认证状态管理（使用 auth.ts 中的接口）

## 🚨 常见问题及解决方案

### 问题1：项目 ID 未配置或配置错误

**症状：**
- 请求返回 404
- 控制台看到代理日志，但路径不对
- 例如：`/m1/YOUR_APIFOX_PROJECT_ID/auth/login` 或 `/m1/7413325-7146674-6711292/auth/login`（队友的 ID）

**解决步骤：**
1. 打开 Apifox 客户端
2. 进入你的项目
3. 点击左侧 "Mock" 或 "Mock服务"
4. 查看 Mock 服务地址，格式：`http://127.0.0.1:4523/m1/你的项目ID/api`
5. 复制项目 ID（`/m1/` 后面的那串数字）
6. 打开 `vite.config.ts`，找到第 33 行
7. 将 `const projectId = '7413325-7146674-6711292'` 中的项目 ID 替换为你的

**示例：**
```typescript
// 修改前（队友的项目 ID）
const projectId = '7413325-7146674-6711292'

// 修改后（你的项目 ID）
const projectId = '1234567-8901234-5678901'
```

### 问题2：Apifox Mock 服务未启动

**症状：**
- 请求失败，无法连接
- 控制台错误：`ERR_CONNECTION_REFUSED` 或 `网络错误：无法连接到服务器`
- 看不到任何代理日志

**解决步骤：**
1. 打开 Apifox 客户端
2. 确保 Mock 服务已启动（通常显示为绿色状态）
3. 检查 Mock 服务端口是否为 4523
4. 如果端口不同，需要修改 `vite.config.ts` 第 27 行的 `target` 地址

### 问题3：端口不匹配

**症状：**
- 请求失败，无法连接
- Apifox Mock 服务已启动，但端口不是 4523

**解决步骤：**
1. 在 Apifox 中查看 Mock 服务的实际端口
2. 打开 `vite.config.ts`，修改第 27 行：
   ```typescript
   target: 'http://127.0.0.1:你的端口号'
   ```

### 问题4：路径不匹配

**症状：**
- 请求返回 404
- 代理日志显示路径正确，但 Apifox 返回 404

**解决步骤：**
1. 检查 Apifox 中的接口路径是否与代码中的路径一致
2. 例如：代码中调用 `/auth/login`，Apifox 中应该有对应的接口
3. 检查 Apifox 接口的请求方法（GET/POST）是否匹配

### 问题5：代理未生效

**症状：**
- 看不到代理日志
- 请求直接失败，没有经过代理

**解决步骤：**
1. 确保开发服务器正在运行（`npm run dev`）
2. 检查 `src/api/request.ts` 中 baseURL 是否为 `/api`（开发环境）
3. 重启开发服务器（修改 `vite.config.ts` 后需要重启）

## 🧪 测试步骤

### 步骤1：检查 Apifox Mock 服务
1. 打开 Apifox 客户端
2. 确认 Mock 服务已启动
3. 记录 Mock 服务地址和端口

### 步骤2：检查项目 ID
1. 在 Apifox 中查看 Mock 服务地址
2. 复制项目 ID
3. 更新 `vite.config.ts` 中的项目 ID

### 步骤3：重启开发服务器
```bash
# 停止当前服务器（Ctrl+C）
npm run dev
```

### 步骤4：测试连接
1. 打开浏览器控制台
2. 尝试登录或注册
3. 查看控制台日志：
   - 应该看到：`🚀 开发环境使用代理: /api`
   - 应该看到：`📤 POST /api/auth/login`
   - 应该看到：`[Vite Proxy] POST /api/auth/login -> /m1/你的项目ID/auth/login`

### 步骤5：使用诊断工具
打开 `test-apifox-connection.html` 文件（在浏览器中打开），使用诊断工具测试连接。

## 📝 调试信息检查清单

在浏览器控制台应该看到：

✅ **正常情况：**
```
🚀 开发环境使用代理: /api
🌐 最终 API Base URL: /api
📤 POST /api/auth/login { account: "...", password: "..." }
   完整 URL: /api/auth/login
   请求头: { ... }
[Vite Proxy] POST /api/auth/login -> /m1/你的项目ID/auth/login
[Vite Proxy] Response: 200 for /api/auth/login
📥 200 /auth/login { ... }
```

❌ **异常情况：**
- 看不到 `[Vite Proxy]` 日志 → 代理未工作
- 看到 `YOUR_APIFOX_PROJECT_ID` → 项目 ID 未配置
- 看到 `ERR_CONNECTION_REFUSED` → Mock 服务未启动
- 看到 404 → 路径不匹配或项目 ID 错误

## 🔧 快速修复

如果还是连接不上，请检查：

1. ✅ Apifox Mock 服务是否启动？
2. ✅ `vite.config.ts` 第 33 行的项目 ID 是否正确？
3. ✅ `vite.config.ts` 第 27 行的端口是否正确？
4. ✅ 开发服务器是否已重启？
5. ✅ 浏览器控制台是否有错误信息？

如果以上都正确，请提供：
- 浏览器控制台的完整错误信息
- `vite.config.ts` 中的项目 ID（可以打码）
- Apifox Mock 服务的地址





