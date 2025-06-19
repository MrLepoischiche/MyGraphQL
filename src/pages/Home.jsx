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
        navigate("/auth", { replace: true });
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
                                <p>ID {userData.id} : {userData.firstName} {userData.lastName} ({userData.email})</p>
                                <p>Campus de {Capitalize(userData.campus)}</p>
                            </section>

                            <section className="main-box">
                                <h2>Statistiques</h2>
                                <AuditBar
                                    auditRatio={userData.auditRatio}
                                    auditCount={userData.audits.length}
                                    totalUp={userData.totalUp}
                                    totalDown={userData.totalDown}
                                />
                                <p>XP Totale: {userData.xpTotal.aggregate.sum.amount}</p>
                            </section>

                            <section className="main-box">
                                <h2>Compétences</h2>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <SkillsChart skills={userData.skills} width={550} height={550} />
                                </div>
                                <ul>
                                    {userData.skills.map((skill, index) => (
                                        <li key={index}>
                                            {Capitalize(skill.type.replace('skill_', ''))}: {skill.amount}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section className="main-box">
                                <h2>XP Récente</h2>

                                <div ref={chartContainerRef}>
                                    <XPProgression 
                                        xpData={userData.xp} 
                                        width={XPChartWidth}
                                        shortenPath={ShortenPath}
                                    />
                                </div>

                                <XPChart
                                    xpData={userData.xp}
                                    shortenPath={ShortenPath}
                                />

                                <ul>
                                    {userData.xp.map((xp) => (
                                        <li key={xp.id}>
                                            {new Date(xp.createdAt).toLocaleDateString()} : <strong>{xp.amount} XP</strong> avec <strong>{ShortenPath(xp.path)}</strong>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section className="main-box">
                                <h2>Audits récents</h2>
                                <AuditsLists
                                    audits={userData.audits}
                                    shortenPath={ShortenPath}   
                                />
                            </section>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}