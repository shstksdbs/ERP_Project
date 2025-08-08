import React, { useState, useEffect } from 'react';
import styles from './EmployeeAttendance.module.css';
import userIcon from '../../assets/user_icon.png';
import clockIcon from '../../assets/clock_icon.png';
import checkIcon from '../../assets/check_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import searchIcon from '../../assets/search_icon.png';

export default function EmployeeAttendance() {
  const [activeTab, setActiveTab] = useState('check-in-out');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [showEditRecordModal, setShowEditRecordModal] = useState(false);
  const [showRecordDetailModal, setShowRecordDetailModal] = useState(false);
  const [loggedInEmployee, setLoggedInEmployee] = useState(null);
  const [loginForm, setLoginForm] = useState({ employeeId: '', password: '' });
  const [todaySchedules, setTodaySchedules] = useState([]);

  // 샘플 데이터
  useEffect(() => {
    const sampleEmployees = [
      { id: 1, name: '김철수', position: '매니저', department: '매장관리', password: '1234' },
      { id: 2, name: '이영희', position: '바리스타', department: '제조', password: '1234' },
      { id: 3, name: '박민수', position: '캐셔', department: '판매', password: '1234' },
      { id: 4, name: '정수진', position: '바리스타', department: '제조', password: '1234' }
    ];

    const sampleAttendanceRecords = [
      {
        id: 1,
        employeeId: 1,
        employeeName: '김철수',
        position: '매니저',
        date: '2024-01-15',
        checkIn: '09:00',
        checkOut: '18:00',
        workHours: 9,
        status: 'present',
        notes: '정상 출근',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: 2,
        employeeId: 2,
        employeeName: '이영희',
        position: '바리스타',
        date: '2024-01-15',
        checkIn: '10:00',
        checkOut: '19:00',
        workHours: 9,
        status: 'present',
        notes: '정상 출근',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: 3,
        employeeId: 3,
        employeeName: '박민수',
        position: '캐셔',
        date: '2024-01-15',
        checkIn: '11:00',
        checkOut: '20:00',
        workHours: 9,
        status: 'late',
        notes: '10분 지각',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: 4,
        employeeId: 4,
        employeeName: '정수진',
        position: '바리스타',
        date: '2024-01-15',
        checkIn: null,
        checkOut: null,
        workHours: 0,
        status: 'absent',
        notes: '결근',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      }
    ];

    // 오늘 날짜의 스케줄 데이터 생성 (EmployeeSchedule.js와 동일한 데이터 사용)
    const today = new Date().toISOString().split('T')[0];
    const sampleTodaySchedules = [
      {
        id: 1,
        employeeId: 1,
        employeeName: '김철수',
        position: '매니저',
        date: today,
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
        date: today,
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
        date: today,
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
        date: today,
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
    setAttendanceRecords(sampleAttendanceRecords);
    setTodaySchedules(sampleTodaySchedules);
  }, []);

  const handleAddRecord = (newRecord) => {
    const recordWithId = {
      ...newRecord,
      id: attendanceRecords.length + 1,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setAttendanceRecords([...attendanceRecords, recordWithId]);
    setShowAddRecordModal(false);
  };

  const handleEditRecord = (updatedRecord) => {
    setAttendanceRecords(attendanceRecords.map(record => 
      record.id === updatedRecord.id 
        ? { ...updatedRecord, updatedAt: new Date().toISOString().split('T')[0] }
        : record
    ));
    setShowEditRecordModal(false);
  };

  const handleDeleteRecord = (recordId) => {
    setAttendanceRecords(attendanceRecords.filter(record => record.id !== recordId));
  };

  const handleRecordClick = (record) => {
    setSelectedRecord(record);
    setShowRecordDetailModal(true);
  };

  const handleEmployeeLogin = (e) => {
    e.preventDefault();
    const employee = employees.find(emp => 
      emp.id.toString() === loginForm.employeeId && emp.password === loginForm.password
    );
    
    if (employee) {
      setLoggedInEmployee(employee);
      setLoginForm({ employeeId: '', password: '' });
    } else {
      alert('직원 ID 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleEmployeeLogout = () => {
    setLoggedInEmployee(null);
  };

  const handleCheckIn = () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    const newRecord = {
      id: attendanceRecords.length + 1,
      employeeId: loggedInEmployee.id,
      employeeName: loggedInEmployee.name,
      position: loggedInEmployee.position,
      date: today,
      checkIn: now,
      checkOut: null,
      workHours: 0,
      status: 'present',
      notes: '출근 체크인',
      createdAt: today,
      updatedAt: today
    };
    
    setAttendanceRecords([...attendanceRecords, newRecord]);
    alert(`${loggedInEmployee.name}님 출근이 기록되었습니다.`);
  };

  const handleCheckOut = () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    const todayRecord = attendanceRecords.find(record => 
      record.employeeId === loggedInEmployee.id && record.date === today
    );
    
    if (todayRecord) {
      const updatedRecords = attendanceRecords.map(record => {
        if (record.id === todayRecord.id) {
          const checkInTime = new Date(`2000-01-01T${record.checkIn}`);
          const checkOutTime = new Date(`2000-01-01T${now}`);
          const workHours = Math.abs(checkOutTime - checkInTime) / (1000 * 60 * 60);
          
          return {
            ...record,
            checkOut: now,
            workHours: Math.round(workHours * 10) / 10,
            updatedAt: today
          };
        }
        return record;
      });
      
      setAttendanceRecords(updatedRecords);
      alert(`${loggedInEmployee.name}님 퇴근이 기록되었습니다.`);
    } else {
      alert('오늘 출근 기록이 없습니다. 먼저 출근을 해주세요.');
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present': return '출근';
      case 'late': return '지각';
      case 'absent': return '결근';
      case 'leave': return '휴가';
      default: return '알 수 없음';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'present': return styles.statusPresent;
      case 'late': return styles.statusLate;
      case 'absent': return styles.statusAbsent;
      case 'leave': return styles.statusLeave;
      default: return '';
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmployee = selectedEmployee === 'all' || record.employeeId.toString() === selectedEmployee;
    const matchesDate = !selectedDate || record.date === selectedDate;
    return matchesSearch && matchesEmployee && matchesDate;
  });

  const totalRecords = attendanceRecords.length;
  const presentRecords = attendanceRecords.filter(r => r.status === 'present').length;
  const lateRecords = attendanceRecords.filter(r => r.status === 'late').length;
  const absentRecords = attendanceRecords.filter(r => r.status === 'absent').length;
  const totalWorkHours = attendanceRecords.reduce((sum, r) => sum + r.workHours, 0);

  // 현재 출근 중인 직원들을 가져오는 함수
  const getCurrentAttendanceRecords = () => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceRecords.filter(record => 
      record.date === today && 
      record.checkIn && 
      !record.checkOut
    );
  };

  // 근무 시간을 계산하는 함수
    const calculateWorkHours = (checkInTime) => {
    if (!checkInTime) return 0;

    const now = new Date();
    const checkIn = new Date(`2000-01-01T${checkInTime}`);
    const currentTime = new Date(`2000-01-01T${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);

    const diffHours = Math.abs(currentTime - checkIn) / (1000 * 60 * 60);
    return Math.round(diffHours * 10) / 10;
  };

  // 스케줄 상태 관련 함수들
  const getScheduleStatusText = (status) => {
    switch (status) {
      case 'confirmed': return '확정';
      case 'pending': return '대기';
      case 'cancelled': return '취소';
      default: return '알 수 없음';
    }
  };

  const getScheduleStatusClass = (status) => {
    switch (status) {
      case 'confirmed': return styles.statusConfirmed;
      case 'pending': return styles.statusPending;
      case 'cancelled': return styles.statusCancelled;
      default: return '';
    }
  };

  return (
    <div className={styles.attendance}>
      <div className={styles.attendanceHeader}>
        <h1>직원 출/퇴근 관리</h1>
        <p>직원들의 출근 기록을 관리하고 모니터링할 수 있습니다.</p>
      </div>

      {/* 탭 컨테이너 */}
      <div className={styles.tabContainer}>
      <button
          className={`${styles.tabButton} ${activeTab === 'check-in-out' ? styles.active : ''}`}
          onClick={() => setActiveTab('check-in-out')}
        >
          출/퇴근
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'attendance-list' ? styles.active : ''}`}
          onClick={() => setActiveTab('attendance-list')}
        >
          출근 기록
        </button>
        
      </div>

      {/* 출근 관리 섹션 */}
      {activeTab === 'attendance-list' && (
        <div className={styles.attendanceManagement}>
          {/* 요약 카드 */}
          <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={userIcon} alt="직원" />
              </div>
              <div className={styles.summaryContent}>
                <h3>총 기록</h3>
                <p>{totalRecords}개</p>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={checkIcon} alt="출근" />
              </div>
              <div className={styles.summaryContent}>
                <h3>정상 출근</h3>
                <p>{presentRecords}명</p>
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
                <img src={userIcon} alt="지각" />
              </div>
              <div className={styles.summaryContent}>
                <h3>지각/결근</h3>
                <p>{lateRecords + absentRecords}명</p>
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
              onClick={() => setShowAddRecordModal(true)}
            >
              <img src={plusIcon} alt="추가" className={styles.buttonIcon} />
              기록 추가
            </button>
          </div>

          {/* 출근 기록 테이블 */}
          <div className={styles.recordsContainer}>
            <div className={styles.recordsList}>
              <table className={styles.recordsTable}>
                <thead className={styles.recordsTableHeader}>
                  <tr>
                    <th>직원명</th>
                    <th>직책</th>
                    <th>날짜</th>
                    <th>출근 시간</th>
                    <th>퇴근 시간</th>
                    <th>근무 시간</th>
                    <th>상태</th>
                    <th>메모</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map(record => (
                    <tr key={record.id} onClick={() => handleRecordClick(record)} className={styles.tableRow}>
                      <td>
                        <div className={styles.employeeInfo}>
                          <div className={styles.employeeName}>{record.employeeName}</div>
                        </div>
                      </td>
                      <td>{record.position}</td>
                      <td>{record.date}</td>
                      <td>{record.checkIn || '-'}</td>
                      <td>{record.checkOut || '-'}</td>
                      <td>{record.workHours}시간</td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusClass(record.status)}`}>
                          {getStatusText(record.status)}
                        </span>
                      </td>
                      <td>{record.notes}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.btnSmall}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecord(record);
                              setShowRecordDetailModal(true);
                            }}
                          >
                            상세
                          </button>
                          <button
                            className={styles.btnSmall}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecord(record);
                              setShowEditRecordModal(true);
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
        </div>
      )}

             {/* 출/퇴근 섹션 */}
       {activeTab === 'check-in-out' && (
         <div className={styles.checkInOutSection}>
           {!loggedInEmployee ? (
                           <div className={styles.loginSection}>
                <div className={styles.loginCard}>
                  <h2>직원 로그인</h2>
                  <p>출/퇴근을 위해 직원 계정으로 로그인해주세요.</p>
                  
                  <form onSubmit={handleEmployeeLogin} className={styles.loginForm}>
                    <div className={styles.formGroup}>
                      <label>직원 선택</label>
                      <select
                        name="employeeId"
                        value={loginForm.employeeId}
                        onChange={(e) => setLoginForm({...loginForm, employeeId: e.target.value})}
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
                      <label>비밀번호</label>
                      <input
                        type="password"
                        name="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                        placeholder="비밀번호를 입력하세요 (1234)"
                        required
                      />
                    </div>
                    
                    <button type="submit" className={styles.loginButton}>
                      로그인
                    </button>
                  </form>
                </div>
                
                <div className={styles.todayScheduleCard}>
                  <h3>오늘 스케줄표</h3>
                  <div className={styles.schedulesContainer}>
                    {todaySchedules.length > 0 ? (
                      <table className={styles.schedulesTable}>
                        <thead className={styles.schedulesTableHeader}>
                          <tr>
                            <th>직원명</th>
                            <th>직책</th>
                            <th>시작 시간</th>
                            <th>종료 시간</th>
                            <th>근무 시간</th>
                            <th>상태</th>
                            
                          </tr>
                        </thead>
                        <tbody>
                          {todaySchedules.map(schedule => (
                            <tr key={schedule.id}>
                              <td>
                                <div className={styles.employeeInfo}>
                                  <span className={styles.employeeName}>{schedule.employeeName}</span>
                                </div>
                              </td>
                              <td>{schedule.position}</td>
                              <td>{schedule.startTime}</td>
                              <td>{schedule.endTime}</td>
                              <td>{schedule.workHours}시간</td>
                              <td>
                                <span className={`${styles.statusBadge} ${getScheduleStatusClass(schedule.status)}`}>
                                  {getScheduleStatusText(schedule.status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className={styles.noSchedule}>오늘 스케줄이 없습니다.</p>
                    )}
                  </div>
                </div>
              </div>
                       ) : (
              <div className={styles.checkInOutSection}>
                <div className={styles.checkInOutCard}>
                  <div className={styles.employeeInfo}>
                    <h2>{loggedInEmployee.name}님</h2>
                    <p>{loggedInEmployee.position} - {loggedInEmployee.department}</p>
                    <p>현재 시간: {new Date().toLocaleString('ko-KR')}</p>
                  </div>
                  
                  <div className={styles.checkInOutButtons}>
                    <button 
                      className={styles.checkInButton}
                      onClick={handleCheckIn}
                    >
                      출근
                    </button>
                    <button 
                      className={styles.checkOutButton}
                      onClick={handleCheckOut}
                    >
                      퇴근
                    </button>
                  </div>
                  
                  <button 
                    className={styles.logoutButton}
                    onClick={handleEmployeeLogout}
                  >
                    로그아웃
                  </button>
                </div>
                
                <div className={styles.todayScheduleCard}>
                  <h3>오늘 스케줄표</h3>
                  <div className={styles.schedulesContainer}>
                    {todaySchedules.length > 0 ? (
                      <table className={styles.schedulesTable}>
                        <thead className={styles.schedulesTableHeader}>
                          <tr>
                            <th>직원명</th>
                            <th>직책</th>
                            <th>시작 시간</th>
                            <th>종료 시간</th>
                            <th>근무 시간</th>
                            <th>상태</th>
                            <th>메모</th>
                          </tr>
                        </thead>
                        <tbody>
                          {todaySchedules.map(schedule => (
                            <tr key={schedule.id}>
                              <td>
                                <div className={styles.employeeInfo}>
                                  <span className={styles.employeeName}>{schedule.employeeName}</span>
                                </div>
                              </td>
                              <td>{schedule.position}</td>
                              <td>{schedule.startTime}</td>
                              <td>{schedule.endTime}</td>
                              <td>{schedule.workHours}시간</td>
                              <td>
                                <span className={`${styles.statusBadge} ${getScheduleStatusClass(schedule.status)}`}>
                                  {getScheduleStatusText(schedule.status)}
                                </span>
                              </td>
                              <td>{schedule.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className={styles.noSchedule}>오늘 스케줄이 없습니다.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
         </div>
       )}

      {/* 모달들 */}
      {showAddRecordModal && (
        <AddRecordModal
          employees={employees}
          onAdd={handleAddRecord}
          onClose={() => setShowAddRecordModal(false)}
        />
      )}

      {showEditRecordModal && selectedRecord && (
        <EditRecordModal
          record={selectedRecord}
          employees={employees}
          onUpdate={handleEditRecord}
          onClose={() => setShowEditRecordModal(false)}
        />
      )}

      {showRecordDetailModal && selectedRecord && (
        <RecordDetailModal
          record={selectedRecord}
          onClose={() => setShowRecordDetailModal(false)}
        />
      )}

      
    </div>
  );
}

// 출근 기록 추가 모달
function AddRecordModal({ employees, onAdd, onClose }) {
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    checkIn: '',
    checkOut: '',
    status: 'present',
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
    const workHours = formData.checkIn && formData.checkOut ? 
      (new Date(`2000-01-01T${formData.checkOut}`) - new Date(`2000-01-01T${formData.checkIn}`)) / (1000 * 60 * 60) : 0;

    const newRecord = {
      ...formData,
      employeeName: selectedEmployee?.name || '',
      position: selectedEmployee?.position || '',
      workHours: Math.abs(workHours)
    };

    onAdd(newRecord);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>출근 기록 추가</h2>
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
              <label>출근 시간</label>
              <input
                type="time"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>퇴근 시간</label>
              <input
                type="time"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleInputChange}
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
                <option value="present">출근</option>
                <option value="late">지각</option>
                <option value="absent">결근</option>
                <option value="leave">휴가</option>
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
            <button type="submit">추가</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 출근 기록 수정 모달
function EditRecordModal({ record, employees, onUpdate, onClose }) {
  const [formData, setFormData] = useState({
    employeeId: record.employeeId.toString(),
    date: record.date,
    checkIn: record.checkIn || '',
    checkOut: record.checkOut || '',
    status: record.status,
    notes: record.notes
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
    const workHours = formData.checkIn && formData.checkOut ? 
      (new Date(`2000-01-01T${formData.checkOut}`) - new Date(`2000-01-01T${formData.checkIn}`)) / (1000 * 60 * 60) : 0;

    const updatedRecord = {
      ...record,
      ...formData,
      employeeName: selectedEmployee?.name || record.employeeName,
      position: selectedEmployee?.position || record.position,
      workHours: Math.abs(workHours)
    };

    onUpdate(updatedRecord);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>출근 기록 수정</h2>
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
              <label>출근 시간</label>
              <input
                type="time"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>퇴근 시간</label>
              <input
                type="time"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleInputChange}
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
                <option value="present">출근</option>
                <option value="late">지각</option>
                <option value="absent">결근</option>
                <option value="leave">휴가</option>
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



// 출근 기록 상세 모달
function RecordDetailModal({ record, onClose }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>출근 기록 상세 정보</h2>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>
        <div className={styles.recordDetail}>
          <div className={styles.detailSection}>
            <h3>기본 정보</h3>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <label>직원명:</label>
                <span>{record.employeeName}</span>
              </div>
              <div className={styles.detailItem}>
                <label>직책:</label>
                <span>{record.position}</span>
              </div>
              <div className={styles.detailItem}>
                <label>날짜:</label>
                <span>{record.date}</span>
              </div>
              <div className={styles.detailItem}>
                <label>출근 시간:</label>
                <span>{record.checkIn || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <label>퇴근 시간:</label>
                <span>{record.checkOut || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <label>근무 시간:</label>
                <span>{record.workHours}시간</span>
              </div>
              <div className={styles.detailItem}>
                <label>상태:</label>
                <span>{record.status}</span>
              </div>
            </div>
          </div>
          <div className={styles.detailSection}>
            <h3>메모</h3>
            <div className={styles.description}>
              {record.notes || '메모가 없습니다.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
