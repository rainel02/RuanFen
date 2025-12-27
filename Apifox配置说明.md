# Apifox 配置说明

## 📋 配置步骤

### 1. 配置项目 ID

打开 `src/api/config.ts` 文件，找到第 5 行：

```typescript
export const APIFOX_PROJECT_ID = '7413325-7146674-6711292' // 👈 请替换为你的项目 ID
```

将 `7413325-7146674-6711292` 替换为你的 Apifox 项目 ID。

### 2. 如何获取项目 ID

1. 打开 **Apifox 客户端**
2. 进入你的项目
3. 点击左侧菜单的 **"Mock"** 或 **"Mock服务"**
4. 查看 Mock 服务地址，格式类似：
   ```
   http://127.0.0.1:4523/m1/你的项目ID/api
   ```
5. 复制项目 ID（`/m1/` 后面的那串数字）

### 3. 确保 Apifox Mock 服务已启动

在 Apifox 客户端中，确保 Mock 服务已启动（通常显示为绿色状态）。

### 4. 测试连接

重启开发服务器后，尝试登录或注册，应该可以正常连接到 Apifox 了。

## 📝 文件说明

- **`src/api/config.ts`** - 统一配置文件，只需在这里修改项目 ID
- **`src/api/request.ts`** - 基于 `index.ts` 模式的请求工具（使用 fetch）
- **`src/api/index.ts`** - 使用相同的配置
- **`src/api/auth.ts`** - 认证接口
- **`src/api/user.ts`** - 用户接口
- **`src/api/admin.ts`** - 管理员接口
- **`src/api/scholar.ts`** - 学者接口

所有文件都使用统一的配置，只需在 `config.ts` 中修改一次即可。

## 🔍 工作原理

1. 所有 API 请求都使用 `src/api/request.ts` 中的工具
2. `request.ts` 从 `config.ts` 读取 `APIFOX_BASE_URL`
3. 直接使用 fetch 发送请求到 Apifox Mock 服务
4. 自动添加 token 到请求头（如果存在）
5. 统一处理错误响应

## ⚠️ 注意事项

- 确保 Apifox Mock 服务运行在 `http://127.0.0.1:4523`
- 如果端口不同，需要修改 `config.ts` 中的 `APIFOX_BASE_URL`
- 修改配置后需要重启开发服务器









