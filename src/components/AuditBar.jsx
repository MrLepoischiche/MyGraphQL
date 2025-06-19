import '../styles/AuditBar.css';

export default function AuditBar({ totalUp, totalDown, auditRatio, auditCount, shortenXP }) {
    const total = totalUp + totalDown;
    const upPercentage = (totalUp / total) * 100;
    const downPercentage = (totalDown / total) * 100;

    const ratioColor = auditRatio >= 1 ? 'green' : 'red';

    return (
        <div className="audit-bar-container">
            <div className="audit-bar">
                <div 
                    className="up-section"
                    style={{ width: `${upPercentage}%` }}
                >
                    {(shortenXP ? shortenXP(totalUp) : `${totalUp} B`)} {(shortenXP ? `(${totalUp} B)` : '')}
                </div>
                <div 
                    className="down-section"
                    style={{ width: `${downPercentage}%` }}
                >
                    {(shortenXP ? shortenXP(totalDown) : `${totalDown} B`)} {(shortenXP ? `(${totalDown} B)` : '')}
                </div>
            </div>
            <div className="audit-ratio">
                Ratio: <span style={{color: ratioColor, fontSize: "16pt"}}>{auditRatio.toFixed(2)}</span> for {auditCount} audits
            </div>
        </div>
    );
}