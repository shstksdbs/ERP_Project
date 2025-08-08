import React, { useState, useEffect } from 'react';
import styles from './EmployeeSchedule.module.css';
import calendarIcon from '../../assets/calendar_icon.png';
import userIcon from '../../assets/user_icon.png';
import clockIcon from '../../assets/clock_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import searchIcon from '../../assets/search_icon.png';

export default function EmployeeSchedule() {
  const [activeTab, setActiveTab] = useState('schedule-list');
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
  const [showScheduleDetailModal, setShowScheduleDetailModal] = useState(false);

  // 샘플 데이터
  useEffect(() => {
    const sampleEmployees = [
      { id: 1, name: '김철수', position: '매니저', department: '매장관리' },
      { id: 2, name: '이영희', position: '바리스타', department: '제조' },
      { id: 3, name: '박민수', position: '캐셔', department: '판매' },
      { id: 4, name: '정수진', position: '바리스타', department: '제조' }
    ];

    const sampleSchedules = [
      {
        id: 1,
        employeeId: 1,
        employeeName: '김철수',
        position: '매니저',
        date: '2024-01-15',
        startTime: '09:00',
        endTime: '18:00',
        workHours: 9,
        status: 'confirmed',
        notes: '오픈 담당',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-12'
      },
      {
        id: 2,
        employeeId: 2,
        employeeName: '이영희',
        position: '바리스타',
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '19:00',
        workHours: 9,
        status: 'confirmed',
        notes: '제조 담당',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-12'
      },
      {
        id: 3,
        employeeId: 3,
        employeeName: '박민수',
        position: '캐셔',
        date: '2024-01-15',
        startTime: '11:00',
        endTime: '20:00',
        workHours: 9,
        status: 'pending',
        notes: '판매 담당',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-12'
      },
      {
        id: 4,
        employeeId: 4,
        employeeName: '정수진',
        position: '바리스타',
        date: '2024-01-15',
        startTime: '12:00',
        endTime: '21:00',
        workHours: 9,
        status: 'confirmed',
        notes: '제조 담당',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-12'
      }
    ];

    setEmployees(sampleEmployees);
    setSchedules(sampleSchedules);
  }, []);

  const handleAddSchedule = (newSchedule) => {
    const scheduleWithId = {
      ...newSchedule,
      id: schedules.length + 1,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setSchedules([...schedules, scheduleWithId]);
    setShowAddScheduleModal(false);
  };

  const handleEditSchedule = (updatedSchedule) => {
    setSchedules(schedules.map(schedule => 
      schedule.id === updatedSchedule.id 
        ? { ...updatedSchedule, updatedAt: new Date().toISOString().split('T')[0] }
        : schedule
    ));
    setShowEditScheduleModal(false);
  };

  const handleDeleteSchedule = (scheduleId) => {
    setSchedules(schedules.filter(schedule => schedule.id !== scheduleId));
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return '확정';
      case 'pending': return '대기';
      case 'cancelled': return '취소';
      default: return '알 수 없음';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed': return styles.statusConfirmed;
      case 'pending': return styles.statusPending;
      case 'cancelled': return styles.statusCancelled;
      default: return '';
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmployee = selectedEmployee === 'all' || schedule.employeeId.toString() === selectedEmployee;
    const matchesDate = !selectedDate || schedule.date === selectedDate;
    return matchesSearch && matchesEmployee && matchesDate;
  });

  const totalSchedules = schedules.length;
  const confirmedSchedules = schedules.filter(s => s.status === 'confirmed').length;
  const pendingSchedules = schedules.filter(s => s.status === 'pending').length;
  const totalWorkHours = schedules.reduce((sum, s) => sum + s.workHours, 0);

  return (
    <div className={styles.schedule}>
      <div className={styles.scheduleHeader}>
        <h1>직원 스케줄 관리</h1>
        <p>직원들의 근무 스케줄을 관리하고 조정할 수 있습니다.</p>
      </div>

      {/* 탭 컨테이너 */}
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === 'schedule-list' ? styles.active : ''}`}
          onClick={() => setActiveTab('schedule-list')}
        >
          스케줄 목록
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'schedule-calendar' ? styles.active : ''}`}
          onClick={() => setActiveTab('schedule-calendar')}
        >
          캘린더 보기
        </button>
      </div>

      {/* 스케줄 관리 섹션 */}
      <div className={styles.scheduleManagement}>
        {/* 요약 카드 */}
        <div className={styles.summaryCards}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <img src={calendarIcon} alt="캘린더" />
            </div>
            <div className={styles.summaryContent}>
              <h3>총 스케줄</h3>
              <p>{totalSchedules}개</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <img src={userIcon} alt="직원" />
            </div>
            <div className={styles.summaryContent}>
              <h3>확정된 스케줄</h3>
              <p>{confirmedSchedules}개</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <img src={clockIcon} alt="시간" />
            </div>
            <div className={styles.summaryContent}>
              <h3>총 근무 시간</h3>
              <p>{totalWorkHours}시간</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <img src={userIcon} alt="대기" />
            </div>
            <div className={styles.summaryContent}>
              <h3>대기 중인 스케줄</h3>
              <p>{pendingSchedules}개</p>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className={styles.searchFilterContainer}>
          <div className={styles.searchBox}>
            <div className={styles.searchInputContainer}>
              <img src={searchIcon} alt="검색" className={styles.searchIcon} />
              <input
                type="text"
                placeholder="직원명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
          <div className={styles.filterBox}>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">모든 직원</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.position})
                </option>
              ))}
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={styles.filterSelect}
            />
          </div>
          <button
            className={styles.addButton}
            onClick={() => setShowAddScheduleModal(true)}
          >
            <img src={plusIcon} alt="추가" className={styles.buttonIcon} />
            스케줄 추가
          </button>
        </div>

        {/* 스케줄 테이블 */}
        <div className={styles.schedulesContainer}>
          <table className={styles.schedulesTable}>
            <thead className={styles.schedulesTableHeader}>
              <tr>
                <th>직원명</th>
                <th>직책</th>
                <th>날짜</th>
                <th>시작 시간</th>
                <th>종료 시간</th>
                <th>근무 시간</th>
                <th>상태</th>
                <th>메모</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map(schedule => (
                <tr key={schedule.id}>
                  <td>
                    <div className={styles.employeeInfo}>
                      <span className={styles.employeeName}>{schedule.employeeName}</span>
                    </div>
                  </td>
                  <td>{schedule.position}</td>
                  <td>{schedule.date}</td>
                  <td>{schedule.startTime}</td>
                  <td>{schedule.endTime}</td>
                  <td>{schedule.workHours}시간</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(schedule.status)}`}>
                      {getStatusText(schedule.status)}
                    </span>
                  </td>
                  <td>{schedule.notes}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.btnSmall}
                        onClick={() => {
                          setSelectedSchedule(schedule);
                          setShowScheduleDetailModal(true);
                        }}
                      >
                        상세
                      </button>
                      <button
                        className={styles.btnSmall}
                        onClick={() => {
                          setSelectedSchedule(schedule);
                          setShowEditScheduleModal(true);
                        }}
                      >
                        <img src={pencilIcon} alt="수정" className={styles.actionIcon} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 모달들 */}
      {showAddScheduleModal && (
        <AddScheduleModal
          employees={employees}
          onAdd={handleAddSchedule}
          onClose={() => setShowAddScheduleModal(false)}
        />
      )}

      {showEditScheduleModal && selectedSchedule && (
        <EditScheduleModal
          schedule={selectedSchedule}
          employees={employees}
          onUpdate={handleEditSchedule}
          onClose={() => setShowEditScheduleModal(false)}
        />
      )}

      {showScheduleDetailModal && selectedSchedule && (
        <ScheduleDetailModal
          schedule={selectedSchedule}
          onClose={() => setShowScheduleDetailModal(false)}
        />
      )}
    </div>
  );
}

// 스케줄 추가 모달
function AddScheduleModal({ employees, onAdd, onClose }) {
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    startTime: '',
    endTime: '',
    notes: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedEmployee = employees.find(emp => emp.id.toString() === formData.employeeId);
    const workHours = formData.startTime && formData.endTime ? 
      (new Date(`2000-01-01T${formData.endTime}`) - new Date(`2000-01-01T${formData.startTime}`)) / (1000 * 60 * 60) : 0;

    const newSchedule = {
      ...formData,
      employeeName: selectedEmployee?.name || '',
      position: selectedEmployee?.position || '',
      workHours: Math.abs(workHours),
      status: 'pending'
    };

    onAdd(newSchedule);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>스케줄 추가</h2>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>
        <form className={styles.editForm} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>직원 선택</label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                required
              >
                <option value="">직원을 선택하세요</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.position})
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>날짜</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>시작 시간</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>종료 시간</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>메모</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose}>취소</button>
            <button type="submit">추가</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 스케줄 수정 모달
function EditScheduleModal({ schedule, employees, onUpdate, onClose }) {
  const [formData, setFormData] = useState({
    employeeId: schedule.employeeId.toString(),
    date: schedule.date,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    notes: schedule.notes,
    status: schedule.status
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedEmployee = employees.find(emp => emp.id.toString() === formData.employeeId);
    const workHours = formData.startTime && formData.endTime ? 
      (new Date(`2000-01-01T${formData.endTime}`) - new Date(`2000-01-01T${formData.startTime}`)) / (1000 * 60 * 60) : 0;

    const updatedSchedule = {
      ...schedule,
      ...formData,
      employeeName: selectedEmployee?.name || schedule.employeeName,
      position: selectedEmployee?.position || schedule.position,
      workHours: Math.abs(workHours)
    };

    onUpdate(updatedSchedule);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>스케줄 수정</h2>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>
        <form className={styles.editForm} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>직원 선택</label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                required
              >
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.position})
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>날짜</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>시작 시간</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>종료 시간</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>상태</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="pending">대기</option>
                <option value="confirmed">확정</option>
                <option value="cancelled">취소</option>
              </select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>메모</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose}>취소</button>
            <button type="submit">수정</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 스케줄 상세 모달
function ScheduleDetailModal({ schedule, onClose }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>스케줄 상세 정보</h2>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>
        <div className={styles.scheduleDetail}>
          <div className={styles.detailSection}>
            <h3>기본 정보</h3>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <label>직원명:</label>
                <span>{schedule.employeeName}</span>
              </div>
              <div className={styles.detailItem}>
                <label>직책:</label>
                <span>{schedule.position}</span>
              </div>
              <div className={styles.detailItem}>
                <label>날짜:</label>
                <span>{schedule.date}</span>
              </div>
              <div className={styles.detailItem}>
                <label>시작 시간:</label>
                <span>{schedule.startTime}</span>
              </div>
              <div className={styles.detailItem}>
                <label>종료 시간:</label>
                <span>{schedule.endTime}</span>
              </div>
              <div className={styles.detailItem}>
                <label>근무 시간:</label>
                <span>{schedule.workHours}시간</span>
              </div>
              <div className={styles.detailItem}>
                <label>상태:</label>
                <span>{schedule.status}</span>
              </div>
            </div>
          </div>
          <div className={styles.detailSection}>
            <h3>메모</h3>
            <div className={styles.description}>
              {schedule.notes || '메모가 없습니다.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
