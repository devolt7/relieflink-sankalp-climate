# SANKALP by Satin Finserv · ReliefLink Climate Edition

ReliefLink is a climate-disaster coordination prototype for **Predict → Prepare → Recover**. It combines district-level flood screening and pre-positioning suggestions, relief-camp coordination, donor support, and a simulated Satin Finserv branch recovery workflow.

## Project layout

- `apps/camp-portal` — camp coordinator portal (React, TypeScript, Vite)
- `apps/relieflink-donor-portal` — donor map, claim flow, and public dashboard (React, Vite)

The Person 3 contribution lives in the donor app: early warning (`/climate`), Satin branch simulation (`/satin`), and impact metrics (`/impact`).

## Prerequisites

- Node.js 20.19+ (or 22.12+) and npm
- A configured Supabase project shared by both portals

## Configure Supabase

Copy each example environment file to `.env` in its app folder and fill in the same Supabase project URL and anon/publishable key:

```sh
cp .env.example apps/camp-portal/.env
cp .env.example apps/relieflink-donor-portal/.env
```

The camp portal also reads `VITE_DONOR_PORTAL_URL`; its example points to the deployed donor app. Override it with `http://localhost:5173` only for local two-app development. Production builds ignore a localhost value and use the deployed donor URL as a safe fallback. The frontend archives do not include Supabase migrations or credentials. The shared database must provide the `camps`, `needs`, and `claims` tables and the `process_claim` RPC used by the donor app. The impact and summary dashboards calculate metrics from camp and need rows; aggregate dashboard views are not required. Configure database permissions and realtime publication for the tables as required by the apps. Do not put a Supabase service-role key in either frontend environment file.

## Climate Edition features

- **Flood early warning:** Open-Meteo forecast and flood endpoints are queried without a browser API key for seven representative districts. The transparent rainfall / relative river-flow score is a planning heuristic, not an official flood warning. The screen uses a last-saved outlook or visibly labeled sample data if the API is unavailable.
- **Pre-positioning:** Suggested water, food, medicine, and shelter supplies change with the selected district's risk tier.
- **Satin branch dashboard:** Branch-area camp view plus fictional borrower records and an explicitly simulated recovery-support review. It does not contact borrowers or change loan accounts.
- **Impact dashboard:** Camp count, needs, fully fulfilled share, average time for fulfilled needs, district coverage, and an explicitly estimated family count. Live Supabase data is used when available; otherwise sample metrics are labeled.

Open-Meteo API references: [weather forecast](https://open-meteo.com/en/docs) and [flood API](https://open-meteo.com/en/docs/flood-api).

Open-Meteo's free API is for non-commercial use and its data requires attribution. This project uses the free endpoint only for an educational prototype; secure the appropriate commercial licence before using it in promotional or production work for a financial institution. See [Open-Meteo's terms](https://open-meteo.com/en/terms).

## Install and run

Install the workspace dependencies from the repository root:

```sh
npm install
```

Run each portal in a separate terminal:

```sh
npm run camp:dev   # camp portal
npm run climate:dev  # unified donor app, http://localhost:3000
```

In the donor app, use **Climate risk**, **Satin branch**, and **Impact** in the navigation to open the Person 3 features.

The camp portal has a demo PIN gate (`1234` by default, configurable with `VITE_COORDINATOR_PIN`). This value is included in the browser bundle, so the gate is only a UI convenience and does not authenticate coordinators or protect database writes. Configure Supabase Row Level Security and a real server-side authentication flow before using this for real operations.

## Production builds

```sh
npm run camp:build
npm run climate:build
```

The climate build bundles the unified donor app, including the embedded camp coordinator screen. The standalone camp portal can also be built separately. Both frontends use the same Supabase project.
