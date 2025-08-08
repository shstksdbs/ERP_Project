import React, { useState, useEffect } from 'react';
import styles from './EmployeeList.module.css';
import searchIcon from '../../assets/search_icon.png';
import usercheckIcon from '../../assets/userCheck_icon.png';

export default function EmployeeList({ branchId }) {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // 샘플 데이터
  useEffect(() => {
    const sampleEmployees = [
      {
        id: 1,
        name: '김철수',
        employeeId: 'EMP001',
        position: '매니저',
        phone: '010-1234-5678',
        email: 'kim@example.com',
        hireDate: '2023-01-15',
        status: 'active',
        workHours: 40,
        salary: 3000000
      },
      {
        id: 2,
        name: '이영희',
        employeeId: 'EMP002',
        position: '바리스타',
        phone: '010-2345-6789',
        email: 'lee@example.com',
        hireDate: '2023-03-20',
        status: 'active',
        workHours: 35,
        salary: 2500000
      },
      {
        id: 3,
        name: '박민수',
        employeeId: 'EMP003',
        position: '바리스타',
        phone: '010-3456-7890',
        email: 'park@example.com',
        hireDate: '2023-06-10',
        status: 'active',
        workHours: 30,
        salary: 2200000
      },
      {
        id: 4,
        name: '최지영',
        employeeId: 'EMP004',
        position: '파트타임',
        phone: '010-4567-8901',
        email: 'choi@example.com',
        hireDate: '2023-08-05',
        status: 'inactive',
        workHours: 20,
        salary: 1500000
      }
    ];

    setEmployees(sampleEmployees);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return '재직중';
      case 'inactive':
        return '퇴사';
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return styles.statusActive;
      case 'inactive':
        return styles.statusInactive;
      default:
        return '';
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        employee.phone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || employee.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>직원목록</h1>
        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <img src={searchIcon} alt="검색" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="이름, 직원번호, 전화번호로 검색"
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>
          <select
            value={selectedStatus}
            onChange={handleStatusFilter}
            className={styles.statusFilter}
          >
            <option value="all">전체 상태</option>
            <option value="active">재직중</option>
            <option value="inactive">퇴사</option>
          </select>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>직원번호</th>
                <th>이름</th>
                <th>직급</th>
                <th>연락처</th>
                <th>이메일</th>
                <th>입사일</th>
                <th>상태</th>
                <th>근무시간</th>
                <th>급여</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className={styles.tableRow}>
                  <td className={styles.employeeId}>{employee.employeeId}</td>
                  <td className={styles.employeeName}>{employee.name}</td>
                  <td>
                    <span className={styles.position}>{employee.position}</span>
                  </td>
                  <td>{employee.phone}</td>
                  <td>{employee.email}</td>
                  <td>{employee.hireDate}</td>
                  <td>
                    <span className={`${styles.status} ${getStatusClass(employee.status)}`}>
                      {getStatusText(employee.status)}
                    </span>
                  </td>
                  <td className={styles.workHours}>{employee.workHours}시간</td>
                  <td className={styles.salary}>{formatCurrency(employee.salary)}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
