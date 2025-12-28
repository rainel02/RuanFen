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



-- paper_keywords definition
DROP TABLE IF EXISTS `paper_keywords`;
CREATE TABLE `paper_keywords` (
  `id` varchar(36) NOT NULL,
  `keyword` varchar(255) NOT NULL COMMENT '关键词',
  `cnt` int NOT NULL DEFAULT '0' COMMENT '出现次数',
  `cnt1` int DEFAULT NULL,
  `cnt2` int DEFAULT NULL,
  `cnt3` int DEFAULT NULL,
  `cnt4` int DEFAULT NULL,
  `cnt5` varchar(100) DEFAULT NULL,
  `cnt6` int DEFAULT NULL,
  `cnt7` int DEFAULT NULL,
  `cnt8` int DEFAULT NULL,
  `cnt9` int DEFAULT NULL,
  `cnt10` int DEFAULT NULL,
  `cnt11` int DEFAULT NULL,
  `cnt12` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_keyword` (`keyword`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='论文关键词统计';

LOCK TABLES `paper_keywords` WRITE;
INSERT INTO paper_keywords (id,keyword,cnt,cnt1,cnt2,cnt3,cnt4,cnt5,cnt6,cnt7,cnt8,cnt9,cnt10,cnt11,cnt12) VALUES
	 ('02da0f66-6ca9-4966-92bc-8c8e8d4e8242','Computational biology',4,0,0,0,0,0,0,1,0,0,1,0,3),
	 ('12b39571-03ee-46b0-8deb-a32680a0339d','Engineering',6,0,0,0,0,0,0,2,0,0,0,1,1),
	 ('17f92c3c-35f8-4996-90f6-f8e6e7fd2ba7','Philosophy',8,0,0,0,0,0,0,0,1,0,1,0,1),
	 ('1d532ee4-28f0-476f-af47-b08d3632aae7','Biology',3,0,0,0,0,0,0,0,0,1,0,0,3),
	 ('a093e90a-c960-42f3-8bd9-7e298b9897d7','Chemistry',4,0,0,0,0,0,0,0,0,1,0,0,1),
	 ('a8ec3023-2de3-4a3e-9990-41b57cef31a5','Computer science',2,0,0,0,0,0,0,0,5,0,0,1,2),
	 ('d50bcb89-75ec-446b-be9c-84c461f00037','Evolutionary biology',2,0,0,0,0,0,0,0,0,2,0,0,2),
	 ('e9231e9a-1450-4cff-8c9d-8d278f471a18','Artificial intelligence',8,0,0,0,0,0,0,5,0,0,2,0,1);
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
  `user_id` varchar(36) NOT NULL COMMENT '用户ID，主键，对应users表ID',
  `author_name` varchar(255) DEFAULT NULL COMMENT '作者显示名称 (OpenAlex display_name)',
  `works_count` int DEFAULT 0 COMMENT '发表作品总数',
  `cited_by_cnt` int DEFAULT 0 COMMENT '被引用总次数',
  `h_index` int DEFAULT 0 COMMENT 'H指数',
  `i10_index` int DEFAULT 0 COMMENT 'i10指数',
  `open_alex_id` varchar(255) DEFAULT NULL COMMENT 'OpenAlex原始ID (用于关联ES数据)',
  `domain` varchar(255) default null comment '学科'
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学者影响力数据缓存表';
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Dumping data for table `scholar_influence`
--




LOCK TABLES `scholar_influence` WRITE;
/*!40000 ALTER TABLE `scholar_influence` DISABLE KEYS */;
/*!40000 ALTER TABLE `scholar_influence` ENABLE KEYS */;
UNLOCK TABLES;


--
-- Table structure for table `scholar_ranking`
--

DROP TABLE IF EXISTS `scholar_ranking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scholar_ranking` (
  `id` VARCHAR(100) PRIMARY KEY,     -- 唯一标识
  `display_name` VARCHAR(255),       -- 姓名
  `domain` VARCHAR(100),             -- 用于 WHERE 查询的一级学科
  `primary_tags` VARCHAR(255),       -- 直接存拼好的字符串，如 "Gynecology, Stroke"
  `h_index` INT,
  `i10_index` INT,
  `works_count` INT,
  `influence_score` DOUBLE,          -- 后端根据算法算好的总分
  `rank_in_domain` INT,              -- 预存该领域的排名，查询更快
  INDEX `idx_domain_score` (`domain`, `influence_score` DESC) -- 核心索引
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scholar_ranking`
--

LOCK TABLES `scholar_ranking` WRITE;
/*!40000 ALTER TABLE `scholar_ranking` DISABLE KEYS */;
/*!40000 ALTER TABLE `scholar_ranking` ENABLE KEYS */;
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
-- 插入5个测试用户（密码都是 password123，BCrypt哈希值）
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `certification_status`, `preferences`) VALUES
('11111111-1111-1111-1111-111111111111', 'zhang_san', 'zhangsan@university.edu.cn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER', 'CERTIFIED', NULL),
('22222222-2222-2222-2222-222222222222', 'li_si', 'lisi@university.edu.cn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER', 'CERTIFIED', NULL),
('33333333-3333-3333-3333-333333333333', 'wang_wu', 'wangwu@university.edu.cn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER', 'PENDING', NULL),
('44444444-4444-4444-4444-444444444444', 'zhao_liu', 'zhaoliu@university.edu.cn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER', 'CERTIFIED', NULL),
('55555555-5555-5555-5555-555555555555', 'qian_qi', 'qianqi@university.edu.cn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER', 'CERTIFIED', NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

-- 插入5个学者门户信息
LOCK TABLES `scholars` WRITE;
/*!40000 ALTER TABLE `scholars` DISABLE KEYS */;
INSERT INTO `scholars` (`user_id`, `public_name`, `organization`, `title`, `bio`, `avatar_url`) VALUES
('11111111-1111-1111-1111-111111111111', '张三', '清华大学计算机科学与技术系', '教授', '专注于人工智能和机器学习领域的研究，在深度学习、自然语言处理等方面有丰富的研究经验。', 'https://via.placeholder.com/150?text=ZS'),
('22222222-2222-2222-2222-222222222222', '李四', '北京大学信息科学技术学院', '副教授', '研究方向包括计算机视觉、图像处理和模式识别。已发表多篇高水平论文，获得多项专利。', 'https://via.placeholder.com/150?text=LS'),
('33333333-3333-3333-3333-333333333333', '王五', '中科院计算技术研究所', '研究员', '主要从事分布式系统、云计算和大数据处理的研究工作。在系统架构设计和性能优化方面有深入的研究。', 'https://via.placeholder.com/150?text=WW'),
('44444444-4444-4444-4444-444444444444', '赵六', '上海交通大学电子信息与电气工程学院', '教授', '专注于网络安全、密码学和区块链技术的研究。在信息安全领域有20多年的研究经验。', 'https://via.placeholder.com/150?text=ZL'),
('55555555-5555-5555-5555-555555555555', '钱七', '浙江大学计算机科学与技术学院', '副教授', '研究方向为数据挖掘、知识图谱和推荐系统。在学术数据分析和智能推荐算法方面有丰富的研究成果。', 'https://via.placeholder.com/150?text=QQ');
/*!40000 ALTER TABLE `scholars` ENABLE KEYS */;
UNLOCK TABLES;

-- 插入一些学术成果（用于测试成果相关接口）
LOCK TABLES `achievements` WRITE;
/*!40000 ALTER TABLE `achievements` DISABLE KEYS */;
INSERT INTO `achievements` (`id`, `type`, `title`, `publication_year`, `abstract`, `doi`, `publication_venue`, `citation_count`, `source_data`, `created_at`) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'paper', '深度学习在自然语言处理中的应用研究', 2023, '本文深入探讨了深度学习技术在自然语言处理领域的应用，提出了新的模型架构和训练方法，在多个基准数据集上取得了优异的性能。', '10.1000/example.doi.001', 'Journal of Artificial Intelligence', 45, NULL, NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'paper', '基于Transformer的计算机视觉模型优化', 2023, '研究了Transformer架构在计算机视觉任务中的应用，提出了高效的注意力机制和模型压缩方法。', '10.1000/example.doi.002', 'Computer Vision Conference', 32, NULL, NOW()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'paper', '分布式系统性能优化与容错机制', 2022, '针对大规模分布式系统的性能瓶颈，提出了新的调度算法和容错策略，显著提升了系统的可靠性和效率。', '10.1000/example.doi.003', 'Distributed Systems Journal', 28, NULL, NOW()),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'paper', '区块链技术在数据安全中的应用', 2023, '探讨了区块链技术在数据安全和隐私保护中的应用，设计了新的共识算法和加密方案。', '10.1000/example.doi.004', 'Security and Privacy Journal', 38, NULL, NOW()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'paper', '知识图谱构建与智能推荐系统', 2022, '提出了基于知识图谱的推荐系统架构，通过实体关系挖掘和语义推理提升推荐准确性。', '10.1000/example.doi.005', 'Knowledge Engineering Review', 25, NULL, NOW());
/*!40000 ALTER TABLE `achievements` ENABLE KEYS */;
UNLOCK TABLES;

