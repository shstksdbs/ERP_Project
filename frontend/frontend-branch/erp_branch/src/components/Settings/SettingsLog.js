import React, { useEffect, useMemo, useState } from 'react';
import styles from './SettingsLog.module.css';
import searchIcon from '../../assets/search_icon.png';
import downloadIcon from '../../assets/download_icon.png';
import logIcon from '../../assets/log_icon.png';

export default function SettingsLog() {
  const [activeTab, setActiveTab] = useState('activity'); // activity | access | system
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedResult, setSelectedResult] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 샘플 데이터 (본사 ERP 기준 활동/접속/시스템 이벤트 혼합)
  useEffect(() => {
    const sample = [
      {
        id: 1,
        type: 'activity',
        timestamp: '2024-06-01T09:12:11',
        user: 'admin@hq',
        role: '본사관리자',
        branch: 'HQ',
        menu: '상품/메뉴 관리 > 상품등록',
        action: 'CREATE',
        target: '상품 AM001(아메리카노)',
        ip: '10.0.0.10',
        result: 'SUCCESS',
        details: { price: 4500, cost: 1500, category: '음료' }
      },
      {
        id: 2,
        type: 'activity',
        timestamp: '2024-06-01T10:03:41',
        user: 'scm@hq',
        role: '물류',
        branch: 'HQ',
        menu: '발주/물류 관리 > 발주관리',
        action: 'APPROVE',
        target: '발주서 ORD-20240601-001',
        ip: '10.0.0.21',
        result: 'SUCCESS',
        details: { leadTime: 'D+1', items: 12 }
      },
      {
        id: 3,
        type: 'access',
        timestamp: '2024-06-01T10:10:22',
        user: 'branch001',
        role: '지점장',
        branch: '강남1호점',
        menu: '-',
        action: 'LOGIN',
        target: '-',
        ip: '211.201.1.10',
        result: 'FAIL',
        details: { reason: 'Wrong password' }
      },
      {
        id: 4,
        type: 'access',
        timestamp: '2024-06-01T10:12:02',
        user: 'branch001',
        role: '지점장',
        branch: '강남1호점',
        menu: '-',
        action: 'LOGIN',
        target: '-',
        ip: '211.201.1.10',
        result: 'SUCCESS',
        details: { mfa: true }
      },
      {
        id: 5,
        type: 'system',
        timestamp: '2024-06-01T11:05:12',
        user: 'system',
        role: '시스템',
        branch: 'HQ',
        menu: '배치작업',
        action: 'SCHEDULE',
        target: '일일 매출 집계',
        ip: '-',
        result: 'SUCCESS',
        details: { durationMs: 5231, records: 1245 }
      },
      {
        id: 6,
        type: 'activity',
        timestamp: '2024-06-01T12:31:44',
        user: 'finance@hq',
        role: '회계',
        branch: 'HQ',
        menu: '매출/정산 관리 > 가맹점 매출 조회',
        action: 'EXPORT',
        target: 'CSV 내보내기 (기간: 2024-05)',
        ip: '10.0.0.33',
        result: 'SUCCESS',
        details: { rowCount: 3520, file: 'sales_202405.csv' }
      },
      {
        id: 7,
        type: 'activity',
        timestamp: '2024-06-02T09:01:03',
        user: 'admin@hq',
        role: '본사관리자',
        branch: 'HQ',
        menu: '설정 > 권한관리',
        action: 'UPDATE',
        target: '역할 템플릿(지점장) 수정',
        ip: '10.0.0.10',
        result: 'SUCCESS',
        details: { permissionsAdded: ['공지 등록'], permissionsRemoved: ['데이터 백업'] }
      }
    ];
    setLogs(sample);
  }, []);

  const branches = useMemo(() => {
    const set = new Set(['HQ']);
    logs.forEach(l => l.branch && set.add(l.branch));
    return Array.from(set);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const currentType = activeTab; // activity | access | system
    return logs.filter(l => {
      if (l.type !== currentType) return false;
      const matchesKeyword =
        !searchTerm ||
        [l.user, l.menu, l.action, l.target]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesBranch = selectedBranch === 'all' || l.branch === selectedBranch;
      const matchesAction = selectedAction === 'all' || l.action === selectedAction;
      const matchesResult = selectedResult === 'all' || l.result === selectedResult;
      const matchesStart = !startDate || l.timestamp >= `${startDate}T00:00:00`;
      const matchesEnd = !endDate || l.timestamp <= `${endDate}T23:59:59`;
      return matchesKeyword && matchesBranch && matchesAction && matchesResult && matchesStart && matchesEnd;
    });
  }, [logs, activeTab, searchTerm, selectedBranch, selectedAction, selectedResult, startDate, endDate]);

  const total = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  useEffect(() => {
    // 필터 변경 시 1페이지로 이동
    setPage(1);
  }, [activeTab, searchTerm, selectedBranch, selectedAction, selectedResult, startDate, endDate]);

  const exportCSV = () => {
    const header = ['일시', '유형', '사용자', '역할', '지점', '메뉴', '행위', '대상', 'IP', '결과'];
    const rows = filteredLogs.map(l => [
      l.timestamp,
      l.type,
      l.user,
      l.role,
      l.branch,
      l.menu,
      l.action,
      l.target,
      l.ip,
      l.result
    ]);
    const csv = [header, ...rows]
      .map(r => r.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${activeTab}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // BOM(\ufeff) 포함해 엑셀에서 한글이 깨지지 않도록 내보내기
  const exportLogsCSV = () => {
    const header = ['일시', '유형', '사용자', '역할', '지점', '메뉴', '행위', '대상', 'IP', '결과'];
    const rows = filteredLogs.map(l => [
      l.timestamp,
      l.type,
      l.user,
      l.role,
      l.branch,
      l.menu,
      l.action,
      l.target,
      l.ip,
      l.result
    ]);
    const csv = [header, ...rows]
      .map(r => r.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${activeTab}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedBranch('all');
    setSelectedAction('all');
    setSelectedResult('all');
    setStartDate('');
    setEndDate('');
  };

  const actionOptionsByTab = {
    activity: ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'EXPORT'],
    access: ['LOGIN', 'LOGOUT'],
    system: ['SCHEDULE', 'JOB', 'ALERT']
  };

  return (
    <div className={styles['settings-log']}>
      <div className={styles['settings-log-header']}>
        <h1>로그 기록 보기</h1>
        <p>본사 ERP 주요 활동/접속/시스템 로그를 조회하고 CSV로 내보낼 수 있습니다.</p>
      </div>

      <div className={styles['tab-container']}>
        <button
          className={`${styles['tab-button']} ${activeTab === 'activity' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          활동 로그
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'access' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('access')}
        >
          접속 로그
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'system' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('system')}
        >
          시스템 이벤트
        </button>
      </div>

      <div className={styles['search-filter-container']}>
        <div className={styles['search-box']}>
          <div className={styles['search-input-container']}>
            <img src={searchIcon} alt="검색" className={styles['search-icon']} />
            <input
              type="text"
              placeholder="사용자/메뉴/행위/대상 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles['search-input']}
            />
          </div>
        </div>

        <div className={styles['filter-box']}>
          <select
            className={styles['filter-select']}
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="all">전체 지점</option>
            {branches.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className={styles['filter-box']}>
          <select
            className={styles['filter-select']}
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
          >
            <option value="all">전체 행위</option>
            {actionOptionsByTab[activeTab].map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div className={styles['filter-box']}>
          <select
            className={styles['filter-select']}
            value={selectedResult}
            onChange={(e) => setSelectedResult(e.target.value)}
          >
            <option value="all">전체 결과</option>
            <option value="SUCCESS">성공</option>
            <option value="FAIL">실패</option>
          </select>
        </div>

        <div className={styles['filter-box']}>
          <input
            type="date"
            className={styles['date-input']}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className={styles['filter-box']}>
          <input
            type="date"
            className={styles['date-input']}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button className={`btn btn-secondary ${styles['reset-button']}`} onClick={resetFilters}>
          초기화
        </button>

        <button className={`btn btn-primary ${styles['export-button']}`} onClick={exportLogsCSV}>
          <img src={downloadIcon} alt="내보내기" className={styles['button-icon']} />
          CSV 내보내기
        </button>
      </div>

      <div className={styles['summary-cards']}>
        <div className={styles['summary-card']}>
          <div className={styles['summary-icon']}>
            <img src={logIcon} alt="총 로그" />
          </div>
          <div className={styles['summary-content']}>
            <h3>총 로그</h3>
            <div className={styles['summary-number']}>{total}건</div>
          </div>
        </div>
        <div className={styles['summary-card']}>
          <div className={styles['summary-icon']}>
            <img src={logIcon} alt="페이지" />
          </div>
          <div className={styles['summary-content']}>
            <h3>페이지</h3>
            <div className={styles['summary-number']}>{currentPage}/{totalPages}</div>
          </div>
        </div>
      </div>

      <div className={styles['logs-container']}>
        <div className={styles['logs-list']}>
          <table className={styles['logs-table']}>
            <thead className={styles['logs-table-header']}>
              <tr>
                <th>일시</th>
                <th>사용자</th>
                <th>역할</th>
                <th>지점</th>
                <th>메뉴</th>
                <th>행위</th>
                <th>대상</th>
                <th>IP</th>
                <th>결과</th>
                <th>상세</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(row => (
                <tr key={row.id}>
                  <td>{formatDateTime(row.timestamp)}</td>
                  <td>{row.user}</td>
                  <td>{row.role}</td>
                  <td>{row.branch}</td>
                  <td>{row.menu}</td>
                  <td>
                    <span className={`${styles['action-badge']} ${styles[`action-${row.action?.toLowerCase?.()}`]}`}>
                      {row.action}
                    </span>
                  </td>
                  <td className={styles['target-cell']} title={row.target}>{row.target}</td>
                  <td>{row.ip}</td>
                  <td>
                    <span className={`${styles['status-badge']} ${styles[`status-${row.result?.toLowerCase?.()}`]}`}>
                      {row.result === 'SUCCESS' ? '성공' : '실패'}
                    </span>
                  </td>
                  <td>
                    <button className={`btn btn-small ${styles['btn-small']}`} onClick={() => setSelectedLog(row)}>
                      보기
                    </button>
                  </td>
                </tr>
              ))}
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={10} className={styles['no-data']}>조건에 해당하는 로그가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className={styles['pagination']}>
          <div className={styles['pagination-left']}>
            <label>페이지 크기</label>
            <select value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value))}>
              {[10, 20, 50, 100].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className={styles['pagination-right']}>
            <button className={`btn btn-small ${styles['btn-small']}`} disabled={currentPage === 1} onClick={() => setPage(1)}>
              «
            </button>
            <button className={`btn btn-small ${styles['btn-small']}`} disabled={currentPage === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
              이전
            </button>
            <span className={styles['page-indicator']}>{currentPage} / {totalPages}</span>
            <button className={`btn btn-small ${styles['btn-small']}`} disabled={currentPage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
              다음
            </button>
            <button className={`btn btn-small ${styles['btn-small']}`} disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>
              »
            </button>
          </div>
        </div>
      </div>

      {selectedLog && (
        <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />)
      }
    </div>
  );
}

function formatDateTime(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return dt;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function LogDetailModal({ log, onClose }) {
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>로그 상세</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>
        <div className={styles['detail-grid']}>
          <DetailItem label="일시" value={formatDateTime(log.timestamp)} />
          <DetailItem label="유형" value={log.type} />
          <DetailItem label="사용자" value={log.user} />
          <DetailItem label="역할" value={log.role} />
          <DetailItem label="지점" value={log.branch} />
          <DetailItem label="메뉴" value={log.menu} />
          <DetailItem label="행위" value={log.action} />
          <DetailItem label="대상" value={log.target} />
          <DetailItem label="IP" value={log.ip} />
          <DetailItem label="결과" value={log.result === 'SUCCESS' ? '성공' : '실패'} />
        </div>
        <div className={styles['detail-section']}>
          <h3>추가 정보</h3>
          <pre className={styles['json-box']}>
{JSON.stringify(log.details ?? {}, null, 2)}
          </pre>
        </div>
        <div className={styles['modal-actions']}>
          <button type="button" className="btn btn-primary" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className={styles['detail-item']}>
      <label>{label}</label>
      <span>{String(value ?? '-')}</span>
    </div>
  );
}


