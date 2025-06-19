import { useState } from 'react';
import '../styles/AuditsLists.css';

export default function AuditsLists({ audits, shortenPath }) {
    // États pour gérer l'expansion des listes
    const [expandSucceeded, setExpandSucceeded] = useState(false);
    const [expandFailed, setExpandFailed] = useState(false);
    const [expandPending, setExpandPending] = useState(false);

    // Trier les audits par type
    const succeededAudits = audits.filter(audit => audit.closureType === "succeeded");
    const failedAudits = audits.filter(audit => audit.closureType === "failed");
    const pendingAudits = audits.filter(audit => audit.closureType === null);

    // Composant pour un élément d'audit
    const AuditItem = ({ audit }) => (
        <li className="audit-item">
            <span className="audit-path">{shortenPath(audit.group.path)}</span>
            <span className="audit-captain">par {audit.group.captainLogin}</span>
        </li>
    );

    // Composant pour une section d'audits
    const AuditSection = ({ title, items, isExpanded, onToggle, colorClass }) => (
        <div className={`audit-section ${colorClass}`}>
            <h3>{title} ({items.length})</h3>
            <ul>
                {(isExpanded ? items : items.slice(0, 10)).map(audit => (
                    <AuditItem key={audit.id} audit={audit} />
                ))}
            </ul>
            {items.length > 10 && (
                <button
                    onClick={onToggle}
                    className="expand-button"
                >
                    {isExpanded ? 'Voir moins' : `Voir ${items.length - 10} de plus`}
                </button>
            )}
        </div>
    );

    return (
        <div className="audits-lists">
            <AuditSection
                title="Réussis"
                items={succeededAudits}
                isExpanded={expandSucceeded}
                onToggle={() => setExpandSucceeded(!expandSucceeded)}
                colorClass="succeeded"
            />

            <AuditSection
                title="Échoués"
                items={failedAudits}
                isExpanded={expandFailed}
                onToggle={() => setExpandFailed(!expandFailed)}
                colorClass="failed"
            />

            <AuditSection
                title="En cours"
                items={pendingAudits}
                isExpanded={expandPending}
                onToggle={() => setExpandPending(!expandPending)}
                colorClass="pending"
            />
        </div>
    );
}