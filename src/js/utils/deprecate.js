/**
 * Usage:
 * Without a conditional, always prints deprecate message:
 *   `deprecate('This is deprecated')`
 *
 * Conditional deprecation, works similarly to `assert`, prints deprecation if
 * conditional is false:
 *   `deprecate('Deprecated only if foo !== bar', foo === bar)`
 */
export default function deprecate(message, conditional=false) {
  if (!conditional) {
    // eslint-disable-next-line no-console
    console.log(`[mobiledoc-kit] [DEPRECATED]: ${message}`);
  }
}
