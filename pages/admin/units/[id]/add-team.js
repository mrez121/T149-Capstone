// pages/admin/units/[id]/add-team.js
// Add a team to the specified unit

import { useState } from "react";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import Head from "next/head";
import Link from "next/link";
import AdminToast from "../../../../components/AdminToast";

export default function AddTeamPage() {

    const router = useRouter();
    const {id} = router.query;
    const searchParams = useSearchParams();
    const unitCode = searchParams.get('unitCode');

    //Form state
    const [form, setForm] = useState({
        team_id: '',
        name: '',
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState(null);

    function handleChange(e) {
        const {name, value} = e.target;
        setForm(f => ({...f, [name]: value}));
    }

    function showToast(msg, type = 'success') {
        setToast({msg, type});
        setTimeout(() => setToast(null), 4000);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
    }
}