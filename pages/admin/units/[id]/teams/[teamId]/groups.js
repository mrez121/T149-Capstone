// pages/admin/units/[id]/teams/[teamId]/groups.js
// Add/remove groups to/from a team.

import { useState } from "react";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import Head from "next/head";
import Link from "next/link";
import AdminToast from "../../../../../../components/AdminToast";

/**
 * @function TeamGroupsPage
 * 
 * @returns
 */
export default function TeamGroupsPage() {
    const router = useRouter();
    const {id, teamId} = router.query;
    const searchParams = useSearchParams();
    const teamName = searchParams.get('name');
    const unitCode = searchParams.get('unitCode');

    const [groups, setGroups] = useState([]);

    async function loadGroupAndUnitData() {
        try {
            const res = await fetch(`/api/admin/units/teams_groups?unit=${id}`, {method: 'GET'});
        } catch {
            
        }
    }
}