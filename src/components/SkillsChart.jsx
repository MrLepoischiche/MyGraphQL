export default function SkillsChart({ skills, width, height }) {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = 180;
    
    // Calculer les points pour chaque compétence
    const getPoints = () => {
        const points = skills.map((skill, index) => {
            const angle = (index * 2 * Math.PI) / skills.length - Math.PI / 2;
            const radius = (skill.amount / 100) * maxRadius;
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
            // Adapter la distance du label en fonction de la longueur du texte
            const labelText = `${skill.type.replace('skill_', '')} ${skill.amount}`;
            const labelDistance = maxRadius + (labelText.length);
            
            return {
                x1: centerX,
                y1: centerY,
                x2: centerX + maxRadius * Math.cos(angle),
                y2: centerY + maxRadius * Math.sin(angle),
                angle: (angle * 180) / Math.PI, // Convertir l'angle en degrés
                label: {
                    x: centerX + labelDistance * Math.cos(angle),
                    y: centerY + labelDistance * Math.sin(angle),
                    text: labelText
                }
            };
        });
    };

    return (
        <svg viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
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
                        fontSize="8"
                        style={{
                            fontFamily: 'Arial, sans-serif',
                            fontWeight: '500'
                        }}
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