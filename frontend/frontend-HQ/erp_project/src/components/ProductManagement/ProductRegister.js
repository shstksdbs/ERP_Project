import React, { useState, useEffect } from 'react';
import styles from './ProductRegister.module.css';

export default function ProductRegister() {
  const [formData, setFormData] = useState({
    productName: '',
    categoryId: '',
    price: '',
    basePrice: '',
    description: '',
    status: 'active',
    imageUrl: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // 카테고리 데이터 가져오기
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:8080/api/menu-categories/admin');
      if (!response.ok) {
        throw new Error('카테고리 데이터를 가져오는데 실패했습니다');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
      console.error('카테고리 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 카테고리 데이터 로드
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 이미지 파일 선택 처리
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 제거
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.productName.trim() || !formData.price) {
      setError('상품명과 판매가는 필수입니다.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // FormData를 사용하여 이미지와 함께 데이터 전송
      const submitData = new FormData();
      submitData.append('name', formData.productName);
      submitData.append('categoryId', formData.categoryId);
      submitData.append('price', formData.price);
      submitData.append('basePrice', formData.basePrice || 0);
      submitData.append('description', formData.description);
      submitData.append('isAvailable', formData.status === 'active');
      submitData.append('displayOrder', 1);
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      const response = await fetch('http://localhost:8080/api/menus', {
        method: 'POST',
        body: submitData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '상품 등록에 실패했습니다');
      }

      const createdProduct = await response.json();
      console.log('상품이 성공적으로 등록되었습니다:', createdProduct);
      
      // 성공 메시지 표시
      alert('상품이 성공적으로 등록되었습니다!');
      
      // 폼 초기화
      setFormData({
        productName: '',
        categoryId: '',
        price: '',
        basePrice: '',
        description: '',
        status: 'active',
        imageUrl: ''
      });
      setImageFile(null);
      setImagePreview('');
      
    } catch (err) {
      setError(err.message);
      console.error('상품 등록 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['product-register']}>
      <div className={styles['product-register-header']}>
        <h1>상품 등록</h1>
        {error && (
          <div className={styles['error-message']} style={{ color: 'red', marginTop: '10px' }}>
            {error}
          </div>
        )}
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
                <label htmlFor="categoryId">카테고리 *</label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">카테고리를 선택하세요</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.displayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles['form-row']}>
              
              <div className={styles['form-group']}>
                <label htmlFor="status">상태</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles['form-section']}>
            <h2>가격 정보</h2>
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
                <label htmlFor="basePrice">원가</label>
                <input
                  type="number"
                  id="basePrice"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className={styles['form-section']}>
            <h2>상품 이미지</h2>
            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label htmlFor="image">상품 이미지</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles['image-input']}
                />
                <p className={styles['image-help']}>
                  JPG, PNG, GIF 형식의 이미지를 선택하세요 (최대 5MB)
                </p>
              </div>
            </div>
            
            {imagePreview && (
              <div className={styles['image-preview-container']}>
                <h4>이미지 미리보기</h4>
                <div className={styles['image-preview']}>
                  <img src={imagePreview} alt="상품 이미지 미리보기" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className={styles['remove-image-btn']}
                  >
                    이미지 제거
                  </button>
                </div>
              </div>
            )}
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
            <button type="button" className="btn btn-primary" disabled={loading}>
              취소
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '등록 중...' : '상품 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 