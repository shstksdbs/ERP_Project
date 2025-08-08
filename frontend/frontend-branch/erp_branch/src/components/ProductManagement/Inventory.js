import React from 'react';
import styles from './Inventory.module.css';

export default function Inventory() {
  return (
    <div className="card inventory-container">
      <h2 className="inventory-header">재고 관리</h2>
      <div className="search-bar">
        <input className="input search-input" placeholder="제품명 검색..." />
        <button className="btn btn-primary">검색</button>
        <button className="btn btn-secondary">필터</button>
      </div>
      
      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>제품명</th>
              <th>재고 수량</th>
              <th>상태</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>제품 A-123</td>
              <td>150</td>
              <td><span className="status-success">충분</span></td>
              <td>
                <button className="btn btn-secondary action-button">수정</button>
              </td>
            </tr>
            <tr>
              <td>제품 B-456</td>
              <td>5</td>
              <td><span className="status-warning">부족</span></td>
              <td>
                <button className="btn btn-secondary action-button">수정</button>
              </td>
            </tr>
            <tr>
              <td>제품 C-789</td>
              <td>0</td>
              <td><span className="status-error">품절</span></td>
              <td>
                <button className="btn btn-secondary action-button">수정</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 