// pages/admin/units/manage_teams
// Lists teams within a unit for the administrator to assign groups to

import { Fragment, useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from 'next/head';
import Link from "next/link";
import AdminToast from "../../../components/AdminToast";

const SELECTED_UNIT_KEY = 'teamup.admin.manageGroups.unitId';
const DEFAULT_FILTERS = {status: 'all', size: 'all', page: 1, pageSize: 25};

/**
 * @function ManageTeamsPage
 * Builds the Manage Teams page using react.js
 * @returns Manage Teams page HTML (if loading state = false) || Loading HTML (if loading state = true)
 */
export default function ManageTeamsPage() {

    const router = useRouter();
    const [allUnits, setAllUnits] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [selectedUnitId, setSelectedUnitId] = useState(null);
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [pagination, setPagination] = useState(null);
    const [teamError, setTeamError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const toastTimerRef = useRef(null);

    useEffect(() => () => clearTimeout(toastTimerRef.current), []);

    

}