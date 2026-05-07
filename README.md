# Underground Artwork

Underground Artwork is a database class project for a local artwork marketplace.
The goal is to help nearby buyers discover local sellers, view available artwork,
and coordinate offline meetups without handling online payments.

## Product Direction

The first version should feel like a gallery-map marketplace: artwork first,
location-aware, and built around nearby discovery.

Core experience:

- Browse nearby artwork in a gallery/list view with map or location filtering.
- View listing details with photos, medium, dimensions, price, status, seller,
  neighborhood, and story/context.
- Contact a seller to ask questions or arrange an in-person meetup.
- Save favorite listings for later.
- Mark artwork as `available`, `pending`, or `sold`.

This project should not support online checkout or payment processing. The app
should make it clear that authenticity and purchase details are handled offline.

## V1 Data Concepts

The core database model should cover:

- Users and seller profiles
- Artwork listings
- Listing images
- Categories and tags
- Approximate locations or neighborhoods
- Favorites or saved listings
- Seller messages or contact requests

For privacy, the app should show approximate location details such as
neighborhood, campus area, or distance instead of a seller's exact address.

## UI Theme

Use a clean gallery interface with underground art identity:

- Neutral gallery background with bold accent colors inspired by street posters,
  risograph prints, and local venue flyers.
- Artwork cards that highlight image, price, status, distance, medium, and
  artist handle.
- Detail pages that feel like compact artist profiles.
- Filters for distance, price range, medium, category, availability, and sort
  order such as newest or nearby.

Avoid a generic ecommerce feel. The offline meetup and local artist focus should
be part of the product identity.

## Local Development

Install dependencies and start the frontend:

```bash
npm install
npm run dev
```

Backend API (HTTP server for listings — see [docs/FULL_STACK_PLAN.md](docs/FULL_STACK_PLAN.md)):

```bash
npm run dev:api
```

Defaults: `http://127.0.0.1:3000`, CORS for `http://localhost:5173`. Copy
`.env.example` to `.env` to override the frontend `VITE_API_URL`, and copy
`apps/api/.env.example` to `apps/api/.env` to override API `PORT` or `WEB_ORIGINS`.

Build the app before opening a pull request:

```bash
npm run build
```

## Branch Workflow

`main` is reserved for **solid V1** (stable demo, agreed scope). **Do not merge or
push to `main` until the team declares V1 ready.** Until then, integrate on
`development` only.

`development` is the shared integration branch for day-to-day collaboration.

Team workflow:

1. `git checkout development` and pull latest.
2. Create a **feature branch per piece of work**: `feature/listings`,
   `feature/api-scaffold`, `feature/auth`, etc.
3. Open a pull request from your feature branch **into `development`**.
4. Merge `development` into `main` **only when promoting solid V1**; afterward
   keep using `feature/*` → `development` for later releases.

Recommended repository settings:

- Protect `main` from direct pushes; restrict merges until V1.
- Require pull requests into `development` (and into `main` when V1 gate opens).
- Require at least one review where practical.
- Use squash merges to keep history readable.
- Optionally protect `development` with pull requests while allowing admins to
  recover quickly if needed.
