import { beginLogin } from "../auth/session.js";

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
          className="bg-black text-white rounded px-3 py-1"
          onClick={beginLogin}
        >
          Sign in with GitHub
        </button>
      )}
    </div>
  );
}
