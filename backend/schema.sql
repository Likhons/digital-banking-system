-- Digital Banking System database schema (MySQL 8)
-- Usage: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS digital_banking_system;
USE digital_banking_system;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS accounts (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  account_number VARCHAR(20) NOT NULL,
  account_type ENUM('savings', 'checking') NOT NULL DEFAULT 'savings',
  balance DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  status ENUM('active', 'inactive', 'frozen') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY account_number (account_number),
  KEY user_id (user_id),
  CONSTRAINT accounts_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS transactions (
  id INT NOT NULL AUTO_INCREMENT,
  account_id INT NOT NULL,
  type ENUM('deposit', 'withdrawal', 'transfer_in', 'transfer_out') NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  reference VARCHAR(255) DEFAULT NULL,
  status ENUM('success', 'failed', 'pending') NOT NULL DEFAULT 'success',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY account_id (account_id),
  CONSTRAINT transactions_ibfk_1 FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS beneficiaries (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  account_number VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT beneficiaries_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
