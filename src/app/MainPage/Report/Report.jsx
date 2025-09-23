import { gql } from '@apollo/client';
import { client } from '../../../configs/client.config';
import { useEffect, useState } from 'react';
import './style.css'
export default function Report() {
    const [report, setReport] = useState({ totalTask: 0, totalInProgress: 0, totalTag: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const GET_REPORT = gql`
        query {
            report {
                totalTask
                totalInProgress
                totalTag
            }
        }
    `;
    useEffect(() => {
        client
            .query({ query: GET_REPORT })
            .then(({ data }) => {
                setReport(data.report);
                setLoading(false);
            })
            .catch((err) => {
                setError(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="report-card">
            <div className="report-header">
                <svg className="report-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2m-6 0h6" /></svg>
                <h2>Report Overview</h2>
            </div>
            {loading && <p className="report-loading">Loading...</p>}
            {error && <p className="report-error">Error: {error.message}</p>}
            <div className="report-grid">
                <div className="report-stat report-tasks">
                    <svg className="report-stat-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m-6-8h6" /></svg>
                    <div className="report-stat-label">Total Tasks</div>
                    <div className="report-stat-value">{report.totalTask}</div>
                </div>
                <div className="report-stat report-inprogress">
                    <svg className="report-stat-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m4 0h-1v4h-1" /></svg>
                    <div className="report-stat-label">In Progress</div>
                    <div className="report-stat-value">{report.totalInProgress}</div>
                </div>
                <div className="report-stat report-tags">
                    <svg className="report-stat-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16h10M7 8h10" /></svg>
                    <div className="report-stat-label">Total Tags</div>
                    <div className="report-stat-value">{report.totalTag}</div>
                </div>
            </div>
        </div>
    );
}