// pages/tutor_dash.js
import {useState, useEffect} from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function tutorDashboard() {
    //admin functionality up here
    const router = useRouter();

    const [unit, setUnit] = useState('');
    const [unitEnrolments, setUnitEnrolments] = useState([]);
    const [toast, setToast] = useState(null);

    //Reusable feedback helper for actions on page.
    function showToast(msg, type = 'success') {
        setToast({msg, type});
        setTimeout(() => setToast(null), 4500)
    }
    
    // Gets the enrolments for a specified unit
    async function getEnrolments() {
        //Pass the 'unit' state as a parameter to fetch url
        const res = await fetch(`api/admin/unit-enrolments?unit=${unit}`, {method: 'GET'});
        const data = await res.json();

        //Check if the query was successful, throw an error if not.
        if(res.ok) {
            showToast(`${data.unit} enrolments fetched.`);
            console.log(data)
        }
        else {
            showToast(data.error, 'error');
        }
    }

    //Test function to move to units page
    async function unitsNav() {
        router.push('admin/units');
    }

    //Logout of the admin dashboard and return to login page
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

            {toast && (
                <div className = {`toast toast-${toast.type}`}>
                    {toast.msg}
                </div>
            )}

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
                <button onClick={getEnrolments}>List enrolments in unit</button>
                <button onClick={unitsNav}>Go to units page</button>
            </div>
        </>
    )
}