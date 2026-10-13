// lib/email.js
// Email helper using Resend API
// Called whenever the system needs to send a notification email

import { Resend } from 'resend';

/**
 * Sends an email notification when a student receives a group invite
 * @param {string} toEmail - recipient's email address
 * @param {string} toName - recipient's name
 * @param {string} fromName - name of student who sent the invite
 * @param {string} groupName - name of the group
 */
export async function sendInviteEmail(toEmail, toName, fromName, groupName) {
  try {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) return { ok: false, error: 'Email notifications are not configured.' };
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from:    'TeamUp <onboarding@resend.dev>',
      to:      toEmail,
      subject: `You have been invited to join a group on TeamUp`,
      html: `
        <div style="font-family:sans-serif; max-width:480px; margin:0 auto; padding:32px;">
          <h2 style="color:#1D6FE8;">TeamUp — Group Invite</h2>
          <p>Hi <strong>${toName}</strong>,</p>
          <p><strong>${fromName}</strong> has invited you to join <strong>${groupName}</strong>.</p>
          <p>Log in to TeamUp to accept or decline your invite.</p>
          <a href="http://localhost:3000"
             style="display:inline-block; margin-top:16px; padding:12px 24px; background:#1D6FE8; color:white; border-radius:8px; text-decoration:none; font-weight:600;">
            View Invite
          </a>
          <p style="margin-top:32px; font-size:12px; color:#8B949E;">
            This is an automated message from TeamUp.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Email send error:', error);
      return { ok: false, error };
    }

    console.log('✓ Invite email sent to:', toEmail);
    return { ok: true, data };

  } catch (err) {
    console.error('Email exception:', err);
    return { ok: false, error: err };
  }
}

/**
 * Sends an email notification to an admin when a group is locked
 * @param {string} toEmail - admin's email address
 * @param {string} toName - admin's name
 * @param {string} groupName - name of the locked group
 * @param {string} groupId - unique group ID
 * @param {string} unitCode - unit code e.g. IFB398
 * @param {string} unitName - unit name
 * @param {string[]} members - list of member names
 * @param {string} sharedSlot - confirmed shared tutorial slot
 */
export async function sendGroupLockedEmail(toEmail, toName, groupName, groupId, unitCode, unitName, members, sharedSlot) {
  try {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) return { ok: false, error: 'Email notifications are not configured.' };
    const resend = new Resend(apiKey);

    const memberList = members.map(m => `<li>${m}</li>`).join('');

    const { data, error } = await resend.emails.send({
      from:    'TeamUp <onboarding@resend.dev>',
      to:      toEmail,
      subject: `Group locked — ${groupName} in ${unitCode}`,
      html: `
        <div style="font-family:sans-serif; max-width:480px; margin:0 auto; padding:32px;">
          <h2 style="color:#1D6FE8;">TeamUp — Group Locked</h2>
          <p>Hi <strong>${toName}</strong>,</p>
          <p>A group has been locked and is ready for review.</p>
          <table style="width:100%; border-collapse:collapse; margin:16px 0;">
            <tr>
              <td style="padding:8px; color:#8B949E; font-size:13px;">Group</td>
              <td style="padding:8px; font-weight:600;">${groupName} (${groupId})</td>
            </tr>
            <tr style="background:#f6f8fa;">
              <td style="padding:8px; color:#8B949E; font-size:13px;">Unit</td>
              <td style="padding:8px; font-weight:600;">${unitCode} — ${unitName}</td>
            </tr>
            <tr>
              <td style="padding:8px; color:#8B949E; font-size:13px;">Shared slot</td>
              <td style="padding:8px; font-weight:600;">${sharedSlot}</td>
            </tr>
            <tr style="background:#f6f8fa;">
              <td style="padding:8px; color:#8B949E; font-size:13px; vertical-align:top;">Members</td>
              <td style="padding:8px;"><ul style="margin:0; padding-left:16px;">${memberList}</ul></td>
            </tr>
          </table>
          <a href="http://localhost:3000/tutor_dash"
             style="display:inline-block; margin-top:16px; padding:12px 24px; background:#1D6FE8; color:white; border-radius:8px; text-decoration:none; font-weight:600;">
            View Dashboard
          </a>
          <p style="margin-top:32px; font-size:12px; color:#8B949E;">
            This is an automated message from TeamUp — QUT IFB398 Capstone.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Admin email send error:', error);
      return { ok: false, error };
    }

    console.log('✓ Admin lock notification sent to:', toEmail);
    return { ok: true, data };

  } catch (err) {
    console.error('Admin email exception:', err);
    return { ok: false, error: err };
  }
}