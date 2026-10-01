import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-body">
      {/* Hero */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70">
              <span className="h-2 w-2 rounded-full bg-action" />
              SANKALP · ReliefLink
            </div>

            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
              Climate resilience,
              <span className="block text-action">connected.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              ReliefLink connects relief camps, donors and SANKALP branches
              through one coordinated platform for disaster preparedness,
              urgent needs and recovery.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/donor"
                className="rounded-lg bg-action px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-action-hover"
              >
                I am a Donor
              </Link>

              <Link
                to="/camp"
                className="rounded-lg border border-white/20 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                I am a Camp
              </Link>

              <a
                href="#sankalp"
                className="rounded-lg border border-white/20 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                I am a SANKALP Branch
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Predict / Prepare / Recover */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-action">
            Climate Edition
          </p>

          <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
            Predict. Prepare. Recover.
          </h2>

          <p className="mt-4 text-body-soft">
            A coordinated workflow that connects early warning, resource
            preparation and on-ground recovery.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-xl border border-line bg-white p-6">
            <div className="text-sm font-semibold text-action">01</div>
            <h3 className="mt-4 font-display text-xl font-semibold text-ink">
              Predict
            </h3>
            <p className="mt-3 text-sm leading-6 text-body-soft">
              Use climate and field information to understand emerging
              risks before they become emergencies.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-white p-6">
            <div className="text-sm font-semibold text-action">02</div>
            <h3 className="mt-4 font-display text-xl font-semibold text-ink">
              Prepare
            </h3>
            <p className="mt-3 text-sm leading-6 text-body-soft">
              Pre-position supplies and connect relief camps with donors
              before critical shortages occur.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-white p-6">
            <div className="text-sm font-semibold text-action">03</div>
            <h3 className="mt-4 font-display text-xl font-semibold text-ink">
              Recover
            </h3>
            <p className="mt-3 text-sm leading-6 text-body-soft">
              Track requirements, pledges and fulfillment so support can
              reach affected communities with visibility.
            </p>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="bg-paper-dim">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-critical">
                The problem
              </p>

              <h2 className="mt-2 font-display text-3xl font-bold text-ink">
                Relief should move as fast as the crisis.
              </h2>
            </div>

            <p className="text-sm leading-7 text-body-soft sm:text-base">
              During disasters, camps may have urgent requirements while
              potential donors lack a clear view of what is needed, where it
              is needed and how much has already been fulfilled. ReliefLink
              creates a shared operational view for those needs.
            </p>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-action">
            Current pilot data
          </p>

          <h2 className="mt-2 font-display text-3xl font-bold text-ink">
            ReliefLink in numbers
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-line bg-white p-5 text-center">
            <div className="font-display text-3xl font-bold text-ink">9</div>
            <div className="mt-1 text-xs text-body-soft">Relief camps</div>
          </div>

          <div className="rounded-xl border border-line bg-white p-5 text-center">
            <div className="font-display text-3xl font-bold text-ink">27</div>
            <div className="mt-1 text-xs text-body-soft">Open requirements</div>
          </div>

          <div className="rounded-xl border border-line bg-white p-5 text-center">
            <div className="font-display text-3xl font-bold text-ink">12</div>
            <div className="mt-1 text-xs text-body-soft">Pledges tracked</div>
          </div>

          <div className="rounded-xl border border-line bg-white p-5 text-center">
            <div className="font-display text-3xl font-bold text-action">
              3
            </div>
            <div className="mt-1 text-xs text-body-soft">Pilot states</div>
          </div>
        </div>
      </section>
      {/* Sivasagar Pilot Story */}
<section className="bg-paper px-5 py-16 sm:px-8">
  <div className="mx-auto max-w-7xl">
    <p className="text-xs font-semibold uppercase tracking-widest text-action">
      Sivasagar pilot
    </p>

    <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
      From warning to recovery.
    </h2>

    <p className="mt-4 max-w-2xl text-body-soft">
      A simulated climate-response workflow showing how ReliefLink connects
      early warning, camp preparation, donor action and recovery.
    </p>

    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-line bg-white p-5">
        <div className="text-xs font-semibold text-action">01 · WARNING</div>
        <h3 className="mt-3 font-display text-xl font-semibold text-ink">
          Risk detected
        </h3>
        <p className="mt-2 text-sm leading-6 text-body-soft">
          Rising flood risk is identified around Sivasagar before critical
          shortages reach relief camps.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-white p-5">
        <div className="text-xs font-semibold text-action">02 · PRE-POSITION</div>
        <h3 className="mt-3 font-display text-xl font-semibold text-ink">
          Camps prepare
        </h3>
        <p className="mt-2 text-sm leading-6 text-body-soft">
          Relief camps post expected requirements so essential supplies can be
          positioned before demand peaks.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-white p-5">
        <div className="text-xs font-semibold text-action">03 · DONORS</div>
        <h3 className="mt-3 font-display text-xl font-semibold text-ink">
          Support connects
        </h3>
        <p className="mt-2 text-sm leading-6 text-body-soft">
          Donors discover verified needs, pledge supplies and track their
          movement from dispatch to delivery.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-white p-5">
        <div className="text-xs font-semibold text-action">04 · RECOVERY</div>
        <h3 className="mt-3 font-display text-xl font-semibold text-ink">
          Needs become visible
        </h3>
        <p className="mt-2 text-sm leading-6 text-body-soft">
          Fulfilled quantities update the shared operational picture so teams
          can focus on remaining gaps.
        </p>
      </div>
    </div>
  </div>
</section>

      {/* SANKALP */}
      <section id="sankalp" className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-5 py-14 text-center sm:px-8">
          <h2 className="font-display text-3xl font-bold">
            One network. One coordinated response.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/60">
            SANKALP branches, relief camps and donors can work from the same
            operational picture during climate emergencies.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-white px-5 py-5 text-center text-xs text-body-soft">
        SANKALP · ReliefLink — Climate Edition
      </footer>
    </div>
  );
}