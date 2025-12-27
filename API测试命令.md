# API 接口测试命令（Windows PowerShell）

## 配置说明

**基础 URL（根据你的环境选择）：**
- 本地 Apifox Mock: `http://127.0.0.1:4523/m1/7413325-7146674-6711292`
- 云端 Apifox Mock: `https://m1.apifoxmock.com/m1/7413325-7146674-6711292`
- 通过 Vite 代理: `http://localhost:5173/api`

**设置变量（在 PowerShell 中执行）：**
```powershell
$BASE_URL = "http://127.0.0.1:4523/m1/7413325-7146674-6711292"
$TOKEN = ""  # 登录后获取的 token
```

**注意：** Windows PowerShell 中的 `curl` 是 `Invoke-WebRequest` 的别名，语法不同。以下命令使用 PowerShell 原生语法。

---

## 1. 认证接口 (Auth)

### 1.1 用户注册
```powershell
$body = @{
    username = "testuser001"
    email = "testuser001@example.com"
    password = "Test123456"
} | ConvertTo-Json

Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### 1.2 用户登录
```powershell
$body = @{
    account = "testuser001"
    password = "Test123456"
} | ConvertTo-Json

$response = Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$TOKEN = ($response.Content | ConvertFrom-Json).token
Write-Host "Token: $TOKEN" -ForegroundColor Green
```

### 1.3 忘记密码（发送验证码）
```powershell
$body = @{
    email = "testuser001@example.com"
} | ConvertTo-Json

Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/auth/forgot-password" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### 1.4 重置密码
```powershell
$body = @{
    email = "testuser001@example.com"
    verificationCode = "123456"
    newPassword = "NewPass123456"
} | ConvertTo-Json

Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/auth/reset-password" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

---

## 2. 用户接口 (Users)

### 2.1 获取当前用户信息
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/users/me" `
    -Method GET `
    -Headers $headers
```

### 2.2 更新当前用户信息
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    username = "updateduser"
    email = "updated@example.com"
    preferences = @{
        theme = "dark"
        language = "zh-CN"
    }
} | ConvertTo-Json

Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/users/me" `
    -Method PUT `
    -Headers $headers `
    -Body $body
```

### 2.3 提交学者认证申请
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    realName = "张三"
    organization = "清华大学"
    orgEmail = "zhangsan@tsinghua.edu.cn"
    title = "教授"
    proofMaterials = @(
        "https://example.com/proof1.pdf",
        "https://example.com/proof2.jpg"
    )
} | ConvertTo-Json

Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/users/me/certification" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

### 2.4 查看认证申请状态
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/users/me/certification" `
    -Method GET `
    -Headers $headers
```

### 2.5 提交申诉
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    appealType = "identity_stolen"
    targetId = "scholar-123"
    reason = "我的身份被他人冒用，请核实"
    evidenceMaterials = @(
        "https://example.com/evidence1.pdf",
        "https://example.com/evidence2.jpg"
    )
} | ConvertTo-Json

Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/users/me/appeal" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

---

## 3. 学者接口 (Scholars)

### 3.1 检索学者（无参数）
```powershell
Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/scholars" `
    -Method GET `
    -ContentType "application/json"
```

### 3.2 检索学者（按姓名）
```powershell
Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/scholars?name=张" `
    -Method GET `
    -ContentType "application/json"
```

### 3.3 检索学者（按机构）
```powershell
Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/scholars?organization=清华大学" `
    -Method GET `
    -ContentType "application/json"
```

### 3.4 检索学者（按研究领域）
```powershell
Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/scholars?field=人工智能" `
    -Method GET `
    -ContentType "application/json"
```

### 3.5 检索学者（组合查询）
```powershell
Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/scholars?name=张&organization=清华大学&field=机器学习" `
    -Method GET `
    -ContentType "application/json"
```

### 3.6 获取学者详情
```powershell
Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/scholars/scholar-001" `
    -Method GET `
    -ContentType "application/json"
```

### 3.7 获取学者合作网络
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/scholars/scholar-001/collaboration-network" `
    -Method GET `
    -Headers $headers
```

---

## 4. 管理员接口 (Admin)

### 4.1 获取待审核认证列表
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/admin/certifications?status=pending" `
    -Method GET `
    -Headers $headers
```

### 4.2 批准认证申请
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/admin/certifications/app-001/approve" `
    -Method POST `
    -Headers $headers
```

### 4.3 驳回认证申请
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    reason = "证明材料不充分，请重新提交"
} | ConvertTo-Json

Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/admin/certifications/app-001/reject" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

### 4.4 获取待处理申诉列表
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/admin/appeals?status=pending" `
    -Method GET `
    -Headers $headers
```

### 4.5 处理申诉（批准）
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    action = "approve"
    reason = "申诉理由充分，予以批准"
} | ConvertTo-Json

Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/admin/appeals/case-001/process" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

### 4.6 处理申诉（驳回）
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    action = "reject"
    reason = "证据不足，申诉不成立"
} | ConvertTo-Json

Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/admin/appeals/case-001/process" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

### 4.7 获取待审核成果列表
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/admin/achievements/pending" `
    -Method GET `
    -Headers $headers
```

