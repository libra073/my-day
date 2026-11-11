/**
 * Shared-element transition store: a vendor card hands its photo's position to
 * the detail page, which flies the image from the card into the hero.
 *
 * The handoff is peeked rather than consumed, because React StrictMode mounts
 * effects twice in development — the second mount still needs the payload.
 * It expires after two seconds and is cleared explicitly once the flight ends.
 */
let pending = null;

export function setSharedTransition(payload) {
  pending = { ...payload, at: Date.now() };
}

export function peekSharedTransition() {
  if (!pending) return null;
  if (Date.now() - pending.at > 2000) {
    pending = null;
    return null;
  }
  return pending;
}

export function clearSharedTransition() {
  pending = null;
}
