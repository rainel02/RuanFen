# 学术分享平台 (Academic Sharing Platform)

## 项目概述

学术分享平台是一个综合性的Web应用程序，旨在为学术研究人员提供成果分享、协作交流和学术讨论的平台。基于Spring Boot 3.2.0和Java 21构建。

## 技术栈

- **Java版本**: 21 (LTS)
- **框架**: Spring Boot 3.2.0
- **数据库**: MySQL 8.0.39
- **认证方式**: JWT (JSON Web Tokens)
- **API文档**: Swagger/OpenAPI 3.0
- **ORM**: Spring Data JPA with Hibernate
- **构建工具**: Maven 3.9.11
- **安全框架**: Spring Security with BCrypt

## 项目结构

```
academic-sharing-platform/
├── src/main/java/com/scholar/platform/
│   ├── config/                     # 配置类
│   │   ├── OpenApiConfig.java     # Swagger/OpenAPI配置
│   │   └── SecurityConfig.java    # Spring Security与JWT配置
│   │
│   ├── controller/                 # REST API控制器 (MVC层)
│   │   ├── AuthController.java            # 认证接口
│   │   ├── UserController.java            # 用户管理
│   │   ├── ScholarController.java         # 学者资料管理
│   │   ├── CertificationController.java   # 学者认证
│   │   ├── AchievementController.java     # 学术成果
│   │   ├── ForumController.java           # 论坛帖子和回复
│   │   ├── FollowController.java          # 用户关注/取关
│   │   ├── MessageController.java         # 私信
│   │   └── GlobalExceptionHandler.java    # 全局异常处理
│   │
│   ├── dto/                        # 数据传输对象
│   │   ├── LoginRequest.java
│   │   ├── LoginResponse.java
│   │   ├── RegisterRequest.java
│   │   ├── CertificationRequest.java
│   │   ├── MessageRequest.java
│   │   ├── PostCreateRequest.java
│   │   ├── ReplyCreateRequest.java
│   │   ├── ScholarDTO.java
│   │   ├── AchievementDTO.java
│   │   ├── PostDTO.java
│   │   ├── ApiResponse.java       # 统一API响应包装器
│   │   └── PageResponse.java      # 分页包装器
│   │
│   ├── entity/                     # JPA实体类 (领域模型)
│   │   ├── User.java              # 核心用户表
│   │   ├── Scholar.java           # 学者资料信息
│   │   ├── ScholarCertification.java  # 认证申请
│   │   ├── Achievement.java       # 学术成果
│   │   ├── AchievementAuthor.java # 成果-作者关联
│   │   ├── Paper.java             # 论文元数据
│   │   ├── ForumBoard.java        # 论坛板块
│   │   ├── ForumPost.java         # 论坛帖子
│   │   ├── ForumReply.java        # 帖子回复
│   │   ├── DirectMessage.java     # 用户私信
│   │   ├── Follow.java            # 用户关注关系
│   │   ├── UserCollection.java    # 用户收藏成果
│   │   └── UserAppeal.java        # 用户申诉
│   │
│   ├── repository/                 # Spring Data JPA仓储 (数据层)
│   │   ├── UserRepository.java
│   │   ├── ScholarRepository.java
│   │   ├── ScholarCertificationRepository.java
│   │   ├── AchievementRepository.java
│   │   ├── AchievementAuthorRepository.java
│   │   ├── ForumBoardRepository.java
│   │   ├── ForumPostRepository.java
│   │   ├── ForumReplyRepository.java
│   │   ├── DirectMessageRepository.java
│   │   ├── FollowRepository.java
│   │   └── UserCollectionRepository.java
│   │
│   ├── security/                   # 安全与认证
│   │   ├── JwtTokenProvider.java         # JWT令牌生成/验证
│   │   ├── JwtAuthenticationFilter.java  # JWT请求过滤器
│   │   └── CustomUserDetailsService.java # 用户认证服务
│   │
│   ├── service/                    # 业务逻辑层
│   │   ├── AuthService.java              # 注册与登录
│   │   ├── UserService.java              # 用户操作
│   │   ├── ScholarService.java           # 学者资料管理
│   │   ├── CertificationService.java     # 认证工作流
│   │   ├── AchievementService.java       # 成果查询
│   │   ├── ForumService.java             # 论坛操作
│   │   ├── FollowService.java            # 关注/取关逻辑
│   │   └── MessageService.java           # 消息服务
│   │
│   └── AcademicSharingPlatformApplication.java  # Spring Boot主类
│
├── src/main/resources/
│   └── application.yml             # 应用程序配置
│
├── pom.xml                         # Maven依赖
└── scholar_platform.sql            # 数据库架构

```

