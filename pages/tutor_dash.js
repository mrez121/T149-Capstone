// pages/tutor_dash.js
import {useState, useEffect} from "react";
import Router, { useRouter } from "next/router";
import Head from "next/head";

export default function tutorDashboard() {
    //admin functionality up here
    const router = useRouter();
    
    async function handleLogout(){
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
                <div style={{ marginTop: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a href="/admin/units" style={{ background:'#1D6FE8', color:'white', padding:'10px 18px', borderRadius:'8px', textDecoration:'none', fontSize:'14px', fontWeight:'600' }}>
                    🏫 Manage Units
                </a>
                </div>
            </div>
        </>
    )
}