/**
 * Turns Supabase auth errors into copy a couple can actually act on.
 * Supabase messages are stable enough to match on, but we keep the fallback.
 */
export function friendlyAuthError(error, isSw = false) {
  const raw = (error?.message || '').toLowerCase();

  if (raw.includes('email not confirmed')) {
    return {
      text: isSw
        ? 'Thibitisha barua pepe yako kwanza — tumekutumia kiungo. Angalia inbox au spam.'
        : 'Confirm your email first — we sent you a link. Check your inbox or spam folder.',
      kind: 'unconfirmed',
    };
  }

  if (raw.includes('invalid login credentials')) {
    return {
      text: isSw ? 'Barua pepe au nenosiri si sahihi.' : 'That email or password is incorrect.',
      kind: 'field',
    };
  }

  if (raw.includes('already registered') || raw.includes('already been registered')) {
    return {
      text: isSw ? 'Barua pepe hii tayari ina akaunti.' : 'That email already has an account.',
      kind: 'exists',
    };
  }

  if (raw.includes('password should be at least')) {
    return {
      text: isSw ? 'Nenosiri lihitaji herufi 6 au zaidi.' : 'Use at least 6 characters for your password.',
      kind: 'field',
    };
  }

  // Supabase refuses to *send mail* when the project mailer quota is exhausted.
  // That is an admin/SMTP problem, not "you clicked too many times".
  const code = (error?.code || error?.error_code || '').toLowerCase();
  if (
    raw.includes('email rate limit') ||
    raw.includes('email sending') ||
    raw.includes('smtp') ||
    code.includes('email_send_rate') ||
    code.includes('over_email_send_rate_limit')
  ) {
    return {
      text: isSw
        ? 'Barua pepe ya kuthibitisha haijatumwa: huduma ya barua pepe ya mradi imefikia kikomo. Msimamizi anahitaji kuweka SMTP, au jaribu tena baadaye.'
        : "We couldn't send the confirmation email: the project's email service is rate-limited. An admin needs to configure SMTP (Authentication → Emails), or you can try again later.",
      kind: 'mailer',
    };
  }

  if (raw.includes('for security purposes') || raw.includes('rate limit') || raw.includes('too many') || code.includes('request_rate')) {
    return {
      text: isSw
        ? 'Umetuma maombi mengi. Subiri sekunde chache kisha jaribu tena.'
        : 'Too many attempts. Wait a few seconds and try again.',
      kind: 'throttled',
    };
  }

  if (raw.includes('invalid email') || raw.includes('unable to validate email')) {
    return {
      text: isSw ? 'Barua pepe hii haionekani sahihi.' : "That email address doesn't look right.",
      kind: 'field',
    };
  }

  return {
    text: error?.message || (isSw ? 'Hitilafu imetokea. Jaribu tena.' : 'Something went wrong. Please try again.'),
    kind: 'generic',
  };
}
