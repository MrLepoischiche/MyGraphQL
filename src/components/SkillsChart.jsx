export default function SkillsChart({ skills, width, height }) {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = 180;
    
    // Trouver la valeur maximale pour l'échelle
    const maxValue = Math.max(...skills.map(skill => skill.amount));
    
    // Calculer les points pour chaque compétence
    const getPoints = () => {
        const points = skills.map((skill, index) => {
            const angle = (index * 2 * Math.PI) / skills.length - Math.PI / 2;
            const radius = (skill.amount / maxValue) * maxRadius;
            return {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });
        
        return points.map(point => `${point.x},${point.y}`).join(' ');
    };
    
    // Calculer les axes
    const getAxes = () => {
        return skills.map((skill, index) => {
            const angle = (index * 2 * Math.PI) / skills.length - Math.PI / 2;
            return {
                x1: centerX,
                y1: centerY,
                x2: centerX + maxRadius * Math.cos(angle),
                y2: centerY + maxRadius * Math.sin(angle),
                label: {
                    x: centerX + (maxRadius + 20) * Math.cos(angle),
                    y: centerY + (maxRadius + 20) * Math.sin(angle),
                    text: skill.type.replace('skill_', '')
                }
            };
        });
    };

    return (
        <svg viewBox={`0 0 ${width} ${height}`}  xmlns="http://www.w3.org/2000/svg">
            {/* Cercles concentriques */}
            {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
                <circle
                    key={i}
                    cx={centerX}
                    cy={centerY}
                    r={maxRadius * scale}
                    fill="none"
                    stroke="#ddd"
                    strokeWidth="1"
                />
            ))}
            
            {/* Axes */}
            {getAxes().map((axis, i) => (
                <g key={i}>
                    <line
                        x1={axis.x1}
                        y1={axis.y1}
                        x2={axis.x2}
                        y2={axis.y2}
                        stroke="#999"
                        strokeWidth="1"
                    />
                    <text
                        x={axis.label.x}
                        y={axis.label.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="12"
                    >
                        {axis.label.text}
                    </text>
                </g>
            ))}
            
            {/* Zone des compétences */}
            <polygon
                points={getPoints()}
                fill="rgba(54, 162, 235, 0.2)"
                stroke="rgba(54, 162, 235, 1)"
                strokeWidth="2"
            />
        </svg>
    );
}