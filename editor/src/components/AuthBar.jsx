import { beginLogin } from "../auth/session.js";
import GitHubIcon from "./GitHubIcon.jsx";

export default function AuthBar({ login, onSignOut }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {login ? (
        <>
          <span className="text-gray-600">Signed in as <strong>{login}</strong></span>
          <button className="underline" onClick={onSignOut}>Sign out</button>
        </>
      ) : (
        <button
          className="flex items-center gap-2 bg-black text-white rounded px-3 py-1"
          onClick={beginLogin}
        >
          <GitHubIcon className="w-4 h-4" />
          Sign in with GitHub
        </button>
      )}
    </div>
  );
}
