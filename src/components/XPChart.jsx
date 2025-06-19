import '../styles/XPChart.css';

export default function XPChart({ xpData, shortenPath, shortenXP }) {
    // Trier les données par date
    const sortedData = [...xpData].sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
    );

    // Trouver la valeur XP maximale pour l'échelle
    const maxXP = Math.max(...sortedData.map(xp => xp.amount));
    
    // Calculer la largeur de chaque barre
    const barWidth = 100 / sortedData.length;

    return (
        <div className="xp-chart">
            <svg 
                width="100%" 
                height="200" 
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
            >
                {/* Grille horizontale */}
                {[0, 25, 50, 75, 100].map(y => (
                    <line
                        key={y}
                        x1="0"
                        y1={100 - y}
                        x2="100"
                        y2={100 - y}
                        stroke="#ddd"
                        strokeWidth="0.2"
                    />
                ))}

                {/* Barres XP */}
                {sortedData.map((xp, index) => {
                    const height = (xp.amount / maxXP) * 100;
                    const x = index * barWidth;
                    
                    return (
                        <g key={xp.id}>
                            <rect
                                x={x}
                                y={100 - height}
                                width={barWidth - 1}
                                height={height}
                                fill="#4CAF50"
                            >
                                <title>
                                    {new Date(xp.createdAt).toLocaleDateString()}
                                    {'\n'}
                                    {shortenXP(xp.amount)}
                                    {'\n'}
                                    {shortenPath(xp.path)}
                                </title>
                            </rect>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}