## 架构与设计模式

### 分层架构

本项目采用 **三层架构**:

1. **控制器层** (`controller/`)
   - 处理HTTP请求/响应
   - 使用Bean Validation进行输入验证
   - 在DTO和服务层之间进行映射
   - 返回统一的`ApiResponse<T>`包装器

2. **服务层** (`service/`)
   - 包含业务逻辑
   - 使用`@Transactional`进行事务管理
   - 编排仓储操作
   - 将实体转换为DTO

3. **仓储层** (`repository/`)
   - 使用Spring Data JPA进行数据访问
   - 自定义查询方法
   - 数据库抽象

### 使用的设计模式

- **DTO模式**: 将内部实体与API契约分离
- **仓储模式**: 抽象数据持久化
- **依赖注入**: 使用Lombok的`@RequiredArgsConstructor`进行构造器注入
- **建造者模式**: 用于实体构建
- **过滤器链模式**: JWT认证过滤器
- **全局异常处理**: 使用`@RestControllerAdvice`集中处理错误

## 代码风格与规范

### 通用准则

- **Java版本**: 启用Java 21特性
- **语言**: 注释和消息使用简体中文（业务域语言）
- **字符编码**: UTF-8
- **行尾符**: LF (Unix风格)

### 命名规范

#### 类
- **实体类**: 单数名词 (例如：`User`、`Achievement`、`ForumPost`)
- **DTO类**: 描述性后缀 (例如：`LoginRequest`、`ScholarDTO`、`ApiResponse`)
- **控制器**: `{领域}Controller` (例如：`AuthController`、`UserController`)
- **服务类**: `{领域}Service` (例如：`AuthService`、`ForumService`)
- **仓储类**: `{实体}Repository` (例如：`UserRepository`)

#### 方法
- **REST端点**: RESTful动词
  - `GET` → `getXxx()`、`findXxx()`、`searchXxx()`
  - `POST` → `create()`、`submit()`、`send()`
  - `PUT` → `update()`、`modify()`
  - `DELETE` → `delete()`、`remove()`

- **服务方法**: 业务动作动词
  - `register()`、`login()`、`follow()`、`unfollow()`

#### 变量
- **驼峰命名**: 所有变量和方法参数
- **描述性**: 优先使用完整单词而非缩写

### 注解风格

#### 实体类
```java
@Entity
@Table(name = "table_name")
@Data                    // Lombok: 生成getters, setters, toString
@NoArgsConstructor      // Lombok: 默认构造器
@AllArgsConstructor     // Lombok: 全参构造器
public class EntityName { }
```

#### 控制器
```java
@RestController
@RequestMapping("/path")
@RequiredArgsConstructor                    // Lombok: 构造器注入
@Tag(name = "模块名", description = "描述")  // Swagger文档
@SecurityRequirement(name = "Bearer Authentication")
public class XxxController { }
```

#### 服务类
```java
@Service
@RequiredArgsConstructor  // 依赖的构造器注入
public class XxxService { }
```

#### 仓储
```java
@Repository
public interface XxxRepository extends JpaRepository<Entity, ID> { }
```

### API响应格式

所有REST端点返回统一的响应结构:

```java
{
  "code": 200,          // HTTP状态码
  "message": "success", // 消息（中文）
  "data": { ... }       // 实际数据
}
```

成功: `ApiResponse.success(data)` 或 `ApiResponse.success(message, data)`
错误: `ApiResponse.error(code, message)`

### 验证

- 在DTO上使用Bean Validation注解:
  - `@NotBlank` - 必填字符串字段
  - `@Email` - 邮箱格式验证
  - `@Size(min, max)` - 长度约束
  - `@Valid` - 在控制器中触发验证

### 安全

- **认证**: JWT令牌放在`Authorization: Bearer {token}`请求头中
- **密码存储**: BCrypt哈希
- **会话**: 无状态（无服务端会话）
- **公开端点**: `/api/auth/**`、`/swagger-ui/**`、`/v3/api-docs/**`
- **受保护端点**: 其他所有路由需要JWT令牌
- **管理员端点**: `/api/admin/**`需要`ROLE_ADMIN`角色

