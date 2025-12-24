-- MySQL dump 10.13  Distrib 8.0.39, for Win64 (x86_64)
--
-- Host: localhost    Database: scholar_platform
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `achievement_authors`
--

DROP TABLE IF EXISTS `achievement_authors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievement_authors` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `achievement_id` char(36) NOT NULL COMMENT '成果ID',
  `author_order` int NOT NULL COMMENT '作者署名顺序',
  `author_name` varchar(100) NOT NULL COMMENT '论文上的原始署名',
  `author_user_id` char(36) DEFAULT NULL COMMENT '关联的本平台用户ID(若已认领)',
  PRIMARY KEY (`id`),
  KEY `idx_achievement` (`achievement_id`),
  KEY `idx_author_user` (`author_user_id`),
  CONSTRAINT `fk_aa_achievement` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_aa_user` FOREIGN KEY (`author_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='成果-作者关联表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievement_authors`
--

LOCK TABLES `achievement_authors` WRITE;
/*!40000 ALTER TABLE `achievement_authors` DISABLE KEYS */;
/*!40000 ALTER TABLE `achievement_authors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `achievements`
--

DROP TABLE IF EXISTS `achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievements` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `type` enum('paper','patent','project','award') NOT NULL COMMENT '成果类型',
  `title` text NOT NULL COMMENT '标题',
  `publication_year` int DEFAULT NULL COMMENT '发表年份',
  `abstract` text COMMENT '摘要',
  `doi` varchar(100) DEFAULT NULL COMMENT 'DOI唯一标识',
  `publication_venue` varchar(255) DEFAULT NULL COMMENT '发表期刊/会议',
  `citation_count` int NOT NULL DEFAULT '0' COMMENT '引用次数',
  `source_data` json DEFAULT NULL COMMENT '原始数据源(OpenAlex等)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '录入时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_doi` (`doi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='学术成果主表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievements`
--

LOCK TABLES `achievements` WRITE;
/*!40000 ALTER TABLE `achievements` DISABLE KEYS */;
/*!40000 ALTER TABLE `achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `direct_messages`
--

DROP TABLE IF EXISTS `direct_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `direct_messages` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `sender_id` char(36) NOT NULL COMMENT '发送者',
  `recipient_id` char(36) NOT NULL COMMENT '接收者',
  `content` text NOT NULL COMMENT '内容',
  `sent_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
  PRIMARY KEY (`id`),
  KEY `idx_dm_sender` (`sender_id`),
  KEY `idx_dm_recipient` (`recipient_id`),
  CONSTRAINT `fk_dm_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_dm_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='私信记录';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direct_messages`
--

LOCK TABLES `direct_messages` WRITE;
/*!40000 ALTER TABLE `direct_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `direct_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `follows`
--

DROP TABLE IF EXISTS `follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `follows` (
  `follower_id` char(36) NOT NULL COMMENT '关注者ID',
  `following_id` char(36) NOT NULL COMMENT '被关注者ID',
  PRIMARY KEY (`follower_id`,`following_id`),
  KEY `idx_following` (`following_id`),
  CONSTRAINT `fk_follow_follower` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_follow_following` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户关注关系';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `follows`
--

LOCK TABLES `follows` WRITE;
/*!40000 ALTER TABLE `follows` DISABLE KEYS */;
/*!40000 ALTER TABLE `follows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_boards`
--

DROP TABLE IF EXISTS `forum_boards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_boards` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(100) NOT NULL COMMENT '板块名称',
  `type` int NOT NULL COMMENT '板块类型',
  `description` text COMMENT '描述',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_board_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='论坛板块';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_boards`
--

LOCK TABLES `forum_boards` WRITE;
/*!40000 ALTER TABLE `forum_boards` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_boards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_posts`
--

DROP TABLE IF EXISTS `forum_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_posts` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `board_id` char(36) NOT NULL COMMENT '所属板块',
  `author_id` char(36) NOT NULL COMMENT '发帖人',
  `title` varchar(255) NOT NULL COMMENT '标题',
  `content` text NOT NULL COMMENT '内容',
  `attachments` json DEFAULT NULL COMMENT '附件列表',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  `view_count` int DEFAULT '0', 
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_board` (`board_id`),
  KEY `fk_post_author` (`author_id`),
  CONSTRAINT `fk_post_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_post_board` FOREIGN KEY (`board_id`) REFERENCES `forum_boards` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='论坛帖子';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_posts`
--

LOCK TABLES `forum_posts` WRITE;
/*!40000 ALTER TABLE `forum_posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_replies`
--

DROP TABLE IF EXISTS `forum_replies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_replies` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `post_id` char(36) NOT NULL COMMENT '关联帖子',
  `author_id` char(36) NOT NULL COMMENT '回复人',
  `content` text NOT NULL COMMENT '回复内容',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '回复时间',
  `attachments` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_post` (`post_id`),
  KEY `fk_reply_author` (`author_id`),
  CONSTRAINT `fk_reply_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_reply_post` FOREIGN KEY (`post_id`) REFERENCES `forum_posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='帖子回复';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_replies`
--

LOCK TABLES `forum_replies` WRITE;
/*!40000 ALTER TABLE `forum_replies` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_replies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paper_keywords`
--

DROP TABLE IF EXISTS `paper_keywords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paper_keywords` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `keyword` varchar(255) NOT NULL COMMENT '关键词',
  `cnt` int NOT NULL DEFAULT '0' COMMENT '出现次数',
  PRIMARY KEY (`id`),
  KEY `idx_keyword` (`keyword`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='论文关键词统计';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paper_keywords`
--

LOCK TABLES `paper_keywords` WRITE;
/*!40000 ALTER TABLE `paper_keywords` DISABLE KEYS */;
/*!40000 ALTER TABLE `paper_keywords` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `papers`
--

DROP TABLE IF EXISTS `papers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `papers` (
  `id` varchar(100) NOT NULL COMMENT '论文标识符(非UUID，可能是OpenAlex ID)',
  `title` varchar(100) DEFAULT NULL,
  `display_name` varchar(100) DEFAULT NULL,
  `publication_year` int DEFAULT NULL,
  `publication_date` timestamp NULL DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `doi` varchar(100) DEFAULT NULL,
  `host_venue` json DEFAULT NULL COMMENT '期刊信息的JSON结构',
  `authorships` json DEFAULT NULL COMMENT '作者列表JSON',
  `abstract_text` text COMMENT '摘要',
  `concepts` json DEFAULT NULL COMMENT '涉及主题JSON',
  `cited_by_count` int DEFAULT NULL COMMENT '被引次数',
  PRIMARY KEY (`id`),
  KEY `idx_paper_doi` (`doi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='论文元数据表(ES同步源)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `papers`
--

LOCK TABLES `papers` WRITE;
/*!40000 ALTER TABLE `papers` DISABLE KEYS */;
/*!40000 ALTER TABLE `papers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scholar_certifications`
--

DROP TABLE IF EXISTS `scholar_certifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scholar_certifications` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `user_id` char(36) NOT NULL COMMENT '关联用户ID',
  `real_name` varchar(100) NOT NULL COMMENT '真实姓名',
  `organization` varchar(255) NOT NULL COMMENT '所属机构',
  `org_email` varchar(100) DEFAULT NULL COMMENT '机构邮箱',
  `title` varchar(100) DEFAULT NULL COMMENT '职称/学位',
  `proof_materials` text COMMENT '证明材料文件Key列表(JSON)',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT '审核状态',
  `rejection_reason` text COMMENT '驳回理由',
  `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
  `processed_by_admin_id` char(36) DEFAULT NULL COMMENT '处理管理员ID',
  `processed_at` timestamp NULL DEFAULT NULL COMMENT '处理时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `fk_cert_admin` (`processed_by_admin_id`),
  CONSTRAINT `fk_cert_admin` FOREIGN KEY (`processed_by_admin_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_cert_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='学者认证申请记录';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scholar_certifications`
--

LOCK TABLES `scholar_certifications` WRITE;
/*!40000 ALTER TABLE `scholar_certifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `scholar_certifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scholar_influence`
--

DROP TABLE IF EXISTS `scholar_influence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scholar_influence` (
  `scholar_id` char(36) NOT NULL COMMENT '学者ID',
  `year` int NOT NULL COMMENT '年份',
  `value` decimal(18,4) NOT NULL COMMENT '影响力数值',
  PRIMARY KEY (`scholar_id`,`year`),
  CONSTRAINT `fk_inf_scholar` FOREIGN KEY (`scholar_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='学者影响力年表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scholar_influence`
--

LOCK TABLES `scholar_influence` WRITE;
/*!40000 ALTER TABLE `scholar_influence` DISABLE KEYS */;
/*!40000 ALTER TABLE `scholar_influence` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scholars`
--

DROP TABLE IF EXISTS `scholars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scholars` (
  `user_id` char(36) NOT NULL COMMENT '用户ID',
  `public_name` varchar(100) NOT NULL COMMENT '公开姓名',
  `organization` varchar(255) DEFAULT NULL COMMENT '公开机构',
  `title` varchar(100) DEFAULT NULL COMMENT '公开职称',
  `bio` text COMMENT '个人简介',
  `avatar_url` varchar(255) DEFAULT NULL COMMENT '头像URL',
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_scholar_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='学者门户信息';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scholars`
--

LOCK TABLES `scholars` WRITE;
/*!40000 ALTER TABLE `scholars` DISABLE KEYS */;
/*!40000 ALTER TABLE `scholars` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_logs`
--

DROP TABLE IF EXISTS `task_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_logs` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `task_id` varchar(100) NOT NULL COMMENT '关联任务ID',
  `started_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
  `finished_at` timestamp NULL DEFAULT NULL COMMENT '结束时间',
  `status` enum('success','failed') NOT NULL COMMENT '最终状态',
  `log_output` text COMMENT '输出日志',
  PRIMARY KEY (`id`),
  KEY `idx_task_id` (`task_id`),
  CONSTRAINT `fk_log_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='定时任务日志';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_logs`
--

LOCK TABLES `task_logs` WRITE;
/*!40000 ALTER TABLE `task_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `task_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` varchar(100) NOT NULL COMMENT '任务标识(非UUID)',
  `name` varchar(255) NOT NULL COMMENT '任务名称',
  `cron_schedule` varchar(100) NOT NULL COMMENT 'Cron表达式',
  `status` enum('enabled','disabled') NOT NULL DEFAULT 'disabled' COMMENT '任务状态',
  `params` json DEFAULT NULL COMMENT '运行参数',
  `last_run_at` timestamp NULL DEFAULT NULL COMMENT '上次运行时间',
  `last_run_status` enum('success','failed') DEFAULT NULL COMMENT '上次状态',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='定时任务配置';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_achievement_log`
--

DROP TABLE IF EXISTS `user_achievement_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_achievement_log` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `user_id` char(36) NOT NULL COMMENT '提交人ID',
  `achievement_id` char(36) DEFAULT NULL COMMENT '关联成果ID',
  `submission_data` text NOT NULL COMMENT '提交的原始数据',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT '审核状态',
  `processed_by_admin_id` char(36) DEFAULT NULL COMMENT '处理管理员ID',
  `processed_at` timestamp NULL DEFAULT NULL COMMENT '处理时间',
  PRIMARY KEY (`id`),
  KEY `idx_log_user` (`user_id`),
  KEY `fk_log_admin` (`processed_by_admin_id`),
  CONSTRAINT `fk_log_admin` FOREIGN KEY (`processed_by_admin_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_log_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='成果认领/提交审核日志';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_achievement_log`
--

LOCK TABLES `user_achievement_log` WRITE;
/*!40000 ALTER TABLE `user_achievement_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_achievement_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_appeals`
--

DROP TABLE IF EXISTS `user_appeals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_appeals` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `applicant_user_id` char(36) NOT NULL COMMENT '申诉人ID',
  `appeal_type` enum('identity_stolen','achievement_stolen') NOT NULL COMMENT '申诉类型',
  `target_id` varchar(255) NOT NULL COMMENT '被申诉的目标ID(学者ID或成果ID)',
  `reason` text NOT NULL COMMENT '申诉理由',
  `evidence_materials` text COMMENT '证据材料Key列表',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT '申诉状态',
  `processed_by_admin_id` char(36) DEFAULT NULL COMMENT '处理管理员ID',
  `processed_at` timestamp NULL DEFAULT NULL COMMENT '处理时间',
  PRIMARY KEY (`id`),
  KEY `idx_applicant` (`applicant_user_id`),
  KEY `fk_appeal_admin` (`processed_by_admin_id`),
  CONSTRAINT `fk_appeal_admin` FOREIGN KEY (`processed_by_admin_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_appeal_user` FOREIGN KEY (`applicant_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户申诉记录';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_appeals`
--

LOCK TABLES `user_appeals` WRITE;
/*!40000 ALTER TABLE `user_appeals` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_appeals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_collections`
--

DROP TABLE IF EXISTS `user_collections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_collections` (
  `user_id` char(36) NOT NULL COMMENT '用户ID',
  `achievement_id` char(36) NOT NULL COMMENT '成果ID',
  `saved_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`user_id`,`achievement_id`),
  KEY `fk_collect_ach` (`achievement_id`),
  CONSTRAINT `fk_collect_ach` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_collect_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户收藏表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_collections`
--

LOCK TABLES `user_collections` WRITE;
/*!40000 ALTER TABLE `user_collections` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_collections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `email` varchar(100) NOT NULL COMMENT '邮箱',
  `password_hash` varchar(255) NOT NULL COMMENT '加盐哈希密码',
  `role` enum('USER','ADMIN') NOT NULL DEFAULT 'USER' COMMENT '角色: user/admin',
  `certification_status` enum('NOT_CERTIFIED','PENDING','CERTIFIED') NOT NULL DEFAULT 'NOT_CERTIFIED' COMMENT '认证状态',
  `preferences` text COMMENT '用户偏好设置(JSON字符串)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='核心用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 16:03:06
