const INVITE_ERROR = 'Unable to send invite. Please try again.';

/**
 * Send a group invite and turn unavailable or malformed responses into readable feedback.
 * @param {string} groupId the sender's group ID
 * @param {string} targetTeamUpId the classmate's TeamUp ID
 * @returns {Promise<object>} the saved invitation response, including any email warning
 */
export async function sendGroupInvite(groupId, targetTeamUpId) {
  let response;
  try {
    response = await fetch('/api/groups/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, targetTeamUpId }),
    });
  } catch {
    throw new Error('Unable to send invite. Check your connection and try again.');
  }

  if (response.status === 401) {
    throw Object.assign(new Error('Your session has expired. Please sign in again.'), { status: 401 });
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(INVITE_ERROR);
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(INVITE_ERROR);
  }

  if (!response.ok || data.ok !== true) {
    const errors = Array.isArray(data.errors) ? data.errors.filter((error) => typeof error === 'string').join(' ') : '';
    const message = response.status >= 500 ? INVITE_ERROR : errors || (typeof data.error === 'string' && data.error) || INVITE_ERROR;
    throw new Error(message);
  }

  return data;
}
