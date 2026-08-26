// pages/tutor_dash.js
import {useState, useEffect} from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

/**
 * @function adminDashboard
 * Builds TeamUp admin dashboard using react.js
 * @returns Admin dashboard hhtml
 */
export default function adminDashboard() {
    //admin functionality up here
    /**
     * @const router
     * @const toast
     */
    const router = useRouter();

    const [toast, setToast] = useState(null);

    /**
     * @function showToast
     * Reusable feedback helper for actions on page.
     * @param {*} msg 
     * @param {*} type 
     */
    function showToast(msg, type = 'success') {
        setToast({msg, type});
        setTimeout(() => setToast(null), 4500)
    }
    
    /**
     * @function handleLogout
     * @async
     * Logout of the admin dashboard and return to login page
     */
    async function handleLogout() {
        await fetch("/api/auth/logout", {method: "POST"});
        router.push("/");
    }

    //HTML page construction here
    return(
        <>
            <Head>
                <title>TeamUp - Admin Dashboard</title>
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

                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Sign out
                </button>
            </nav>

            <div className="container">
                <h1 className="page-title">
                    Admin Dashboard
                </h1>

                <p className="page-subtitle">
                    Manage units, student enrolments, groups and exported data.
                </p>

                <div className="grid">
                    <div className="card">
                        <div className="card-title blue">
                            Unit Management
                        </div>

                        <p className="muted">
                            View existing units, update their constraints or
                            create a new unit.
                        </p>

                        <div
                            className="btn-row"
                            style={{marginTop:20}}
                        >
                            <Link
                                href="/admin/units"
                                className="btn btn-blue"
                                style={{
                                    textDecoration:"none",
                                    display:"inline-block"
                                }}
                            >
                                View Units
                            </Link>

                            <Link
                                href="/admin/units/create"
                                className="btn btn-teal"
                                style={{
                                    textDecoration:"none",
                                    display:"inline-block"
                                }}
                            >
                                Create Unit
                            </Link>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-title teal">
                            Student Enrolments
                        </div>

                        <p className="muted">
                            Add students to a unit and review existing
                            enrolment records.
                        </p>

                        <div
                            className="btn-row"
                            style={{marginTop:20}}
                        >
                            <Link
                                href="/admin/units/enrolments"
                                className="btn btn-blue"
                                style={{
                                    textDecoration:"none",
                                    display:"inline-block"
                                }}
                            >
                                View Enrolments
                            </Link>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-title purple">
                            Group Management
                        </div>

                        <p className="muted">
                            View student groups and manage their members
                            and formation status.
                        </p>

                        <div
                            className="btn-row"
                            style={{marginTop:20}}
                        >
                            <Link
                                href="/admin/units/manage_groups"
                                className="btn btn-blue"
                                style={{
                                    textDecoration:"none",
                                    display:"inline-block"
                                }}
                            >
                                View and manage groups
                            </Link>
                            <button
                                className="btn btn-blue"
                                onClick={() =>
                                    showToast(
                                        "View All Groups is still in development."
                                    )
                                }
                            >
                                View All Groups
                            </button>

                            <button
                                className="btn btn-teal"
                                onClick={() =>
                                    showToast(
                                        "Manage Groups is still in development."
                                    )
                                }
                            >
                                Manage Groups
                            </button>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-title amber">
                            Export CSV
                        </div>

                        <p className="muted">
                            Export unit, student and group information
                            as a CSV file.
                        </p>

                        <div
                            className="btn-row"
                            style={{marginTop:20}}
                        >
                            <button
                                className="btn btn-blue"
                                onClick={() =>
                                    showToast(
                                        "CSV export is still in development."
                                    )
                                }
                            >
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
