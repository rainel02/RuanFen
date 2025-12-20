

组件推荐（但不强制）：

高级组件（仅使用背景Globe）：https://www.vantajs.com/
普通组件：https://element-plus.org/zh-CN/component/carousel


风格要求： 大气、上档次、色彩不要过于杂乱,要求美观大方，有高级感、科技感。

任务角色：

role:  前端 C：社交与数据分析

对接后端： D组 (社交与分析)

核心任务： 让平台“活”起来。包括论坛、私信聊天、以及看起来很高大上的数据看板。

需要构建的页面 & 具体要做的事：

● 社区论坛 (Forum)

○ 板块列表与帖子列表页：

■ 左侧选板块，右侧显示帖子列表。显示标题、作者、最后回复时间 20。

○ 帖子详情与回复页：

■ 展示主贴内容（支持富文本或Markdown解析）。

■ 下方是楼层式的回复列表 21。

■ 回帖输入框：发送评论，对接 /api/social/forum/posts/{id}/reply
22。

○ 发帖页：■ 简单的富文本编辑器，填写标题、选择板块、输入内容 23。

● 社交与私信 (Social & DM)

○ 私信中心：

■ 左侧会话列表：显示最近联系人、未读消息数的小红点 24。

■ 右侧聊天窗口：这是难点。需要做成类似微信的界面，气泡式对话。

■ 需要处理实时性（虽然文档没写WebSocket，但前端通常要用轮询 setInterval 或者

WebSocket 来刷新消息）
25。

○ 关注/粉丝列表：

■ 展示“我关注的人”和“关注我的人”，提供“取消关注”按钮 26。

● 数据分析看板 (Analysis Dashboard)

○ 学科热点图：

■ 对接 /api/analysis/hot-topics
27。需要引入词云库（WordCloud）或者用 ECharts 渲

染热词。

○ 影响力排行榜：

■ 一个漂亮的表格或榜单组件，展示 rank、学者头像、influenceScore
28。

○ 影响力趋势图：

■ 在用户画像或单独的分析页，画折线图展示某位学者近5年的引用量/H指数变化 29



API文档：


## **详细的 API 接口文档 (v1)**

### **1. 认证 (Auth)**

● **POST /api/v1/auth/register**

○ **描述:** 新用户注册 ^1^ 。

○ **权限:** Public

○ **请求体:** { "username": "string", "email": "string", "password": "string" }

○ **成功响应 (201):** { "userId": "uuid", "username": "string", "email": "string" }

○ **失败响应 (400):** { "error": "邮箱已被注册" } 或{ "error": "密码必须至少6位，包含字母和数字" } ^2^

● **POST /api/v1/auth/login**

○ **描述:** 用户登录 ^3^ 。

○ **权限:** Public

○ **请求体:** { "account": "string (用户名/邮箱)", "password": "string" }

○ **成功响应 (200):** { "token": "string (JWT)", "user": { "userId": "uuid", "username": "string", "role": "user" } }

○ **失败响应 (401):** { "error": "账户或密码错误" } ^4^

● **POST /api/v1/auth/forgot-password**

○ **描述:** 忘记密码，请求发送验证码 ^5^ 。

○ **权限:** Public

○ **请求体:** { "email": "string" }

○ **成功响应 (200):** { "message": "验证码已发送" }

● **POST /api/v1/auth/reset-password**

○ **描述:** 重置密码 ^6^ 。

○ **权限:** Public

○ **请求体:** { "email": "string", "verificationCode": "string", "newPassword": "string" }

○ **成功响应 (200):** { "message": "密码重置成功" }

### **2. 用户 (Users)**

● **GET /api/v1/users/me**

○ **描述:** 获取当前登录用户的详细信息。

○ **权限:** 认证用户 (学者)

○ **成功响应 (200):** { "userId": "uuid", "username": "string", "email": "string", "certificationStatus": "not_certified | pending | certified", "preferences": {...} }

● **PUT /api/v1/users/me**

○ **描述:** 更新当前登录用户的个人信息（如用户名、邮箱、偏好设置） ^7^ 。

○ **权限:** 认证用户 (学者)

○ **请求体:** { "username": "string", "email": "string", "preferences": {...} }

○ **成功响应 (200):** {... (更新后的用户信息) ...}

● **POST /api/v1/users/me/certification**

○ **描述:** 提交学者认证申请 ^8^ 。

○ **权限:** 认证用户 (学者)

○ **请求体:** { "realName": "string", "organization": "string", "orgEmail": "string", "title": "string", "proofMaterials": ["url1", "url2"] } (文件需先上传到文件服务器)

