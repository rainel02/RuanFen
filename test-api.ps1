# API 接口测试脚本
# 使用方法: .\test-api.ps1

# ==================== 配置区域 ====================
# 根据你的环境修改这里的 URL
$BASE_URL = "http://127.0.0.1:4523/m1/7413325-7146674-6711292"
# 或者使用云端: $BASE_URL = "https://m1.apifoxmock.com/m1/7413325-7146674-6711292"
# 或者使用 Vite 代理: $BASE_URL = "http://localhost:5173/api"

$TOKEN = ""  # 登录后会自动填充

# ==================== 辅助函数 ====================
function Test-API {
    param(
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    $headersString = ""
    foreach ($key in $Headers.Keys) {
        $headersString += "-H `"$key`: $($Headers[$key])`" "
    }
    
    $bodyString = ""
    if ($Body) {
        $bodyJson = $Body | ConvertTo-Json -Compress
        $bodyString = "-d '$bodyJson'"
    }
    
    Write-Host "`n[$Method] $Url" -ForegroundColor Cyan
    Write-Host "Headers: $($Headers.Keys -join ', ')" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -Method $Method -Headers $Headers -Body ($Body | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop
        $jsonResponse = $response.Content | ConvertFrom-Json
        Write-Host "✓ 成功 (Status: $($response.StatusCode))" -ForegroundColor Green
        $jsonResponse | ConvertTo-Json -Depth 10
        return $jsonResponse
    }
    catch {
        Write-Host "✗ 失败: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "响应: $responseBody" -ForegroundColor Yellow
        }
        return $null
    }
}

# ==================== 1. 认证接口测试 ====================
Write-Host "`n========== 1. 认证接口测试 ==========" -ForegroundColor Magenta

# 1.1 用户注册
Write-Host "`n[1.1] 测试用户注册..." -ForegroundColor Yellow
$registerData = @{
    username = "testuser" + (Get-Random -Maximum 10000)
    email = "test" + (Get-Random -Maximum 10000) + "@example.com"
    password = "Test123456"
}
$registerResponse = Test-API -Method "POST" -Url "$BASE_URL/auth/register" -Body $registerData

# 1.2 用户登录
Write-Host "`n[1.2] 测试用户登录..." -ForegroundColor Yellow
$loginData = @{
    account = "testuser001"
    password = "Test123456"
}
$loginResponse = Test-API -Method "POST" -Url "$BASE_URL/auth/login" -Body $loginData

if ($loginResponse -and $loginResponse.token) {
    $TOKEN = $loginResponse.token
    Write-Host "✓ Token 已保存: $TOKEN" -ForegroundColor Green
} else {
    Write-Host "⚠ 警告: 登录失败，后续需要认证的接口将无法测试" -ForegroundColor Yellow
}

# 1.3 忘记密码
Write-Host "`n[1.3] 测试忘记密码..." -ForegroundColor Yellow
$forgotPasswordData = @{
    email = "testuser001@example.com"
}
Test-API -Method "POST" -Url "$BASE_URL/auth/forgot-password" -Body $forgotPasswordData

# 1.4 重置密码
Write-Host "`n[1.4] 测试重置密码..." -ForegroundColor Yellow
$resetPasswordData = @{
    email = "testuser001@example.com"
    verificationCode = "123456"
    newPassword = "NewPass123456"
}
Test-API -Method "POST" -Url "$BASE_URL/auth/reset-password" -Body $resetPasswordData

# ==================== 2. 用户接口测试 ====================
Write-Host "`n========== 2. 用户接口测试 ==========" -ForegroundColor Magenta

