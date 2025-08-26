-- 00_init.sql
-- 데이터베이스 초기화 및 정리

-- 기존 테이블 정리 (역순으로 삭제)
DROP TABLE IF EXISTS branch_menus;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS menus;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS supplier_items;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS users;

-- 데이터베이스 생성 (필요시)
-- CREATE DATABASE IF NOT EXISTS erp_project;
-- USE erp_project;
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