○ **成功响应 (202):** { "message": "认证已提交", "status": "pending" }

○ **失败响应 (400):** { "error": "材料不符合要求" } ^9^

● **GET /api/v1/users/me/certification**

○ **描述:** 查看自己的认证申请状态。

○ **权限:** 认证用户 (学者)

○ **成功响应 (200):** { "status": "pending | certified | rejected", "reason": "string (如果被驳回)" }

● **POST /api/v1/users/me/appeal**

○ **描述:** 针对身份冒用或成果冒领发起申诉 ^10^ 。

○ **权限:** 认证用户 (学者)

○ **请求体:** { "appealType": "identity_stolen | achievement_stolen", "targetId": "string (被申诉的学者或成果ID)", "reason": "string", "evidenceMaterials": ["url1", "url2"] }

○ **成功响应 (202):** { "message": "申诉已提交", "caseId": "uuid" }

○ **失败响应 (400):** { "error": "必填信息缺失" } ^11^

### **3. 学者门户 (Scholars)**

● **GET /api/v1/scholars**

○ **描述:** 检索学者门户 ^12^ 。

○ **权限:** Public

○ **查询参数:** ?name=string (姓名), ?organization=string (机构), ?field=string (研究领域)

○ **成功响应 (200):** { "results": [{ "scholarId": "uuid", "name": "string", "organization": "string", "title": "string", "avatarUrl": "string" }], "total": 100 }

○ **失败响应 (404):** { "error": "未找到相关学者" } ^13^

● **GET /api/v1/scholars/{id}**

○ **描述:** 浏览特定学者的公开门户主页 ^14^ 。

○ **权限:** Public

○ **成功响应 (200):** { "scholarId": "uuid", "name": "string", "organization": "string", "bio": "string", "researchFields": [], "achievements": [{...}, {...}] }

○ **失败响应 (404):** { "error": "该学者暂未开通门户" } ^15^

● **GET /api/v1/scholars/{id}/collaboration-network**

○ **描述:** 查看学者合作关系网络 ^16^ 。

○ **权限:** 认证用户 (学者)

○ **成功响应 (200):** { "nodes": [...], "links": [...] } (图表所需的数据结构)

○ **失败响应 (403):** { "error": "该学者合作网络不可见" } ^17^

### **4. 学术成果 (Achievements)**

● **GET /api/v1/achievements**

○ **描述:** 检索学术成果（普通/高级检索） ^18181818^ 。

○ **权限:** Public

○ **查询参数:**

■ ?q=string (关键词 - 普通检索) ^1919^

■ ?author=string (高级) ^2020^

■ ?organization=string (高级) ^2121^

■ ?time_start=string & ?time_end=string (高级) ^2222^

■ ?field=string (高级) ^2323^

■ ?sort_by=citations | time (排序) ^24242424^

○ **成功响应 (200):** { "results": [{ "id": "uuid", "title": "string", "authors": [], "year": "int", "abstract": "string", "citationCount": "int" }], "total": 1000 }

○ **失败响应 (400):** { "error": "请输入检索内容" } ^25252525^

● **GET /api/v1/achievements/{id}**

○ **描述:** 浏览学术成果详情 ^26^ 。

○ **权限:** Public

○ **成功响应 (200):** { "id": "uuid", "title": "string", "authors": [...], "abstract": "string", "doi": "string", "publication": "string", "year": "int", ... }

○ **失败响应 (404):** { "error": "内容暂不可用" } ^27^

● **GET /api/v1/users/me/achievements**

○ **描述:** 查看“我”的个人成果列表（门户管理） ^28^ 。

○ **权限:** 认证用户 (学者)

○ **查询参数:** ?status=pending | approved | rejected (按状态筛选) ^29^

○ **成功响应 (200):** { "achievements": [{ "id": "uuid", "title": "string", "year": "int", "status": "pending" }], "total": 10 }

● **POST /api/v1/users/me/achievements**

○ **描述:** 添加一项新的个人成果（需审核） ^30^ 。

○ **权限:** 认证学者

○ **请求体:** { "type": "paper | patent | project", "title": "string", "authors": ["string"], "year": "int", "journal": "string", "doi": "string", ... }

○ **成功响应 (202):** { "id": "uuid", "title": "string", "status": "pending" } (待审核) ^31^

● **PUT /api/v1/users/me/achievements/{id}**

○ **描述:** 更新“我”的某项个人成果（更新后需重新审核） ^32^ 。