if ($TOKEN) {
    $authHeaders = @{
        "Authorization" = "Bearer $TOKEN"
    }
    
    # 2.1 获取当前用户信息
    Write-Host "`n[2.1] 测试获取当前用户信息..." -ForegroundColor Yellow
    Test-API -Method "GET" -Url "$BASE_URL/users/me" -Headers $authHeaders
    
    # 2.2 更新用户信息
    Write-Host "`n[2.2] 测试更新用户信息..." -ForegroundColor Yellow
    $updateUserData = @{
        username = "updateduser"
        email = "updated@example.com"
        preferences = @{
            theme = "dark"
            language = "zh-CN"
        }
    }
    Test-API -Method "PUT" -Url "$BASE_URL/users/me" -Headers $authHeaders -Body $updateUserData
    
    # 2.3 提交认证申请
    Write-Host "`n[2.3] 测试提交认证申请..." -ForegroundColor Yellow
    $certificationData = @{
        realName = "张三"
        organization = "清华大学"
        orgEmail = "zhangsan@tsinghua.edu.cn"
        title = "教授"
        proofMaterials = @(
            "https://example.com/proof1.pdf",
            "https://example.com/proof2.jpg"
        )
    }
    Test-API -Method "POST" -Url "$BASE_URL/users/me/certification" -Headers $authHeaders -Body $certificationData
    
    # 2.4 查看认证状态
    Write-Host "`n[2.4] 测试查看认证状态..." -ForegroundColor Yellow
    Test-API -Method "GET" -Url "$BASE_URL/users/me/certification" -Headers $authHeaders
    
    # 2.5 提交申诉
    Write-Host "`n[2.5] 测试提交申诉..." -ForegroundColor Yellow
    $appealData = @{
        appealType = "identity_stolen"
        targetId = "scholar-123"
        reason = "我的身份被他人冒用，请核实"
        evidenceMaterials = @(
            "https://example.com/evidence1.pdf",
            "https://example.com/evidence2.jpg"
        )
    }
    Test-API -Method "POST" -Url "$BASE_URL/users/me/appeal" -Headers $authHeaders -Body $appealData
} else {
    Write-Host "⚠ 跳过需要认证的接口（未获取到 token）" -ForegroundColor Yellow
}

# ==================== 3. 学者接口测试 ====================
Write-Host "`n========== 3. 学者接口测试 ==========" -ForegroundColor Magenta

# 3.1 检索学者（无参数）
Write-Host "`n[3.1] 测试检索学者（无参数）..." -ForegroundColor Yellow
Test-API -Method "GET" -Url "$BASE_URL/scholars"

# 3.2 检索学者（按姓名）
Write-Host "`n[3.2] 测试检索学者（按姓名）..." -ForegroundColor Yellow
Test-API -Method "GET" -Url "$BASE_URL/scholars?name=张"

# 3.3 检索学者（按机构）
Write-Host "`n[3.3] 测试检索学者（按机构）..." -ForegroundColor Yellow
Test-API -Method "GET" -Url "$BASE_URL/scholars?organization=清华大学"

# 3.4 检索学者（按研究领域）
Write-Host "`n[3.4] 测试检索学者（按研究领域）..." -ForegroundColor Yellow
Test-API -Method "GET" -Url "$BASE_URL/scholars?field=人工智能"

# 3.5 检索学者（组合查询）
Write-Host "`n[3.5] 测试检索学者（组合查询）..." -ForegroundColor Yellow
Test-API -Method "GET" -Url "$BASE_URL/scholars?name=张&organization=清华大学&field=机器学习"

# 3.6 获取学者详情
Write-Host "`n[3.6] 测试获取学者详情..." -ForegroundColor Yellow
Test-API -Method "GET" -Url "$BASE_URL/scholars/scholar-001"

# 3.7 获取学者合作网络
Write-Host "`n[3.7] 测试获取学者合作网络..." -ForegroundColor Yellow
if ($TOKEN) {
    Test-API -Method "GET" -Url "$BASE_URL/scholars/scholar-001/collaboration-network" -Headers $authHeaders
} else {
    Write-Host "⚠ 需要认证，跳过" -ForegroundColor Yellow
}

# ==================== 4. 管理员接口测试 ====================
Write-Host "`n========== 4. 管理员接口测试 ==========" -ForegroundColor Magenta

