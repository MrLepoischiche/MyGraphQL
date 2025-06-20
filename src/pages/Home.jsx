import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import SkillsChart from '../components/SkillsChart.jsx';
import AuditBar from '../components/AuditBar.jsx';
import XPChart from '../components/XPChart.jsx';
import AuditsLists from '../components/AuditsLists.jsx';
import XPProgression from '../components/XPProgression.jsx';

import "../styles/Home.css";

const QUERY = `{
    user {
        id
        login
        firstName
        lastName
        email
        campus
        auditRatio
        totalUp
        totalDown
        xpTotal: transactions_aggregate(
            order_by: {createdAt: asc}
            where: {type:  {_eq: "xp"}, eventId:{_eq: 303}}){
                aggregate{
                    sum {
                        amount
                    }
                }
                nodes {
                    amount
                    createdAt
                }
        }
        skills: transactions( 
            order_by: {type: asc, amount: desc}
            distinct_on: [type]
            where: {eventId: {_eq: 303}, _and: {type: {_like: "skill%"}}}) {
                type
                amount
        }
        xp: transactions(
            order_by: {createdAt: desc}
            where: {type: {_eq: "xp"}, eventId: {_eq: 303}}) 
            {
                id
                createdAt
                amount
                path
        }
        audits(
                order_by: {createdAt: desc}
                where: {
                _or: [
                    { closureType: { _in: [succeeded, failed] } },
                    { closureType: { _is_null: true }}]}) {
            id
            closureType
            private {
                code
            }
            group{
                status
                captainLogin
                path
            }
        }
    }
}`;

function Capitalize(str) {
    return String(str).charAt(0).toUpperCase() + String(str).slice(1)
}

function ShortenPath(path) {
    if (path === '/rouen/div-01') {
        return "XP donné";
    }

    return String(path).replace(/\/rouen\/div-01\//, '');
}

function ShortenXP(amount) {
    const steps = ['', 'k', 'M', 'G', 'T'];
    let step = 0;

    while (amount >= 1000 && step < steps.length - 1) {
        amount /= 1000;
        step++;
    }
    if (amount < 0.1 && step > 0) {
        amount *= 1000;
        step--;
    }

    return `${(amount % 1 === 0 ? amount : amount.toFixed(2))} ${steps[step]}B`;
}

export default function Home({ user, onUser }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [fetchErr, setFetchErr] = useState(null);

    const [XPChartWidth, setXPChartWidth] = useState(0);
    const chartContainerRef = useRef(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setXPChartWidth(entry.contentRect.width);
            }
        });

        resizeObserver.observe(chartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
        }
    }, []);

    useEffect(() => {
        async function FetchUserData(token) {
            setLoading(true);
            // Fetch API for user data
            try {
                const response = await fetch("https://zone01normandie.org/api/graphql-engine/v1/graphql", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token,
                    },
                    body: JSON.stringify({ query: QUERY }),
                });

                if (!response.ok) {
                    setFetchErr(`HTTP error! status: ${response.status}`);
                    return;
                }

                const data = await response.json();
                if (!data.data) {
                    setFetchErr("Invalid response data.");
                    return;
                }

                setUserData(data.data.user[0]);
                setFetchErr(null);
            } catch (error) {
                setFetchErr(`Error parsing JSON: ${error.message}`);
            } finally {
                setLoading(false);
            }
        }

        FetchUserData(user.token);
    }, []);

    const handleLogout = () => {
        onUser(null);
        localStorage.removeItem("user");
        navigate("/", { replace: true });
    }

    return (
        <section className="overflow-auto w-full">
            <div className="w-full flex flex-row justify-around pt-10 pb-5 text-center">
                <h1 className="text-lg">Welcome, <strong>{user.userLog}</strong> !</h1>
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
            
            {loading ? (
                <span>Loading user data...</span>
            ) : (
                <div>
                    {fetchErr ? (
                        <p className="error">Error fetching your data: {fetchErr}</p>
                    ) : (
                        <div className="user-data">
                            <section className="mt-5 mb-15 text-center text-2xl">
                                <p>ID {userData.id} : <strong>{userData.firstName} {userData.lastName}</strong> ({userData.email})</p>
                                <p>Campus de <strong>{Capitalize(userData.campus)}</strong></p>
                            </section>

                            <section className="main-box">
                                <h2>Statistiques</h2>
                                <AuditBar
                                    auditRatio={userData.auditRatio}
                                    auditCount={userData.audits.length}
                                    totalUp={userData.totalUp}
                                    totalDown={userData.totalDown}
                                    shortenXP={ShortenXP}
                                />
                                <p>XP Totale: {ShortenXP(userData.xpTotal.aggregate.sum.amount)} ({userData.xpTotal.aggregate.sum.amount} B)</p>
                            </section>

                            <section className="main-box">
                                <h2>Audits récents</h2>
                                <AuditsLists
                                    audits={userData.audits}
                                    shortenPath={ShortenPath}   
                                />
                            </section>

                            <section className="main-box">
                                <h2>Graphique de Progression</h2>

                                <div ref={chartContainerRef}>
                                    <XPProgression 
                                        xpData={userData.xp} 
                                        width={XPChartWidth}
                                        shortenPath={ShortenPath}
                                        shortenXP={ShortenXP}
                                    />
                                </div>
                                
                                <br />

                                <h2>XP par Projet Audité</h2>

                                <XPChart
                                    xpData={userData.xp}
                                    shortenPath={ShortenPath}
                                    shortenXP={ShortenXP}
                                />
                            </section>

                            <section className="main-box">
                                <h2>Compétences</h2>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <SkillsChart skills={userData.skills} width={550} height={550} />
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}