○ **权限:** 认证学者

○ **请求体:** { ... (同POST) ... }

○ **成功响应 (202):** { "id": "uuid", "title": "string", "status": "pending" } ^33^

● **DELETE /api/v1/users/me/achievements/{id}**

○ **描述:** 删除“我”的某项个人成果  ^34^ 。

○ **权限:** 认证学者

○ **成功响应 (204):** No Content

● **GET /api/v1/users/me/collections**

○ **描述:** 查看“我”的收藏夹。

○ **权限:** 认证用户 (学者)

○ **成功响应 (200):** { "collections": [{ "id": "uuid", "title": "string", "authors": [], "year": "int" }] }

● **POST /api/v1/users/me/collections**

○ **描述:** 收藏一项学术成果 ^35^ 。

○ **权限:** 认证用户 (学者)

○ **请求体:** { "achievementId": "uuid" }

○ **成功响应 (201):** { "message": "收藏成功" } ^36^

○ **失败响应 (400):** { "error": "已在收藏夹中" } ^37^

● **DELETE /api/v1/users/me/collections/{achievementId}**

○ **描述:** 取消收藏一项学术成果。

○ **权限:** 认证用户 (学者)

○ **成功响应 (204):** No Content

### **5. 社交互动 (Social)**

● **POST /api/v1/social/follow/{userId}**

○ **描述:** 关注一个学者 ^38^ 。

○ **权限:** 认证用户 (学者)

○ **成功响应 (200):** { "message": "关注成功" } ^39^

● **DELETE /api/v1/social/follow/{userId}**

○ **描述:** 取消关注一个学者 ^40^ 。

○ **权限:** 认证用户 (学者)

○ **成功响应 (200):** { "message": "取消关注成功" } ^41^

● **GET /api/v1/social/followers/{userId}**

○ **描述:** 查看某个学者的粉丝列表。

○ **权限:** 认证用户 (学者)

○ **成功响应 (200):** { "followers": [{ "userId": "uuid", "name": "string" }], "total": 10 }

● **GET /api/v1/social/following/{userId}**

○ **描述:** 查看某个学者关注的人列表。

○ **权限:** 认证用户 (学者)

○ **成功响应 (200):** { "following": [{ "userId": "uuid", "name": "string" }], "total": 5 }

● **GET /api/v1/social/dms**

○ **描述:** 获取私信会话列表。

○ **权限:** 认证用户 (学者)

○ **成功响应 (200):** { "conversations": [{ "withUser": {...}, "latestMessage": "string", "unreadCount": 2 }] }

● **GET /api/v1/social/dms/{userId}**

○ **描述:** 获取与特定用户的私信历史。

○ **权限:** 认证用户 (学者)

○ **成功响应 (200):** { "messages": [{ "senderId": "uuid", "content": "string", "timestamp": "time" }] }

● **POST /api/v1/social/dms**

○ **描述:** 发送私信 ^42^ 。

○ **权限:** 认证用户 (学者)

○ **请求体:** { "recipientId": "uuid", "content": "string", "attachmentUrl": "string" }

○ **成功响应 (201):** { "message": "发送成功" } ^43^

○ **失败响应 (400):** { "error": "消息格式不符合要求" } ^44^

● **GET /api/v1/social/forum/posts**

○ **描述:** 获取论坛帖子列表。

○ **权限:** 认证用户 (学者)

○ **查询参数:** ?boardId=string (板块ID)

○ **成功响应 (200):** { "posts": [{ "postId": "uuid", "title": "string", "author": {...}, "replyCount": 10, "lastReplyTime": "time" }] }

● **POST /api/v1/social/forum/posts**

○ **描述:** 发布新帖子 ^45^ 。

○ **权限:** 认证用户 (学者)

○ **请求体:** { "title": "string", "content": "string", "boardId": "string", "attachments": ["url1"] }

○ **成功响应 (201):** {... (新帖子的内容) ...}

○ **失败响应 (400):** { "error": "标题/正文不能为空" } ^46^

● **GET /api/v1/social/forum/posts/{id}**

○ **描述:** 查看帖子详情及回复。

○ **权限:** 认证用户 (学者)

○ **成功响应 (200):** { "post": {...}, "replies": [{...}, {...}] }

● **POST /api/v1/social/forum/posts/{id}/reply**

○ **描述:** 回复帖子 ^47^ 。

○ **权限:** 认证用户 (学者)

○ **请求体:** { "content": "string", "attachments": ["url1"] }

○ **成功响应 (201):** {... (新回复的内容) ...}

