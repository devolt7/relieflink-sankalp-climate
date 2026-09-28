# ReliefLink — Camp Portal

Camp coordinator portal for the Flood Relief Coordinator hackathon project.
Lets camp coordinators register relief camps and post/update resource needs,
backed by Supabase.

## Run locally

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```
   npm install
   ```
2. Confirm `.env` has your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-key
   ```
3. Run the dev server:
   ```
   npm run dev
   ```
4. Open the printed `localhost` URL, and enter the access PIN (`1234`) to
   enter the Camp Portal.

## Notes

- `quantity_fulfilled` and `status` on a need are backend-controlled — they
  update automatically when a donor claims resources. Don't add UI that
  edits these fields directly.
- `urgency` only accepts: `critical`, `high`, `moderate`.