if ($TOKEN) {
    # 4.1 获取待审核认证列表
    Write-Host "`n[4.1] 测试获取待审核认证列表..." -ForegroundColor Yellow
    Test-API -Method "GET" -Url "$BASE_URL/admin/certifications?status=pending" -Headers $authHeaders
    
    # 4.2 批准认证
    Write-Host "`n[4.2] 测试批准认证..." -ForegroundColor Yellow
    Test-API -Method "POST" -Url "$BASE_URL/admin/certifications/app-001/approve" -Headers $authHeaders
    
    # 4.3 驳回认证
    Write-Host "`n[4.3] 测试驳回认证..." -ForegroundColor Yellow
    $rejectData = @{
        reason = "证明材料不充分，请重新提交"
    }
    Test-API -Method "POST" -Url "$BASE_URL/admin/certifications/app-001/reject" -Headers $authHeaders -Body $rejectData
    
    # 4.4 获取待处理申诉列表
    Write-Host "`n[4.4] 测试获取待处理申诉列表..." -ForegroundColor Yellow
    Test-API -Method "GET" -Url "$BASE_URL/admin/appeals?status=pending" -Headers $authHeaders
    
    # 4.5 处理申诉（批准）
    Write-Host "`n[4.5] 测试处理申诉（批准）..." -ForegroundColor Yellow
    $processAppealData = @{
        action = "approve"
        reason = "申诉理由充分，予以批准"
    }
    Test-API -Method "POST" -Url "$BASE_URL/admin/appeals/case-001/process" -Headers $authHeaders -Body $processAppealData
    
    # 4.6 处理申诉（驳回）
    Write-Host "`n[4.6] 测试处理申诉（驳回）..." -ForegroundColor Yellow
    $rejectAppealData = @{
        action = "reject"
        reason = "证据不足，申诉不成立"
    }
    Test-API -Method "POST" -Url "$BASE_URL/admin/appeals/case-001/process" -Headers $authHeaders -Body $rejectAppealData
    
    # 4.7 获取待审核成果列表
    Write-Host "`n[4.7] 测试获取待审核成果列表..." -ForegroundColor Yellow
    Test-API -Method "GET" -Url "$BASE_URL/admin/achievements/pending" -Headers $authHeaders
    
    # 4.8 批准成果
    Write-Host "`n[4.8] 测试批准成果..." -ForegroundColor Yellow
    Test-API -Method "POST" -Url "$BASE_URL/admin/achievements/ach-001/approve" -Headers $authHeaders
    
    # 4.9 驳回成果
    Write-Host "`n[4.9] 测试驳回成果..." -ForegroundColor Yellow
    $rejectAchievementData = @{
        reason = "成果信息不完整，请补充相关材料"
    }
    Test-API -Method "POST" -Url "$BASE_URL/admin/achievements/ach-001/reject" -Headers $authHeaders -Body $rejectAchievementData
    
    # 4.10 获取所有任务列表
    Write-Host "`n[4.10] 测试获取所有任务列表..." -ForegroundColor Yellow
    Test-API -Method "GET" -Url "$BASE_URL/admin/tasks" -Headers $authHeaders
    
    # 4.11 配置定时任务
    Write-Host "`n[4.11] 测试配置定时任务..." -ForegroundColor Yellow
    $taskConfigData = @{
        cron = "0 0 * * *"
        status = "enabled"
        params = @{
            syncInterval = 3600
        }
    }
    Test-API -Method "PUT" -Url "$BASE_URL/admin/tasks/task-001" -Headers $authHeaders -Body $taskConfigData
    
    # 4.12 手动触发任务
    Write-Host "`n[4.12] 测试手动触发任务..." -ForegroundColor Yellow
    Test-API -Method "POST" -Url "$BASE_URL/admin/tasks/task-001/run" -Headers $authHeaders
} else {
    Write-Host "⚠ 跳过管理员接口（未获取到 token）" -ForegroundColor Yellow
}

Write-Host "`n========== 测试完成 ==========" -ForegroundColor Magenta
Write-Host "如果看到错误，请检查：" -ForegroundColor Yellow
Write-Host "1. BASE_URL 是否正确" -ForegroundColor Yellow
Write-Host "2. Apifox Mock 服务是否正在运行" -ForegroundColor Yellow
Write-Host "3. 网络连接是否正常" -ForegroundColor Yellow

