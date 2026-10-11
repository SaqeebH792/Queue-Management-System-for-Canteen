import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, UtensilsCrossed } from "lucide-react";
import { loginSuperAdmin } from "../auth/authApi";
import { loginSuccess } from "../auth/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submit = async e => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const r = await loginSuperAdmin({ email, password });
      dispatch(loginSuccess(r.data));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#0b0f13] text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
        <div className="relative hidden overflow-hidden border-r border-white/6 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-600/15 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                <UtensilsCrossed size={19} />
              </div>
              <div>
                <p className="font-bold">UniBite</p>
                <p className="text-[10px] text-slate-600">University food ordering</p>
              </div>
            </div>
            <div className="mt-28 max-w-lg">
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-blue-400">
                Administration portal
              </p>
              <h1 className="mt-4 text-5xl font-semibold leading-[1.08] tracking-tight">
                Manage the UniBite network from one place.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-6 text-slate-500">
                Review university activation requests, manage administrators, monitor platform
                activity and receive real-time system notifications.
              </p>
            </div>
          </div>
          <p className="relative text-xs text-slate-700">UniBite Super Admin Console</p>
        </div>
        <div className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                <UtensilsCrossed size={19} />
              </div>
              <div>
                <p className="font-bold">UniBite</p>
                <p className="text-[10px] text-slate-600">Super Admin</p>
              </div>
            </div>
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[.12em] text-blue-400">
                Welcome back
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Super Admin Login</h2>
              <p className="mt-2 text-sm text-slate-500">
                Sign in to access the administration console.
              </p>
            </div>
            {error && (
              <div className="mb-5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            )}
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-dark pl-9"
                    placeholder="admin@unibite.com"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">Password</label>
                <div className="relative">
                  <LockKeyhole
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />
                  <input
                    type={show ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-dark pl-9 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300"
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                disabled={loading}
                className="btn-primary mt-2 flex w-full items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in to UniBite"}
              </button>
            </form>
            <p className="mt-8 text-center text-[11px] text-slate-700">
              Authorized Super Admin access only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
