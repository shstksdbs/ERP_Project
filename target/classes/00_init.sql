-- =====================================================
-- ERP Project Database Initialization Script
-- =====================================================

-- 데이터베이스 생성 (필요시)
-- CREATE DATABASE IF NOT EXISTS erp_project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 데이터베이스 선택
USE erp_system;

-- 스키마 생성
SOURCE 01_schema.sql;

-- 기본 데이터 삽입
SOURCE 02_user_data.sql;
SOURCE 03_menu_data.sql;
SOURCE 04_inventory_data.sql;
SOURCE 05_employee_data.sql;
SOURCE 06_supplier_data.sql;
SOURCE 07_system_settings.sql;

-- 뷰 생성
SOURCE 08_views.sql;

-- 프로시저 및 함수 생성
SOURCE 09_procedures.sql;
SOURCE 10_functions.sql;

-- 트리거 생성
SOURCE 11_triggers.sql;

-- 데이터 검증
SOURCE 12_verification.sql;
