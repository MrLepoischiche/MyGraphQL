import '../styles/AuditsLists.css';

export default function AuditsLists({ audits, shortenPath }) {
    // Trier les audits par type
    const succeededAudits = audits.filter(audit => audit.closureType === "succeeded");
    const failedAudits = audits.filter(audit => audit.closureType === "failed");
    const pendingAudits = audits.filter(audit => audit.closureType === null);

    const AuditItem = ({ audit }) => (
        <li className="audit-item">
            <span className="audit-path">{shortenPath(audit.group.path)}</span>
            <span className="audit-captain">par {audit.group.captainLogin}</span>
        </li>
    );

    return (
        <div className="audits-lists">
            <div className="audit-section succeeded">
                <h3>Réussis ({succeededAudits.length})</h3>
                <ul>
                    {succeededAudits.map(audit => (
                        <AuditItem key={audit.id} audit={audit} />
                    ))}
                </ul>
            </div>

            <div className="audit-section failed">
                <h3>Échoués ({failedAudits.length})</h3>
                <ul>
                    {failedAudits.map(audit => (
                        <AuditItem key={audit.id} audit={audit} />
                    ))}
                </ul>
            </div>

            <div className="audit-section pending">
                <h3>En cours ({pendingAudits.length})</h3>
                <ul>
                    {pendingAudits.map(audit => (
                        <AuditItem key={audit.id} audit={audit} />
                    ))}
                </ul>
            </div>
        </div>
    );
}