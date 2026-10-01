// lib/email.js
// Email helper using Resend API
// Called whenever the system needs to send a notification email

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an email notification when a student receives a group invite
 * @param {string} toEmail - recipient's email address
 * @param {string} toName - recipient's name
 * @param {string} fromName - name of student who sent the invite
 * @param {string} groupName - name of the group
 */
export async function sendInviteEmail(toEmail, toName, fromName, groupName) {
  try {
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