import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import './PolicyPage.css';

const PolicyPage = ({ type, title }) => {
    const { publicSettings } = useContext(AppContext);

    // Helper to format text with line breaks if it's plain text
    const formatContent = (content) => {
        if (!content) return <p className="policy-empty">Policy details have not been updated yet.</p>;
        return content.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                <br />
            </React.Fragment>
        ));
    };

    const content = publicSettings?.policies?.[type];

    return (
        <div className="policy-page">
            <div className="container">
                <div className="policy-header">
                    <h1>{title}</h1>
                    <div className="policy-date">
                        Last Updated: {new Date().toLocaleDateString()}
                    </div>
                </div>

                <div className="policy-content">
                    {formatContent(content)}
                </div>
            </div>
        </div>
    );
};

export default PolicyPage;