### 4.8 批准成果
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/admin/achievements/ach-001/approve" `
    -Method POST `
    -Headers $headers
```

### 4.9 驳回成果
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    reason = "成果信息不完整，请补充相关材料"
} | ConvertTo-Json

Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/admin/achievements/ach-001/reject" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

### 4.10 获取所有任务列表
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/admin/tasks" `
    -Method GET `
    -Headers $headers
```

### 4.11 配置定时任务
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    cron = "0 0 * * *"
    status = "enabled"
    params = @{
        syncInterval = 3600
    }
} | ConvertTo-Json

Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/admin/tasks/task-001" `
    -Method PUT `
    -Headers $headers `
    -Body $body
```

### 4.12 手动触发任务
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/admin/tasks/task-001/run" `
    -Method POST `
    -Headers $headers
```

---

## 使用说明

### 方式1：使用 Invoke-WebRequest（PowerShell 原生，推荐）

**Windows PowerShell 中的 `curl` 是 `Invoke-WebRequest` 的别名，语法不同，所以直接使用 `Invoke-WebRequest` 更可靠。**

1. 打开 PowerShell
2. 设置基础 URL：
   ```powershell
   $BASE_URL = "http://127.0.0.1:4523/m1/7413325-7146674-6711292"
   ```
3. 先登录获取 token：
   ```powershell
   $body = @{
       account = "testuser001"
       password = "Test123456"
   } | ConvertTo-Json
   
   $response = Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/auth/login" `
       -Method POST `
       -ContentType "application/json" `
       -Body $body
   
   $TOKEN = ($response.Content | ConvertFrom-Json).token
   Write-Host "Token: $TOKEN" -ForegroundColor Green
   ```
4. 使用 token 测试其他接口

### 方式2：使用 curl.exe（如果已安装）

如果你安装了真正的 curl.exe（不是 PowerShell 别名），可以使用：

```powershell
# 使用 curl.exe（注意是 .exe）
curl.exe -X POST "$BASE_URL/auth/login" `
    -H "Content-Type: application/json" `
    -d '{\"account\":\"testuser001\",\"password\":\"Test123456\"}'
```

### 方式3：查看响应内容

使用 `Invoke-WebRequest` 时，响应内容在 `$response.Content` 中：

```powershell
$response = Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/auth/login" -Method POST -ContentType "application/json" -Body $body
$json = $response.Content | ConvertFrom-Json
$json | ConvertTo-Json -Depth 10  # 格式化输出
```

### 方式3：运行完整测试脚本（推荐）

项目根目录已包含 `test-api.ps1` 脚本，可以直接运行：

```powershell
.\test-api.ps1
```

脚本会自动测试所有接口，包括：
- 自动登录获取 token
- 测试所有认证接口
- 测试所有用户接口
- 测试所有学者接口
- 测试所有管理员接口
- 彩色输出和错误处理

---

## 注意事项

1. **Token 管理**：需要认证的接口必须携带 `Authorization: Bearer $TOKEN` 头
2. **JSON 格式**：使用 PowerShell 的 `@{}` 哈希表配合 `ConvertTo-Json`，比手动转义 JSON 字符串更安全
3. **换行符**：PowerShell 中使用反引号 `` ` `` 进行换行
4. **响应查看**：响应内容在 `$response.Content` 中，使用 `| ConvertFrom-Json` 格式化 JSON
5. **错误处理**：使用 `try-catch` 块捕获错误，如果返回 401，检查 token 是否过期，需要重新登录
6. **PowerShell 版本**：建议使用 PowerShell 5.1 或更高版本（Windows 10+ 自带）

---

## 快速测试脚本

创建一个完整的测试脚本 `quick-test.ps1`：

```powershell
# 配置
$BASE_URL = "http://127.0.0.1:4523/m1/7413325-7146674-6711292"

Write-Host "=== API 快速测试 ===" -ForegroundColor Cyan

# 1. 注册
Write-Host "`n1. 测试注册..." -ForegroundColor Yellow
$registerBody = @{
    username = "testuser$(Get-Random)"
    email = "test$(Get-Random)@example.com"
    password = "Test123456"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody
    Write-Host "注册成功" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "注册失败: $_" -ForegroundColor Red
}

# 2. 登录
Write-Host "`n2. 测试登录..." -ForegroundColor Yellow
$loginBody = @{
    account = "testuser001"
    password = "Test123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody
    $TOKEN = ($loginResponse.Content | ConvertFrom-Json).token
    Write-Host "登录成功，Token: $TOKEN" -ForegroundColor Green
} catch {
    Write-Host "登录失败: $_" -ForegroundColor Red
    exit
}

# 3. 获取用户信息
Write-Host "`n3. 测试获取用户信息..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/users/me" `
        -Method GET `
        -Headers $headers
    Write-Host "获取用户信息成功" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "获取用户信息失败: $_" -ForegroundColor Red
}

# 4. 检索学者
Write-Host "`n4. 测试检索学者..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "$BASE_URL/scholars?name=张" `
        -Method GET `
        -ContentType "application/json"
    Write-Host "检索学者成功" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "检索学者失败: $_" -ForegroundColor Red
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Cyan
```

