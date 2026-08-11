// pages/tutor_dash.js
import {useState, useEffect} from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

export default function adminDashboard() {
    //admin functionality up here
    const router = useRouter();

    const [toast, setToast] = useState(null);

    //Reusable feedback helper for actions on page.
    function showToast(msg, type = 'success') {
        setToast({msg, type});
        setTimeout(() => setToast(null), 4500)
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
                <Link href="/admin/units" className="abtn abtn-blue">View Units</Link>
                <Link href="/admin/units/enrolments" className="abtn abtn-blue">View Enrolments</Link>
            </div>
        </>
    )
}