○ **失败响应 (400):** { "error": "回复内容格式不符合要求" } ^48^

### **6. 分析 (Analysis)**

● **GET /api/v1/analysis/hot-topics**

○ **描述:** 查看学科热门（关键词云图数据） ^49^ 。

○ **权限:** 认证用户 (学者)

○ **查询参数:** ?time_range=1y | 3m | all (时间范围)

○ **成功响应 (200):** { "topics": [{ "topic": "string", "weight": 90 }, ...] }

○ **失败响应 (404):** { "error": "学科热点数据获取失败" } ^50^

● **GET /api/v1/analysis/influence/ranking**

○ **描述:** 查看学者影响力排行榜 ^51^ 。

○ **权限:** 认证用户 (学者)

○ **查询参数:** ?domain=cs | physics | all (领域)

○ **成功响应 (200):** { "ranking": [{ "rank": 1, "scholar": {...}, "influenceScore": 1000 }, ...] }

○ **失败响应 (404):** { "error": "选定领域数据不足" } ^52^

● **GET /api/v1/analysis/influence/trend/{userId}**

○ **描述:** 查看学者影响力趋势（{userId} 可以是me） ^53^ 。

○ **权限:** 认证用户 (学者)

○ **查询参数:** ?time_range=5y & ?metric=citations | h-index

○ **成功响应 (200):** { "trend": [{ "year": 2020, "value": 100 }, { "year": 2021, "value": 120 }, ...] }

○ **失败响应 (404):** { "error": "暂无相关数据" } ^54^

### **7. 管理员 (Admin)**

● **GET /api/v1/admin/certifications**

○ **描述:** 获取待审核的学者认证列表 ^55^ 。

○ **权限:** 管理员

○ **查询参数:** ?status=pending

○ **成功响应 (200):** { "applications": [{...}, {...}] }

● **POST /api/v1/admin/certifications/{appId}/approve**

○ **描述:** 批准学者认证 ^56^ 。

○ **权限:** 管理员

○ **成功响应 (200):** { "message": "认证已批准" }

● **POST /api/v1/admin/certifications/{appId}/reject**

○ **描述:** 驳回学者认证 ^57^ 。

○ **权限:** 管理员

○ **请求体:** { "reason": "string" }

○ **成功响应 (200):** { "message": "认证已驳回" }

● **GET /api/v1/admin/appeals**

○ **描述:** 获取待处理的申诉列表 ^58^ 。

○ **权限:** 管理员

○ **查询参数:** ?status=pending

○ **成功响应 (200):** { "appeals": [{...}, {...}] }

● **POST /api/v1/admin/appeals/{caseId}/process**

○ **描述:** 处理申诉（批准或驳回） ^59^ 。

○ **权限:** 管理员

○ **请求体:** { "action": "approve | reject", "reason": "string" }

○ **成功响应 (200):** { "message": "申诉已处理" }

● **GET /api/v1/admin/achievements/pending**

○ **描述:** 获取待审核的学者提交成果 ^60^ 。

○ **权限:** 管理员

○ **成功响应 (200):** { "pendingAchievements": [{...}, {...}] }

● **POST /api/v1/admin/achievements/{achId}/approve**

○ **描述:** 批准学者提交的成果 ^61^ 。

○ **权限:** 管理员

○ **成功响应 (200):** { "message": "成果已批准" }

● **POST /api/v1/admin/achievements/{achId}/reject**

○ **描述:** 驳回学者提交的成果 ^62^ 。

○ **权限:** 管理员

○ **请求体:** { "reason": "string" }

○ **成功响应 (200):** { "message": "成果已驳回" }

● **GET /api/v1/admin/tasks**

○ **描述:** 查看所有定时任务（数据更新、影响力计算） ^63636363^ 。

○ **权限:** 管理员

○ **成功响应 (200):** { "tasks": [{ "taskId": "string", "name": "更新学术成果", "cron": "0 0 2 * * *", "status": "enabled", "lastRun": "time" }] }

● **PUT /api/v1/admin/tasks/{taskId}**

○ **描述:** 配置定时任务 ^64646464^ 。

○ **权限:** 管理员

○ **请求体:** { "cron": "string", "status": "enabled | disabled", "params": {...} }

○ **成功响应 (200):** {... (更新后的任务) ...}

● **POST /api/v1/admin/tasks/{taskId}/run**

○ **描述:** 手动触发一次任务 ^65656565^ 。

○ **权限:** 管理员

○ **成功响应 (202):** { "message": "任务已加入执行队列" }