-- 插入成果作者关联（建立学者之间的合作关系）
LOCK TABLES `achievement_authors` WRITE;
/*!40000 ALTER TABLE `achievement_authors` DISABLE KEYS */;
INSERT INTO `achievement_authors` (`id`, `achievement_id`, `author_order`, `author_name`, `author_user_id`) VALUES
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, '张三', '11111111-1111-1111-1111-111111111111'),
('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, '李四', '22222222-2222-2222-2222-222222222222'),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, '李四', '22222222-2222-2222-2222-222222222222'),
('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, '王五', '33333333-3333-3333-3333-333333333333'),
('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 1, '王五', '33333333-3333-3333-3333-333333333333'),
('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 2, '赵六', '44444444-4444-4444-4444-444444444444'),
('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 1, '赵六', '44444444-4444-4444-4444-444444444444'),
('d2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 2, '钱七', '55555555-5555-5555-5555-555555555555'),
('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 1, '钱七', '55555555-5555-5555-5555-555555555555'),
('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 2, '张三', '11111111-1111-1111-1111-111111111111');
/*!40000 ALTER TABLE `achievement_authors` ENABLE KEYS */;
UNLOCK TABLES;

-- 插入学者认证申请记录（用于测试认证相关接口）
LOCK TABLES `scholar_certifications` WRITE;
/*!40000 ALTER TABLE `scholar_certifications` DISABLE KEYS */;
INSERT INTO `scholar_certifications` (`id`, `user_id`, `real_name`, `organization`, `org_email`, `title`, `proof_materials`, `status`, `rejection_reason`, `submitted_at`, `processed_by_admin_id`, `processed_at`) VALUES
('cert1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '张三', '清华大学计算机科学与技术系', 'zhangsan@tsinghua.edu.cn', '教授', '["proof1.pdf", "proof2.pdf"]', 'approved', NULL, '2023-01-15 10:00:00', NULL, '2023-01-20 14:30:00'),
('cert2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '王五', '中科院计算技术研究所', 'wangwu@ict.ac.cn', '研究员', '["proof3.pdf"]', 'pending', NULL, '2023-12-01 09:00:00', NULL, NULL);
/*!40000 ALTER TABLE `scholar_certifications` ENABLE KEYS */;
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
