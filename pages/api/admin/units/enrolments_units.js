//pages/api/admin/units/enrolments_units.js
// GET - list all units
// Separated from enrolments_students for modularity/prevent conflicting GET requests to same api

import { getDb } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/session";

/**
 * @function handler
 * @async
 * This function handles HTTP requests related to units
 * GET - list all units
 * Separated from enrolments_students for modularity/prevent conflicting GET requests to same API
 * @param {*} req the HTTP request used to determine functionality
 * @param {*} res the HTTP response sent back to the calling page/function
 * @returns a response status code and a json object
 */
export default async function handler(req, res) {
    //Check user is logged in as admin
    /**
     * @const admin
     * @const db
     */
    const admin = requireAuth(req, res);
    if(!admin){
        return res.status(401).json({error: "Not logged in."});
    }
    if(!admin.isAdmin) {
        return res.status(403).json({error: "Admin access required"});
    }

    const db = getDb();

    //GET - return all units
    const [units] = await db.query(
        `SELECT * FROM units`
    );
    //Return success response and units object
    return res.status(200).json({units});
}