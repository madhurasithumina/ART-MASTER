import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useCart } from "../lib/cart";
import { Logo } from "./Logo";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition ${isActive ? "text-slate-900" : "text-slate-600 hover:text-slate-900"}`;

export function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200">
              <Logo className="h-6 w-6 text-slate-900" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Art Master</div>
              <div className="text-xs text-slate-500">Original drawings & downloads</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            <NavLink to="/gallery" className={navLinkClass}>
              Gallery
            </NavLink>
            <NavLink to="/cart" className={navLinkClass}>
              Cart{count ? ` (${count})` : ""}
            </NavLink>
            {user ? (
              <>
                <NavLink to="/account" className={navLinkClass}>
                  Account
                </NavLink>
                {isAdmin ? (
                  <NavLink to="/admin" className={navLinkClass}>
                    Admin
                  </NavLink>
                ) : null}
                <button
                  onClick={logout}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  Login
                </NavLink>
                <NavLink to="/register" className={navLinkClass}>
                  Register
                </NavLink>
              </>
            )}
          </nav>

          <div className="md:hidden">
            <Link
              to="/cart"
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              Cart{count ? ` (${count})` : ""}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200">
                  <Logo className="h-6 w-6 text-slate-900" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Art Master</div>
                  <div className="text-xs text-slate-500">A simple marketplace for drawn arts.</div>
                </div>
              </div>
              <p className="mt-4 max-w-md text-sm text-slate-600">
                Demo store for selling handmade and ancient-inspired drawings — with accounts, orders, and secure
                digital downloads.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold text-slate-900">Explore</div>
              <div className="grid gap-2 text-sm">
                <Link className="text-slate-600 hover:text-slate-900" to="/gallery">
                  Gallery
                </Link>
                <Link className="text-slate-600 hover:text-slate-900" to="/cart">
                  Cart
                </Link>
                <Link className="text-slate-600 hover:text-slate-900" to="/account">
                  Account
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold text-slate-900">Create</div>
              <div className="grid gap-2 text-sm">
                <Link className="text-slate-600 hover:text-slate-900" to="/admin">
                  Admin
                </Link>
                <Link className="text-slate-600 hover:text-slate-900" to="/register">
                  Register
                </Link>
                <Link className="text-slate-600 hover:text-slate-900" to="/login">
                  Login
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <div>© {new Date().getFullYear()} Art Master</div>
            <div>Tip: Add real images & files from Admin.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
