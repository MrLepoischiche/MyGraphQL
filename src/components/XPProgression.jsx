import '../styles/XPProgression.css';

export default function XPProgression({ xpData, width, shortenPath, shortenXP }) {
    // Trier les données par date et calculer le cumul
    const sortedData = [...xpData]
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .reduce((acc, curr) => {
            const total = acc.length > 0 
                ? acc[acc.length - 1].total + curr.amount 
                : curr.amount;
            
            acc.push({
                ...curr,
                total
            });
            return acc;
        }, []);

    // Dimensions du SVG
    const svgWidth = width || 400;
    const height = 200;
    const padding = svgWidth * 0.05; // 5% de marge

    // Calculer les valeurs min/max pour l'échelle
    const maxXP = sortedData[sortedData.length - 1]?.total || 0;
    const dates = sortedData.map(d => new Date(d.createdAt));
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];

    // Générer les points du graphique
    const points = sortedData.map((data, i) => {
        const x = ((new Date(data.createdAt) - minDate) / (maxDate - minDate)) * (svgWidth - 2 * padding) + padding;
        const y = height - (data.total / maxXP) * (height - 2 * padding) - padding;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="xp-progression relative w-full">
            {/* Conteneur avec ratio d'aspect */}
            <div className="h-full">
                <svg 
                    className="w-full h-full"
                    viewBox={`0 0 ${svgWidth} ${height}`}
                    height={height}
                    width={svgWidth}
                >
                    {/* Grille de fond avec meilleure visibilité */}
                    {[0, 25, 50, 75, 100].map(y => (
                        <line
                            key={y}
                            x1={padding}
                            y1={height - ((y / 100) * (height - 2 * padding) + padding)}
                            x2={svgWidth - padding}
                            y2={height - ((y / 100) * (height - 2 * padding) + padding)}
                            stroke="#ddd"
                            strokeWidth="0.3"
                            strokeDasharray="1,1"
                        />
                    ))}

                    {/* Ligne de progression avec animation */}
                    <polyline
                        points={points}
                        fill="none"
                        stroke="#4CAF50"
                        strokeWidth="0.8"
                        className="transition-all duration-300"
                    />

                    {/* Points de données avec meilleure interaction */}
                    {sortedData.map((data, index) => (
                        <circle
                            key={index}
                            cx={(new Date(data.createdAt) - minDate) / (maxDate - minDate) * (svgWidth - 2 * padding) + padding}
                            cy={height - (data.total / maxXP) * (height - 2 * padding) - padding}
                            r="2"
                            fill="#4CAF50"
                            className="transition-all duration-200 hover:r-[1.5]"
                        >
                            <title>
                                {shortenPath(data.path)}
                                {'\n'}
                                {new Date(data.createdAt).toLocaleDateString()}
                                {'\n'}
                                Total XP: {shortenXP(data.total)}
                            </title>
                        </circle>
                    ))}
                </svg>
            </div>

            {/* Légende avec meilleur espacement */}
            <div className="mt-4 flex justify-between text-sm text-gray-600 px-2">
                <div className="text-left">
                    <div>{minDate?.toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">Début</div>
                </div>
                <div className="text-center font-semibold">
                    <div>{shortenXP(maxXP)}</div>
                    <div className="text-xs text-gray-500">Total</div>
                </div>
                <div className="text-right">
                    <div>{maxDate?.toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">Fin</div>
                </div>
            </div>
        </div>
    );
}