# 逻辑架构图

下面是根据 `架构设计.md`（及工程目录结构）绘制的逻辑架构图，使用 Mermaid 语法，可以在支持 Mermaid 的编辑器或预览器中查看。

备注：本架构基于单体 Spring Boot 后端 + Vue3 前端（SPA），使用 Nginx 做反向代理/静态资源托管，Redis 作缓存，MySQL 作持久化，Elasticsearch 做检索，部署在容器（Docker / Kubernetes）环境中，鉴权使用 JWT。

```mermaid
flowchart LR
  %% 客户端与用户角色
  subgraph Client[用户端]
    A[浏览器 (SPA - Vue3 + Pinia + Vue-Router)]
    Users[用户角色: 学者 / 管理员 (RBAC)]
  end

  %% 边缘层：CDN 与网关 (Nginx + WAF/DDoS)
  subgraph Edge[边缘层]
    CDN[CDN / 静态资源缓存]
    NGINX[Nginx (反向代理, TLS, WAF, DDoS 防护)]
  end

  %% 应用层：单体 Spring Boot（容器化部署）
  subgraph AppCluster[应用层 - 单体容器组]
    LB[负载均衡]
    APP[Spring Boot 单体应用\n(Controller / Service / Repository)\n无状态, JWT 鉴权]
  end

  %% 数据服务：Redis 主从、MySQL、Elasticsearch、对象存储
  subgraph DataServices[后端支撑服务]
    RedisMaster[Redis 主 (AOF + RDB 持久化)]
    RedisSlave[Redis 从 (只读)]
    MySQL[MySQL (关系型存储, 备份/主从)]
    ES[Elasticsearch 集群 (全文检索)]
    FileStore[对象存储 (文件/附件/备份)]
  end

  %% 运维与可观测（使用泛化节点，移除具体技术名）
  subgraph Infra[运维 & 可观测]
    K8S[Kubernetes / Docker (部署 & 编排)]
    Monitoring[监控与日志收集 (指标/日志/告警)]
    Backup[定期备份 (异地/云存储)]
  end

  %% 流程与交互
  A -->|1. 请求静态资源 (HTML/CSS/JS)| CDN
  CDN -->|回源| NGINX
  A -->|2. API 请求 (HTTPS, Authorization: Bearer <JWT>)| NGINX
  Users -.->|登录/注册| APP
  NGINX --> LB
  LB --> APP

  %% 应用与缓存/存储交互
  APP -->|读写缓存| RedisMaster
  RedisMaster -->|异步复制| RedisSlave
  APP -->|事务性存储| MySQL
  APP -->|索引/查询| ES
  APP -->|上传/下载| FileStore

  %% 持久化与备份
  RedisMaster -->|AOF/RDB 持久化| Backup
  MySQL -->|定期备份 / 快照| Backup
  FileStore --> Backup

  %% 监控与日志（泛化）
  APP -->|指标/日志/告警| Monitoring
  Monitoring -->|日志/指标归档| Backup

  %% Kubernetes 与基础设施
  K8S --- AppCluster
  K8S --- DataServices
  K8S --- Infra

  %% 认证/权限
  subgraph AuthNote[认证 & 权限]
    JWT[JWT 签发与验证 (Spring Boot)]
    RBAC[基于角色的访问控制]
  end
  APP --> JWT
  APP --> RBAC
  Users -->|持有 token| JWT

  %% 实时通信（Chat）为可选模块
  subgraph Realtime[实时通信]
    WS[WebSocket (可选, ChatPage)]
  end
  A -->|实时连接| WS
  WS --> APP

  classDef infra fill:#f9f,stroke:#333,stroke-width:1px;
  class Infra,DataServices,K8S infra

  %% 图例
  classDef legend fill:#fff,stroke:#000,stroke-width:0.5px;
  subgraph Legend [说明]
    L1[HTTPS / REST]:::legend
    L2[WAF / DDoS 在 Nginx 层防护]:::legend
    L3[Redis: 主从复制 + AOF/RDB 持久化]:::legend
  end
```

---

如何查看与导出

- 在 VS Code 中安装 "Markdown Preview Enhanced" 或 "Mermaid Preview" 插件，可以直接预览 `docs/logic-architecture.md` 中的 Mermaid 图。
- 若要导出为 PNG/SVG：
  - 方法一（本地）：安装 `@mermaid-js/mermaid-cli`（需要 Node.js），然后运行导出命令（示例见下）。
  - 方法二（VS Code 插件）：使用 Mermaid Preview 插件的导出功能导出为 PNG/SVG。

示例：用 mermaid-cli 导出（PowerShell）：

```powershell
npm i -g @mermaid-js/mermaid-cli
mmdc -i docs\logic-architecture.md -o docs\logic-architecture.png
```

如果你希望我现在直接把图导出为 PNG 并放到仓库（需要在此环境安装 mermaid-cli），我可以继续执行并把文件写入 `docs/logic-architecture.png`。否则你可以在本地按上面步骤导出。

---

说明与假设

- 本图基于 `架构设计.md` 中的描述（单体 Spring Boot 后端、Vue3 前端、Nginx、Redis、MySQL、Elasticsearch、Kubernetes），并结合项目目录结构（`src/components`, `src/views`, `mock`, `stores` 等）体现前端为 SPA、后端为 REST API 的交互模式。
- 聊天功能（`ChatPage.vue`、`ChatWindow.vue`）被标注为可选实时通道（WebSocket），如果项目当前使用轮询也可把该连线改为 HTTPS API。

需要我继续做什么？

- 我可以：
  - 立即在仓库中生成 PNG/SVG 导出文件（会运行 mermaid-cli 并写入文件）；
  - 把该图插入到 README 或 `架构设计.md` 的适当位置；
  - 按照 C4 层级画出更详细的组件/接口级图（比如把 `src/stores/*`、`src/views/*` 细化为组件交互图）。

请选择下一步或直接说明你想要的格式/细节（例如：更简洁版 / 更详细版 / 包含网络层与端口）。
