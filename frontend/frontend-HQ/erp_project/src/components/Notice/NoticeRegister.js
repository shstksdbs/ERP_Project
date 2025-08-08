import React, { useState } from 'react';
import styles from './NoticeRegister.module.css';

export default function NoticeRegister() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    priority: 'normal',
    status: 'draft',
    startDate: '',
    endDate: '',
    isImportant: false,
    isPublic: true,
    targetGroup: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('공지 등록 데이터:', formData);
    // API 호출 로직 추가
  };

  return (
    <div className={styles['notice-register']}>
      <div className={styles['notice-register-header']}>
        <h1>공지 등록</h1>
      </div>

      <div className={styles['register-form-container']}>
        <form onSubmit={handleSubmit} className={styles['register-form']}>
          <div className={styles['form-section']}>
            <h2>기본 정보</h2>
            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label htmlFor="title">공지 제목 *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="공지 제목을 입력하세요"
                />
              </div>
              <div className={styles['form-group']}>
                <label htmlFor="category">카테고리</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">카테고리를 선택하세요</option>
                  <option value="general">일반공지</option>
                  <option value="important">중요공지</option>
                  <option value="event">이벤트</option>
                  <option value="maintenance">점검공지</option>
                  <option value="update">업데이트</option>
                </select>
              </div>
            </div>

            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label htmlFor="priority">우선순위</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">낮음</option>
                  <option value="normal">보통</option>
                  <option value="high">높음</option>
                  <option value="urgent">긴급</option>
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
                  <option value="draft">임시저장</option>
                  <option value="published">발행</option>
                  <option value="scheduled">예약발행</option>
                </select>
              </div>
            </div>

            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label htmlFor="targetGroup">대상 그룹 *</label>
                <select
                  id="targetGroup"
                  name="targetGroup"
                  value={formData.targetGroup}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">대상 그룹을 선택하세요</option>
                  <option value="all">전체 직원</option>
                  <option value="manager">매니저급 이상</option>
                  <option value="new">신규 입사자</option>
                  <option value="seoul">서울 지역 지점</option>
                  <option value="owner">점주 대상</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles['form-section']}>
            <h2>공지 내용</h2>
            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label htmlFor="content">공지 내용 *</label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  placeholder="공지 내용을 입력하세요"
                  rows="8"
                />
              </div>
            </div>
          </div>

          <div className={styles['form-section']}>
            <h2>발행 설정</h2>
            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label htmlFor="startDate">발행 시작일</label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles['form-group']}>
                <label htmlFor="endDate">발행 종료일</label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className={styles['form-row']}>
              <div className={styles['checkbox-group']}>
                <label className={styles['checkbox-label']}>
                  <input
                    type="checkbox"
                    name="isImportant"
                    checked={formData.isImportant}
                    onChange={handleInputChange}
                  />
                  <span>중요 공지로 설정</span>
                </label>
              </div>
              <div className={styles['checkbox-group']}>
                <label className={styles['checkbox-label']}>
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                  />
                  <span>공개 공지</span>
                </label>
              </div>
            </div>
          </div>

          <div className={styles['form-actions']}>
            <button type="button" className="btn btn-secondary">
              취소
            </button>
            <button type="button" className="btn btn-primary">
              임시저장
            </button>
            <button type="submit" className="btn btn-primary">
              공지 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 