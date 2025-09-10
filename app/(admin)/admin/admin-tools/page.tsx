"use client";
import { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminTools() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // 권한 검사 - 수퍼관리자와 사이트관리자만 접근 가능
    if (!loading && user?.role !== 'super_admin' && user?.role !== 'site_admin') {
        router.push('/admin/tee-times');
        return null;
    }

    return (
        <div className="admin-tools">
            <div className="admin-tools-header">
                <h1>관리자 도구</h1>
                <p>시스템 관리 및 유지보수를 위한 도구들입니다.</p>
            </div>

            <div className="quotation-container">
                <div className="quotation-header">
                    <div className="quotation-company">
                        <div className="company-name">오분골프</div>
                        <div className="company-desc">해외 골프장 실시간 예약</div>
                    </div>
                    <div className="quotation-title">
                        <h2>견적서</h2>
                    </div>
                </div>

                <div className="quotation-info">
                    <div className="info-row">
                        <div className="info-item">
                            <span className="label">고객명:</span>
                            <span className="value">손성영 님</span>
                        </div>
                        <div className="info-item">
                            <span className="label">여행지:</span>
                            <span className="value">태국/치앙마이</span>
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="info-item">
                            <span className="label">여행기간:</span>
                            <span className="value">2026.01.07 - 01.12</span>
                        </div>
                        <div className="info-item">
                            <span className="label">인원:</span>
                            <span className="value">9명</span>
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="info-item">
                            <span className="label">포함사항:</span>
                            <span className="value">왕복항공료/그린피/캐디피/카트비/숙박(조식)/골프장, 공항송영차량</span>
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="info-item">
                            <span className="label">1인당 요금(KRW):</span>
                            <span className="value amount">₩1,485,556</span>
                        </div>
                    </div>
                </div>

                {/* 골프 일정 */}
                <div className="quotation-section">
                    <h3>골프 (사전결제)</h3>
                    <div className="table-container">
                        <table className="quotation-table">
                            <thead>
                                <tr>
                                    <th>날짜</th>
                                    <th>골프장명</th>
                                    <th>홀수(H)</th>
                                    <th>포함사항</th>
                                    <th>TEE-OFF</th>
                                    <th>합계</th>
                                    <th>사전결제(1인)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1/8</td>
                                    <td>노스힐 골프 클럽 치앙마이</td>
                                    <td>18</td>
                                    <td>그린피/캐디피/카트비</td>
                                    <td>오전</td>
                                    <td>₩1,036,000</td>
                                    <td>₩115,111</td>
                                </tr>
                                <tr>
                                    <td>1/9</td>
                                    <td>가산 파노라마 골프 클럽</td>
                                    <td>18</td>
                                    <td>그린피/캐디피/카트비</td>
                                    <td>오전</td>
                                    <td>₩1,181,000</td>
                                    <td>₩131,222</td>
                                </tr>
                                <tr>
                                    <td>1/10</td>
                                    <td>치앙마이 하이랜드 골프 앤 스파 리조트</td>
                                    <td>18</td>
                                    <td>그린피/캐디피/카트비</td>
                                    <td>오전</td>
                                    <td>₩1,678,000</td>
                                    <td>₩186,444</td>
                                </tr>
                                <tr>
                                    <td>1/11</td>
                                    <td>알파인 골프 리조트 치앙마이</td>
                                    <td>18</td>
                                    <td>그린피/캐디피/카트비</td>
                                    <td>오전</td>
                                    <td>₩2,030,000</td>
                                    <td>₩225,556</td>
                                </tr>
                                <tr>
                                    <td>1/12</td>
                                    <td>메조 골프 클럽</td>
                                    <td>18</td>
                                    <td>그린피/캐디피/카트비</td>
                                    <td>오전</td>
                                    <td>₩1,222,000</td>
                                    <td>₩135,778</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr className="total-row">
                                    <td colSpan={5}>총 합계(KRW)</td>
                                    <td>₩7,147,000</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* 숙박 일정 */}
                <div className="quotation-section">
                    <h3>숙박 (사전결제) 실시간 최저가 기준</h3>
                    <div className="table-container">
                        <table className="quotation-table">
                            <thead>
                                <tr>
                                    <th>날짜</th>
                                    <th>호텔명</th>
                                    <th>박수</th>
                                    <th>객실수</th>
                                    <th>객실타입</th>
                                    <th>식사포함여부</th>
                                    <th>합계</th>
                                    <th>사전결제(1인)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>2026.1.7-1.11</td>
                                    <td>트래블로지 님만</td>
                                    <td>4</td>
                                    <td>9</td>
                                    <td>슈페리어룸</td>
                                    <td>조식</td>
                                    <td>₩4,629,000</td>
                                    <td>₩514,333</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr className="total-row">
                                    <td colSpan={6}>총 합계(KRW)</td>
                                    <td>₩4,629,000</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* 픽업 일정 */}
                <div className="quotation-section">
                    <h3>픽업 (사전결제)</h3>
                    <div className="pickup-info">
                        <div className="pickup-subsection">
                            <h4>픽업 항공 정보</h4>
                        </div>
                        <div className="pickup-subsection">
                            <h4>샌딩 항공 정보</h4>
                        </div>
                        <div className="pickup-subsection">
                            <h4>픽업 숙소명</h4>
                        </div>
                    </div>
                    <div className="table-container">
                        <table className="quotation-table">
                            <thead>
                                <tr>
                                    <th>날짜</th>
                                    <th>행선지</th>
                                    <th>인원</th>
                                    <th>차량수</th>
                                    <th>차종</th>
                                    <th>지역</th>
                                    <th>합계</th>
                                    <th>사전결제(1인)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1/7</td>
                                    <td>공항 &gt; 호텔</td>
                                    <td>9</td>
                                    <td>2</td>
                                    <td>밴</td>
                                    <td>치앙마이</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>1/8</td>
                                    <td>일일렌탈 12시간</td>
                                    <td>9</td>
                                    <td>2</td>
                                    <td>밴</td>
                                    <td>치앙마이</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>1/9</td>
                                    <td>일일렌탈 12시간</td>
                                    <td>9</td>
                                    <td>2</td>
                                    <td>밴</td>
                                    <td>치앙마이</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>1/10</td>
                                    <td>일일렌탈 12시간</td>
                                    <td>9</td>
                                    <td>2</td>
                                    <td>밴</td>
                                    <td>치앙마이</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>1/11</td>
                                    <td>일일렌탈 12시간</td>
                                    <td>9</td>
                                    <td>2</td>
                                    <td>밴</td>
                                    <td>치앙마이</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>1/12</td>
                                    <td>일일렌탈 12시간</td>
                                    <td>9</td>
                                    <td>2</td>
                                    <td>밴</td>
                                    <td>치앙마이</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr className="total-row">
                                    <td colSpan={6}>합계</td>
                                    <td>₩1,594,000</td>
                                    <td>₩177,111</td>
                                </tr>
                                <tr className="total-row">
                                    <td colSpan={6}>총 합계(KRW)</td>
                                    <td>₩1,594,000</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* 항공 일정 */}
                <div className="quotation-section">
                    <h3>항공 (사전결제 수수료포함)</h3>
                    <div className="table-container">
                        <table className="quotation-table">
                            <thead>
                                <tr>
                                    <th>날짜</th>
                                    <th>출발지</th>
                                    <th>항공편명</th>
                                    <th>항공 일정</th>
                                    <th>인원</th>
                                    <th>1인요금</th>
                                    <th>총 합</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1/7</td>
                                    <td>인천</td>
                                    <td>LJ0009</td>
                                    <td>17:10 - 20:45</td>
                                    <td>2</td>
                                    <td>₩1,065,100</td>
                                    <td>₩2,150,200</td>
                                </tr>
                                <tr>
                                    <td>1/11</td>
                                    <td>치앙마이</td>
                                    <td>LJ0010</td>
                                    <td>21:45 - 05:05(+1일)</td>
                                    <td>2</td>
                                    <td>₩1,065,100</td>
                                    <td>₩2,150,200</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 안내사항 */}
                <div className="quotation-section">
                    <h3>안내사항</h3>
                    <ul className="notice-list">
                        <li>일정표의 금액은 요금표에 따라 변경될 수 있습니다.</li>
                        <li>모든 일정에는 차량이 포함되어 있습니다.</li>
                        <li>비로 인한 취소는 당일 현장 폐쇄 시에만 처리됩니다.</li>
                        <li>행사일 20일 전까지 취소/환불이 가능합니다.</li>
                        <li>티타임 확인은 추후 예정입니다. 골프장 사정으로 토너먼트 행사가 있을 경우 자동 취소될 수 있으니 참고해 주세요.</li>
                    </ul>
                </div>

                {/* 불포함사항 */}
                <div className="quotation-section">
                    <h3>불포함사항</h3>
                    <div className="exclusions">
                        <p>없음</p>
                    </div>
                </div>


                {/* 결제 정보 */}
                <div className="payment-section">
                    <div className="payment-total">
                        <div className="total-label">사전결제 총비용(KRW)</div>
                        <div className="total-amount">₩13,370,000</div>
                    </div>
                    <div className="payment-info">
                        <div className="bank-info">
                            <div className="bank-label">입금하실 곳:</div>
                            <div className="bank-details">
                                <div>은행: 우리은행</div>
                                <div>계좌번호: 1005-304-415722</div>
                                <div>예금주: (주)엠오엠트래블</div>
                            </div>
                        </div>
                        <div className="payment-notes">
                            <div>• 현지결제 비용은 실시간 환율에 따라 변동될 수 있습니다.</div>
                            <div>• 픽업 차량 이용 시 실제 거리에 따라 측정되므로 골프장에 따라 변동될 수 있습니다.</div>
                            <div>• 현지결제 비용은 현지에서 결제되는 점 참고해 주세요.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
