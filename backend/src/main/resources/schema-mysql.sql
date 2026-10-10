-- ====================================================================
-- NovaChat AI - MySQL Workbench Enterprise Schema DDL
-- Compatible with MySQL 8.0+ / MySQL Workbench
-- ====================================================================

CREATE DATABASE IF NOT EXISTS novachat_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE novachat_db;

-- 1. app_users Table (Stores registered users & solitary Super Admin)
CREATE TABLE IF NOT EXISTS app_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME,
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. chat_sessions Table (Stores active and past user chat sessions)
CREATE TABLE IF NOT EXISTS chat_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_uuid VARCHAR(64) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    title VARCHAR(255),
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    total_questions INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_sess_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE,
    INDEX idx_sess_uuid (session_uuid),
    INDEX idx_sess_user (user_id),
    INDEX idx_sess_started (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. chat_questions Table (Stores full list of questions & Gemini AI responses)
CREATE TABLE IF NOT EXISTS chat_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    question_number INT NOT NULL,
    question_text LONGTEXT NOT NULL,
    response_text LONGTEXT,
    asked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    response_time_ms BIGINT,
    model_used VARCHAR(50),
    tokens_estimated INT,
    CONSTRAINT fk_ques_sess FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    INDEX idx_q_session (session_id),
    INDEX idx_q_asked (asked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- Useful Queries for MySQL Workbench inspection:
-- ====================================================================

-- View all user sessions and question totals:
-- SELECT s.session_uuid, u.username, u.email, s.title, s.total_questions, s.status, s.started_at
-- FROM chat_sessions s
-- JOIN app_users u ON s.user_id = u.id
-- ORDER BY s.started_at DESC;

-- View questions asked by users in a specific session:
-- SELECT q.question_number, q.question_text, q.response_time_ms, q.tokens_estimated, q.asked_at
-- FROM chat_questions q
-- JOIN chat_sessions s ON q.session_id = s.id
-- WHERE s.session_uuid = 'ses_your_session_uuid'
-- ORDER BY q.question_number ASC;
