// pages/tutor_dash.js
import {useState, useEffect} from "react";
import Router, { useRouter } from "next/router";
import Head from "next/head";

export default function tutorDashboard() {
    //admin functionality up here
    const router = useRouter();

    const [unit, setUnit] = useState('');
    
    async function handleEnrolment() {
        console.log(unit);
        const res = await fetch(`api/admin/unit-enrolments?unit=${unit}`, {method: 'GET'});
        console.log(res);
        const data = await res.json();

        if(res.ok) {
            console.log("Data fetched from unit_enrolments table");
            console.log(JSON.stringify(data.unit), JSON.stringify(data.enrolments));
        }
        else {
            console.log("Data fetch failed")
        }
    }

    async function handleLogout() {
        await fetch("/api/auth/logout", {method: "POST"});
        router.push("/");
    }
    //HTML page construction here
    return(
        <>
            <Head>
                <title>TeamUp - Tutor Dashboard</title>
            </Head>

            <nav>
                <div className="logo">
                    Team<span>Up</span>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    Sign out
                </button>
            </nav>

            <div className="container">
                <h1 className="page-title">Tutor Dashboard</h1>
                <p className="page-subtitle">
                    This is a test page for admin/tutor login.
                </p>
                <button onClick={() => setUnit('IFB398')}>IFB398</button>
                <button onClick={() => setUnit('IFB399')}>IFB399</button>
                <button onClick={handleEnrolment}>List enrolments in unit</button>
            </div>
        </>
    )
}