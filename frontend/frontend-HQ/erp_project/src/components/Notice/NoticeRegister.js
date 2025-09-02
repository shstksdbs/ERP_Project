import React, { useState, useEffect } from 'react';
import styles from './NoticeRegister.module.css';
import { noticeService } from '../../services/noticeService';
import { noticeTargetService } from '../../services/noticeTargetService';

export default function NoticeRegister({ setActiveTab }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal',
    status: 'draft',
    isImportant: false,
    isPublic: true,
    targetGroupIds: []
  });

  const [targetGroups, setTargetGroups] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 대상 그룹 목록 로드
  useEffect(() => {
    loadTargetGroups();
  }, []);

  const loadTargetGroups = async () => {
    try {
      const groups = await noticeTargetService.getTargetGroups();
      setTargetGroups(groups);
    } catch (error) {
      console.error('대상 그룹 로드 실패:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTargetGroupSelectChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      targetGroupIds: value ? [parseInt(value)] : []
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 공지사항 생성
      const noticeData = {
        ...formData,
        // authorId는 백엔드에서 자동으로 설정됨
        targetGroupIds: formData.targetGroupIds
      };

      const createdNotice = await noticeService.createNotice(noticeData);

      // 파일 업로드
      if (attachments.length > 0) {
        for (const file of attachments) {
          await noticeService.uploadFile(createdNotice.id, file);
        }
      }

      setSuccess('공지사항이 성공적으로 등록되었습니다.');
      
      // 폼 초기화
      setFormData({
        title: '',
        content: '',
        category: 'general',
        priority: 'normal',
        status: 'draft',
        isImportant: false,
        isPublic: true,
        targetGroupIds: []
      });
      setAttachments([]);

      // 바로 공지사항 목록 탭으로 이동
      if (setActiveTab) {
        setActiveTab(['notice', 'notice-list']);
      }

    } catch (error) {
      setError(error.message || '공지사항 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const noticeData = {
        ...formData,
        status: 'draft',
        // authorId는 백엔드에서 자동으로 설정됨
        targetGroupIds: formData.targetGroupIds
      };

      await noticeService.createNotice(noticeData);
      setSuccess('임시저장이 완료되었습니다.');

      // 바로 공지사항 목록 탭으로 이동
      if (setActiveTab) {
        setActiveTab(['notice', 'notice-list']);
      }

    } catch (error) {
      setError(error.message || '임시저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['notice-register']}>
      <div className={styles['notice-register-header']}>
        <h1>공지 등록</h1>
      </div>

      {/* 성공/오류 메시지 */}
      {success && (
        <div className={styles['success-message']}>
          {success}
        </div>
      )}
      {error && (
        <div className={styles['error-message']}>
          {error}
        </div>
      )}

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
                  {noticeService.getCategoryOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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
                  {noticeService.getPriorityOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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
                  {noticeService.getStatusOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label htmlFor="targetGroup">대상 그룹 *</label>
                <select
                  id="targetGroup"
                  name="targetGroup"
                  value={formData.targetGroupIds.length > 0 ? formData.targetGroupIds[0] : ''}
                  onChange={handleTargetGroupSelectChange}
                  required
                >
                  <option value="">대상 그룹을 선택하세요</option>
                  {targetGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.memberCount}명)
                    </option>
                  ))}
                </select>
                <small className={styles['help-text']}>
                  대상 그룹을 선택하지 않으면 전체 직원이 대상입니다.
                </small>
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
            <h2>첨부 파일</h2>
            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label htmlFor="attachments">파일 첨부</label>
                <input
                  type="file"
                  id="attachments"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                />
                <small className={styles['help-text']}>
                  PDF, Word, Excel, PowerPoint, 이미지 파일만 업로드 가능합니다.
                </small>
              </div>
            </div>

            {/* 첨부파일 목록 */}
            {attachments.length > 0 && (
              <div className={styles['attachments-list']}>
                <h4>첨부된 파일</h4>
                {attachments.map((file, index) => (
                  <div key={index} className={styles['attachment-item']}>
                    <span className={styles['file-name']}>{file.name}</span>
                    <span className={styles['file-size']}>
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className={styles['remove-file-btn']}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles['form-section']}>
            <h2>발행 설정</h2>
            <div className={styles['form-row2']}>
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
            <button type="button" className="btn btn-secondary" disabled={loading}>
              취소
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSaveDraft}
              disabled={loading}
            >
              {loading ? '저장 중...' : '임시저장'}
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '등록 중...' : '공지 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 