import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SkillsChart from '../components/SkillsChart.jsx';
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
            where: {type: {_eq: "xp"}, eventId: {_eq: 303}}
            limit: 10 ) {
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

export default function Home({ user, onUser }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [fetchErr, setFetchErr] = useState(null);

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
        <section className="overflow-auto">
            <div className="w-full flex flex-row justify-around pt-10 pb-5 text-center">
                <h1 className="text-lg">Welcome, {user.userLog} !</h1>
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
                                <p>Ratio d'audit: {userData.auditRatio}</p>
                                <p>Total Up: {userData.totalUp}</p>
                                <p>Total Down: {userData.totalDown}</p>
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
                                <ul>
                                    {userData.xp.map((xp) => (
                                        <li key={xp.id}>
                                            {new Date(xp.createdAt).toLocaleDateString()} - 
                                            {xp.amount} XP - 
                                            {xp.path}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section className="main-box">
                                <h2>Audits récents</h2>
                                <ul>
                                    {userData.audits.map((audit) => (
                                        <li key={audit.id}>
                                            Status: {audit.closureType || 'En cours'} - 
                                            Projet: {audit.group.path} - 
                                            Capitaine: {audit.group.captainLogin}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}