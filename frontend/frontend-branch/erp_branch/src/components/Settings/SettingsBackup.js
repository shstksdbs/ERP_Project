import React, { useEffect, useMemo, useState } from 'react';
import styles from './SettingsBackup.module.css';
import downloadIcon from '../../assets/download_icon.png';
import rotateIcon from '../../assets/rotate_icon.png';
import historyIcon from '../../assets/history_icon.png';

export default function SettingsBackup() {
  const [activeTab, setActiveTab] = useState('backup'); // backup | restore | policy

  // 백업 목록 (샘플)
  const [backups, setBackups] = useState([]);
  const [filterResult, setFilterResult] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 복원 상태
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [restoreScope, setRestoreScope] = useState('full'); // full | schema | table | branch
  const [restoreTarget, setRestoreTarget] = useState(''); // 스키마/테이블/지점 코드 입력
  const [dryRun, setDryRun] = useState(true);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  // 정책 상태 (샘플)
  const [policy, setPolicy] = useState({
    scheduleEnabled: true,
    frequency: 'daily', // daily | weekly | monthly
    time: '03:00',
    retentionDays: 180,
    destinationType: 's3', // s3 | local
    destinationUrl: 's3://erp-backup/prod/',
    accessKey: '',
    secretKey: '',
    encryption: true,
  });

  // 샘플 데이터 로드
  useEffect(() => {
    const sample = [
      {
        id: 1,
        timestamp: '2024-06-01T03:00:15',
        type: 'FULL',
        sizeMB: 15240,
        checksum: 'sha256:8c1f...a1',
        location: 's3://erp-backup/prod/2024-06-01/full.sql.gz',
        result: 'SUCCESS',
        expiresAt: '2024-11-28',
      },
      {
        id: 2,
        timestamp: '2024-06-02T03:00:10',
        type: 'INCREMENTAL',
        sizeMB: 420,
        checksum: 'sha256:44ab...d2',
        location: 's3://erp-backup/prod/2024-06-02/inc.sql.gz',
        result: 'SUCCESS',
        expiresAt: '2024-11-29',
      },
      {
        id: 3,
        timestamp: '2024-06-03T03:00:21',
        type: 'INCREMENTAL',
        sizeMB: 510,
        checksum: 'sha256:99bb...ef',
        location: 's3://erp-backup/prod/2024-06-03/inc.sql.gz',
        result: 'FAIL',
        expiresAt: '2024-11-30',
      },
    ];
    setBackups(sample);
  }, []);

  // 목록 필터링/페이지네이션
  const filteredBackups = useMemo(() => {
    return backups.filter(b => {
      const matchesSearch = !searchTerm ||
        [b.type, b.location, b.checksum]
          .some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesResult = filterResult === 'all' || b.result === filterResult;
      return matchesSearch && matchesResult;
    });
  }, [backups, searchTerm, filterResult]);

  const total = filteredBackups.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBackups.slice(start, start + pageSize);
  }, [filteredBackups, currentPage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterResult, pageSize]);

  // 동작 핸들러 (mock)
  const runImmediateBackup = (type = 'FULL') => {
    const now = new Date();
    const newItem = {
      id: Date.now(),
      timestamp: now.toISOString(),
      type,
      sizeMB: type === 'FULL' ? 16000 + Math.floor(Math.random() * 500) : 300 + Math.floor(Math.random() * 400),
      checksum: `sha256:${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 10)}`,
      location: `s3://erp-backup/prod/${now.toISOString().slice(0, 10)}/${type.toLowerCase()}.sql.gz`,
      result: 'SUCCESS',
      expiresAt: new Date(now.getTime() + policy.retentionDays * 86400000).toISOString().slice(0, 10),
    };
    setBackups(prev => [newItem, ...prev]);
    alert('즉시 백업이 완료되었습니다 (샘플).');
  };

  const verifyIntegrity = (backup) => {
    alert(`무결성 검증 완료 (샘플):\nID=${backup.id}, 체크섬=${backup.checksum}`);
  };

  const downloadBackup = (backup) => {
    alert(`백업 파일 다운로드 (샘플):\n${backup.location}`);
  };

  const openRestoreConfirm = (backup) => {
    setSelectedBackup(backup);
    setShowRestoreConfirm(true);
  };

  const runRestore = () => {
    setShowRestoreConfirm(false);
    if (!selectedBackup) return;
    const mode = dryRun ? '시뮬레이션' : '실행';
    alert(`복원 ${mode} 완료 (샘플):\n백업=${selectedBackup.location}\n범위=${restoreScope}\n대상=${restoreTarget || '-'}\n`);
    setSelectedBackup(null);
  };

  const savePolicy = (e) => {
    e.preventDefault();
    alert('백업 정책이 저장되었습니다 (샘플).');
  };

  return (
    <div className={styles['settings-backup']}>
      <div className={styles['header']}>
        <h1>데이터 백업/복원</h1>
        <p>ERP 데이터 백업을 관리하고, 필요 시 복원을 수행합니다.</p>
      </div>

      <div className={styles['tab-container']}>
        <button className={`${styles['tab-button']} ${activeTab === 'backup' ? styles['active'] : ''}`} onClick={() => setActiveTab('backup')}>백업</button>
        <button className={`${styles['tab-button']} ${activeTab === 'restore' ? styles['active'] : ''}`} onClick={() => setActiveTab('restore')}>복원</button>
        <button className={`${styles['tab-button']} ${activeTab === 'policy' ? styles['active'] : ''}`} onClick={() => setActiveTab('policy')}>정책 설정</button>
      </div>

      {activeTab === 'backup' && (
        <div className={styles['backup-tab']}>
          <div className={styles['summary-cards']}>
            <div className={styles['summary-card']}>
              <div className={styles['summary-icon']}>
                <img src={historyIcon} alt="총 백업" />
              </div>
              <div className={styles['summary-content']}>
                <h3>총 백업 건수</h3>
                <div className={styles['summary-number']}>{backups.length}건</div>
              </div>
            </div>
            <div className={styles['summary-card']}>
              <div className={styles['summary-icon']}>
                <img src={rotateIcon} alt="정책" />
              </div>
              <div className={styles['summary-content']}>
                <h3>정책</h3>
                <div className={styles['summary-number']}>{policy.scheduleEnabled ? '스케줄 ON' : '스케줄 OFF'}</div>
              </div>
            </div>
          </div>

          <div className={styles['toolbar']}>
            <div className={styles['left']}> 
              <button className={`btn btn-primary ${styles['action-button']}`} onClick={() => runImmediateBackup('FULL')}>즉시 백업(전체)</button>
              <button className={`btn btn-secondary ${styles['action-button']}`} onClick={() => runImmediateBackup('INCREMENTAL')}>즉시 백업(증분)</button>
            </div>
            <div className={styles['right']}>
              <input
                type="text"
                placeholder="위치/체크섬 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles['search-input']}
              />
              <select className={styles['filter-select']} value={filterResult} onChange={(e) => setFilterResult(e.target.value)}>
                <option value="all">전체 결과</option>
                <option value="SUCCESS">성공</option>
                <option value="FAIL">실패</option>
              </select>
            </div>
          </div>

          <div className={styles['table-container']}>
            <table className={styles['table']}>
              <thead className={styles['table-header']}>
                <tr>
                  <th>일시</th>
                  <th>유형</th>
                  <th>크기(MB)</th>
                  <th>체크섬</th>
                  <th>위치</th>
                  <th>보관만료</th>
                  <th>결과</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map(b => (
                  <tr key={b.id}>
                    <td>{formatDateTime(b.timestamp)}</td>
                    <td>{b.type}</td>
                    <td>{formatNumber(b.sizeMB)}</td>
                    <td className={styles['mono']} title={b.checksum}>{b.checksum}</td>
                    <td className={styles['mono']} title={b.location}>{b.location}</td>
                    <td>{b.expiresAt}</td>
                    <td>
                      <span className={`${styles['status-badge']} ${styles[`status-${b.result?.toLowerCase?.()}`]}`}>
                        {b.result === 'SUCCESS' ? '성공' : '실패'}
                      </span>
                    </td>
                    <td>
                      <div className={styles['action-buttons']}>
                        <button className={`btn btn-small ${styles['btn-small']}`} onClick={() => verifyIntegrity(b)}>무결성</button>
                        <button className={`btn btn-small ${styles['btn-small']}`} onClick={() => downloadBackup(b)}>
                          <img src={downloadIcon} alt="다운로드" className={styles['button-icon']} />
                          다운로드
                        </button>
                        <button className={`btn btn-small btn-primary ${styles['btn-small']}`} onClick={() => openRestoreConfirm(b)}>복원</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pageData.length === 0 && (
                  <tr>
                    <td colSpan={8} className={styles['no-data']}>조건에 해당하는 백업이 없습니다.</td>
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
              <span>{currentPage} / {totalPages}</span>
              <button className={`btn btn-small ${styles['btn-small']}`} disabled={currentPage === 1} onClick={() => setPage(1)}>«</button>
              <button className={`btn btn-small ${styles['btn-small']}`} disabled={currentPage === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>이전</button>
              <button className={`btn btn-small ${styles['btn-small']}`} disabled={currentPage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>다음</button>
              <button className={`btn btn-small ${styles['btn-small']}`} disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>»</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'restore' && (
        <div className={styles['restore-tab']}>
          <div className={styles['panel']}>
            <h3>복원 소스 선택</h3>
            <div className={styles['form-row']}>
              <label>백업 선택</label>
              <select value={selectedBackup?.id || ''} onChange={(e) => {
                const id = parseInt(e.target.value);
                const b = backups.find(x => x.id === id) || null;
                setSelectedBackup(b);
              }}>
                <option value="">백업을 선택하세요</option>
                {backups.map(b => (
                  <option key={b.id} value={b.id}>
                    [{b.type}] {formatDateTime(b.timestamp)} ({formatNumber(b.sizeMB)} MB)
                  </option>
                ))}
              </select>
            </div>
            <div className={styles['form-row']}>
              <label>백업 파일 업로드(옵션)</label>
              <input type="file" onChange={() => alert('샘플: 파일 업로드 이벤트')} />
            </div>
          </div>

          <div className={styles['panel']}>
            <h3>복원 범위</h3>
            <div className={styles['form-grid']}>
              <div className={styles['form-group']}>
                <label>범위</label>
                <select value={restoreScope} onChange={(e) => setRestoreScope(e.target.value)}>
                  <option value="full">전체</option>
                  <option value="schema">스키마</option>
                  <option value="table">테이블</option>
                  <option value="branch">지점</option>
                </select>
              </div>
              <div className={styles['form-group']}>
                <label>대상 식별자(옵션)</label>
                <input
                  type="text"
                  placeholder="예) public, sales_order, 강남1호점"
                  value={restoreTarget}
                  onChange={(e) => setRestoreTarget(e.target.value)}
                />
              </div>
              <div className={styles['form-group']}>
                <label>시뮬레이션 모드</label>
                <div className={styles['switch-row']}>
                  <input id="dryRun" type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
                  <label htmlFor="dryRun">적용 없이 검증만 수행</label>
                </div>
              </div>
            </div>
            <div className={styles['warning-box']}>
              복원은 되돌릴 수 없습니다. 영업시간 외 수행 및 사전 샌드박스 검증을 권장합니다.
            </div>
            <div className={styles['actions']}>
              <button className={`btn btn-primary`} disabled={!selectedBackup} onClick={() => setShowRestoreConfirm(true)}>복원 실행</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'policy' && (
        <div className={styles['policy-tab']}>
          <form onSubmit={savePolicy} className={styles['policy-form']}>
            <div className={styles['panel']}>
              <h3>스케줄</h3>
              <div className={styles['form-grid']}>
                <div className={styles['form-group']}>
                  <label>스케줄 사용</label>
                  <input type="checkbox" checked={policy.scheduleEnabled} onChange={(e) => setPolicy(p => ({ ...p, scheduleEnabled: e.target.checked }))} />
                </div>
                <div className={styles['form-group']}>
                  <label>주기</label>
                  <select value={policy.frequency} onChange={(e) => setPolicy(p => ({ ...p, frequency: e.target.value }))}>
                    <option value="daily">매일</option>
                    <option value="weekly">매주</option>
                    <option value="monthly">매월</option>
                  </select>
                </div>
                <div className={styles['form-group']}>
                  <label>시간</label>
                  <input type="time" value={policy.time} onChange={(e) => setPolicy(p => ({ ...p, time: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className={styles['panel']}>
              <h3>보관/대상 저장소</h3>
              <div className={styles['form-grid']}>
                <div className={styles['form-group']}>
                  <label>보관 기간(일)</label>
                  <input type="number" value={policy.retentionDays} onChange={(e) => setPolicy(p => ({ ...p, retentionDays: parseInt(e.target.value || '0') }))} />
                </div>
                <div className={styles['form-group']}>
                  <label>저장소 유형</label>
                  <select value={policy.destinationType} onChange={(e) => setPolicy(p => ({ ...p, destinationType: e.target.value }))}>
                    <option value="s3">S3</option>
                    <option value="local">로컬</option>
                  </select>
                </div>
                <div className={styles['form-group']}>
                  <label>저장소 URL/경로</label>
                  <input type="text" value={policy.destinationUrl} onChange={(e) => setPolicy(p => ({ ...p, destinationUrl: e.target.value }))} placeholder="예) s3://bucket/path" />
                </div>
                <div className={styles['form-group']}>
                  <label>Access Key</label>
                  <input type="password" value={policy.accessKey} onChange={(e) => setPolicy(p => ({ ...p, accessKey: e.target.value }))} />
                </div>
                <div className={styles['form-group']}>
                  <label>Secret Key</label>
                  <input type="password" value={policy.secretKey} onChange={(e) => setPolicy(p => ({ ...p, secretKey: e.target.value }))} />
                </div>
                <div className={styles['form-group']}>
                  <label>암호화</label>
                  <input type="checkbox" checked={policy.encryption} onChange={(e) => setPolicy(p => ({ ...p, encryption: e.target.checked }))} />
                </div>
              </div>
            </div>

            <div className={styles['actions']}>
              <button type="submit" className={`btn btn-primary`}>정책 저장</button>
            </div>
          </form>
        </div>
      )}

      {showRestoreConfirm && selectedBackup && (
        <RestoreConfirmModal
          onClose={() => setShowRestoreConfirm(false)}
          onConfirm={runRestore}
          backup={selectedBackup}
          scope={restoreScope}
          target={restoreTarget}
          dryRun={dryRun}
        />
      )}
    </div>
  );
}

function RestoreConfirmModal({ onClose, onConfirm, backup, scope, target, dryRun }) {
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>복원 확인</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>
        <div className={styles['detail-grid']}>
          <DetailItem label="백업" value={backup.location} />
          <DetailItem label="유형" value={backup.type} />
          <DetailItem label="크기(MB)" value={formatNumber(backup.sizeMB)} />
          <DetailItem label="범위" value={scope} />
          <DetailItem label="대상" value={target || '-'} />
          <DetailItem label="모드" value={dryRun ? '시뮬레이션' : '실행'} />
        </div>
        <div className={styles['warning-box']}>
          이 작업은 되돌릴 수 없습니다. 진행하시겠습니까?
        </div>
        <div className={styles['modal-actions']}>
          <button className={`btn btn-secondary`} onClick={onClose}>취소</button>
          <button className={`btn btn-primary`} onClick={onConfirm}>진행</button>
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

function formatNumber(n) {
  return new Intl.NumberFormat('ko-KR').format(n);
}


