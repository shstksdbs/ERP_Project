import React, { useState } from 'react';
import styles from './ProductRegister.module.css';

export default function ProductRegister() {
  const [formData, setFormData] = useState({
    productName: '',
    productCode: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    unit: '',
    description: '',
    status: 'active'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('상품 등록 데이터:', formData);
    // API 호출 로직 추가
  };

  return (
    <div className={styles['product-register']}>
      <div className={styles['product-register-header']}>
        <h1>상품 등록</h1>
      </div>

      <div className={styles['register-form-container']}>
        <form onSubmit={handleSubmit} className={styles['register-form']}>
          <div className={styles['form-section']}>
            <h2>기본 정보</h2>
            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label htmlFor="productName">상품명 *</label>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  required
                  placeholder="상품명을 입력하세요"
                />
              </div>
              <div className={styles['form-group']}>
                <label htmlFor="productCode">상품 코드 *</label>
                <input
                  type="text"
                  id="productCode"
                  name="productCode"
                  value={formData.productCode}
                  onChange={handleInputChange}
                  required
                  placeholder="상품 코드를 입력하세요"
                />
              </div>
            </div>

            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label htmlFor="category">카테고리</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">카테고리를 선택하세요</option>
                  <option value="food">식품</option>
                  <option value="beverage">음료</option>
                  <option value="dessert">디저트</option>
                  <option value="side">사이드</option>
                </select>
              </div>
              <div className={styles['form-group']}>
                <label htmlFor="status">상태</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">판매중</option>
                  <option value="inactive">판매중지</option>
                  <option value="pending">대기</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles['form-section']}>
            <h2>가격 및 재고 정보</h2>
            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label htmlFor="price">판매가 *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className={styles['form-group']}>
                <label htmlFor="cost">원가</label>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label htmlFor="stock">재고 수량</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className={styles['form-group']}>
                <label htmlFor="unit">단위</label>
                <input
                  type="text"
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  placeholder="개, kg, L 등"
                />
              </div>
            </div>
          </div>

          <div className={styles['form-section']}>
            <h2>상품 설명</h2>
            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label htmlFor="description">상품 설명</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="상품에 대한 상세 설명을 입력하세요"
                  rows="4"
                />
              </div>
            </div>
          </div>

          <div className={styles['form-actions']}>
            <button type="button" className="btn btn-primary">
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              상품 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 