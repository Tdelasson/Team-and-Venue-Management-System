"use client";
import { useState } from "react";
import { handleAuth } from "../../actions/auth";

const roles = ["admin", "træner", "spiller", "spectator"];

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <section className="mx-auto mt-10 max-w-md rounded-box border border-base-300 bg-base-100 p-6 shadow-xl">
      <h1 className="text-2xl font-bold">{isLogin ? "Log ind" : "Opret bruger"}</h1>

      <form action={handleAuth} className="mt-4 flex flex-col gap-4">
        {/* Skjult felt til at fortælle serveren om vi logger ind eller opretter */}
        <input type="hidden" name="isLogin" value={String(isLogin)} />

        <div className="form-control">
          <label className="label">Brugernavn</label>
          <input name="username" type="text" className="input input-bordered" required />
        </div>

        <div className="form-control">
          <label className="label">Adgangskode</label>
          <input name="password" type="password" className="input input-bordered" required />
        </div>

        {!isLogin && (
          <div className="form-control">
            <label className="label">Vælg din rolle</label>
            <select name="role" className="select select-bordered w-full">
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className="btn btn-primary mt-4">
          {isLogin ? "Log ind" : "Registrer"}
        </button>
      </form>

      <button
        onClick={() => setIsLogin(!isLogin)}
        className="link link-hover mt-4 block text-center text-sm"
      >
        {isLogin ? "Mangler du en konto? Opret her" : "Har du allerede en konto? Log ind"}
      </button>
    </section>
  );
}
