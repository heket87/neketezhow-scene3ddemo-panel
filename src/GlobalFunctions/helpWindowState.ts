// Module-level pub/sub for the help-info overlay.
// All registered panels receive the same hover text — only the panel
// whose canvas the user is currently interacting with will have visible
// content because its elements fire the events.

type HelpCb = (text: string | null) => void;
const callbacks: HelpCb[] = [];

export function registerHelpWindow(cb: HelpCb): () => void {
  callbacks.push(cb);
  return () => {
    const i = callbacks.indexOf(cb);
    if (i > -1) {callbacks.splice(i, 1);}
  };
}

export function showHelpInfo(text: string): void {
  callbacks.forEach(cb => cb(text));
}

export function hideHelpInfo(): void {
  callbacks.forEach(cb => cb(null));
}
