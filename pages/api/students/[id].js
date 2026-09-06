// pages/api/students/[id].js

import { useRouter } from "next/router";
import { getDb } from "../../../lib/db";
import { requireAuth } from "../../../lib/session";

/**
 * @function handler
 * @async
 * This function handles HTTP requests for editing student profile information.
 * It also handles editing of student availability.
 * @todo PUT - edit student profile and availability information for the specified user.
 * @param {*} req the HTTP request used to determine functionality
 * @param {*} res the HTTP response sent back to the calling page/function
 * @returns a response status code and a json object
 */
export default async function handler(req, res) {
    
    const student = requireAuth(req, res);
    if(!student) {
        return;
    }

    const db = getDb();

    if(req.method === 'PUT') {
        
    }

    return res.status(405).json({error: 'Method not allowed.'});
}