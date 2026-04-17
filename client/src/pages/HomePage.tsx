import { Link } from "react-router-dom";
import art1 from "../assets/handmade-art-1.svg";
import art2 from "../assets/handmade-art-2.svg";
import art3 from "../assets/handmade-art-3.svg";
import ancient1 from "../assets/ancient-art-1.svg";
import ancient2 from "../assets/ancient-art-2.svg";
import ancient3 from "../assets/ancient-art-3.svg";

export function HomePage() {
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="grid gap-8 p-8 md:grid-cols-2 md:items-center md:p-12">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              Hand-drawn • Ancient-inspired • Digital downloads
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Ancient drawn arts — presented like a modern gallery.
            </h1>
            <p className="text-slate-600">
              Upload drawings, set prices, and sell them online. Buyers can checkout (demo), see order history, and
              download digital files they own.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/gallery"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Browse Gallery
              </Link>
              <Link
                to="/admin"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Go to Admin
              </Link>
            </div>
            <p className="text-xs text-slate-500">
              Tip: register with the admin email (server `ADMIN_EMAIL`) to get admin access.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-violet-200 via-fuchsia-200 to-amber-200 blur-2xl" />
            <div className="relative rounded-3xl border border-slate-200 bg-white p-6">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-7 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <img
                    src={art1}
                    alt="Handmade drawn artwork"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="col-span-5 space-y-4">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <img
                      src={art2}
                      alt="Handmade drawn landscape artwork"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <img
                      src={art3}
                      alt="Handmade drawn portrait artwork"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Featured ancient drawn arts</h2>
            <p className="mt-1 text-sm text-slate-600">Three sample “ancient” sketch cards for your homepage.</p>
          </div>
          <Link
            to="/gallery"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            View all
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="aspect-[4/5] bg-slate-50">
              <img src={ancient1} alt="Ancient seal sketch" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="space-y-1 p-5">
              <div className="text-sm font-semibold">Parchment Seal Study</div>
              <div className="text-sm text-slate-600">Soft paper texture with ink-like linework.</div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="aspect-[4/5] bg-slate-50">
              <img
                src={ancient2}
                alt="Ancient animal sketch"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="space-y-1 p-5">
              <div className="text-sm font-semibold">Tablet Creature Outline</div>
              <div className="text-sm text-slate-600">A carved-story style illustration for listings.</div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="aspect-[4/5] bg-slate-50">
              <img
                src={ancient3}
                alt="Ancient column sketch"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="space-y-1 p-5">
              <div className="text-sm font-semibold">Column Pattern Sheet</div>
              <div className="text-sm text-slate-600">Ornamental strokes with a museum feel.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-sm font-semibold">Gallery</div>
          <div className="mt-2 text-sm text-slate-600">A clean grid view with search and artwork details.</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-sm font-semibold">Checkout (demo)</div>
          <div className="mt-2 text-sm text-slate-600">Creates a paid order and unlocks digital downloads.</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-sm font-semibold">Admin</div>
          <div className="mt-2 text-sm text-slate-600">Upload images/files and manage artwork listings.</div>
        </div>
      </section>
    </div>
  );
}