### 数据库规范

- **表名**: 蛇形命名法，小写 (例如：`forum_posts`、`user_collections`)
- **主键**: 使用`@UuidGenerator`生成UUID
- **外键**: 命名为`fk_{表名}_{引用}` (例如：`fk_post_author`)
- **索引**: 命名为`idx_{列名}` (例如：`idx_email`)
- **时间戳**: 所有日期/时间字段使用`LocalDateTime`
- **枚举**: 存储为`@Enumerated(EnumType.STRING)`

### 事务管理

- 修改数据的服务方法使用`@Transactional`
- 只读查询可以省略事务注解
- 仓储操作自动具有事务性

### 异常处理

全局异常处理器 (`GlobalExceptionHandler`) 捕获:
- `RuntimeException` → 400 Bad Request
- `MethodArgumentNotValidException` → 400 带字段错误
- `AuthenticationException` → 401 Unauthorized
- `AccessDeniedException` → 403 Forbidden
- `Exception` → 500 Internal Server Error

### Swagger/OpenAPI文档

每个控制器端点必须包含:
```java
@Operation(summary = "操作简述", description = "详细说明")
@Parameter(description = "参数说明")
```

### Lombok使用

大量使用以减少样板代码:
- `@Data` - 生成getters、setters、toString、equals、hashCode
- `@RequiredArgsConstructor` - 为`final`字段生成构造器注入
- `@NoArgsConstructor`、`@AllArgsConstructor` - 为JPA实体生成构造器
- `@Slf4j` - 日志实例（可选）

## 配置

### 应用程序属性 (`application.yml`)

关键配置:
- **服务器**: 端口8080，上下文路径`/api`
- **数据库**: MySQL连接池（HikariCP）
- **JPA**: Hibernate DDL模式设置为`update`（自动创建表）
- **JWT**: 密钥和24小时过期时间
- **Swagger**: 在`/swagger-ui.html`启用

### 环境配置文件

- **激活配置**: `dev`（开发模式）
- 可以为`prod`、`test`添加独立配置文件

## API文档

访问交互式API文档:
```
http://localhost:8080/api/swagger-ui.html
```

OpenAPI JSON规范:
```
http://localhost:8080/api/v3/api-docs
```

## 数据库架构

数据库架构在`scholar_platform.sql`中定义，包含以下表:
- **users** - 核心用户账户
- **scholars** - 学者资料扩展
- **achievements** - 学术成果（论文、专利、项目、奖项）
- **achievement_authors** - 作者-成果关系
- **scholar_certifications** - 认证申请
- **forum_boards**、**forum_posts**、**forum_replies** - 讨论论坛
- **direct_messages** - 私信
- **follows** - 用户关注关系
- **user_collections** - 收藏的成果

## 构建与运行

### 前置条件
- Java 21
- Maven 3.9+
- MySQL 8.0+

### 构建
```bash
mvn clean package
```

### 运行
```bash
mvn spring-boot:run
```

或运行JAR文件:
```bash
java -jar target/academic-sharing-platform-1.0.0.jar
```

### 访问
- 应用程序: `http://localhost:8080/api`
- Swagger UI: `http://localhost:8080/api/swagger-ui.html`

## 开发指南

1. **编码前**: 理解分层架构
2. **新功能**:
   - 添加实体 → 仓储 → 服务 → 控制器 → DTO
   - 更新Swagger文档
   - 在`GlobalExceptionHandler`中处理错误
3. **测试**: 为服务编写单元测试，为控制器编写集成测试
4. **代码审查**: 确保代码遵循命名规范和风格指南
5. **安全性**: 永远不要在DTO中暴露敏感数据，始终验证输入

## 主要依赖

- `spring-boot-starter-web` - REST API支持
- `spring-boot-starter-data-jpa` - 数据库ORM
- `spring-boot-starter-security` - 认证与授权
- `spring-boot-starter-validation` - Bean验证
- `mysql-connector-j` - MySQL驱动
- `jjwt` (0.12.3) - JWT令牌处理
- `springdoc-openapi-starter-webmvc-ui` (2.3.0) - Swagger UI
- `lombok` - 减少样板代码
- `mapstruct` (1.5.5.Final) - 对象映射

## 许可证

仅供学术使用。

## 联系方式

如有问题或需要支持，请联系: support@academicplatform.com
