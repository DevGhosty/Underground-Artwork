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

## Branch Workflow

`main` is the stable branch for demos, submissions, and release-ready work.
`development` is the shared integration branch for day-to-day collaboration.

Team workflow:

1. Start new work from `development`.
2. Create a short-lived feature branch, such as `feature/listings`,
   `feature/auth`, `feature/schema`, or `feature/search-map`.
3. Open a pull request from the feature branch into `development`.
4. Merge `development` into `main` only when the app is stable for a milestone.

Recommended repository settings:

- Protect `main` from direct pushes.
- Require pull requests before merging into `main`.
- Require at least one review before merging into `main`.
- Use squash merges to keep history readable.
- Optionally protect `development` with pull requests while allowing admins to
  recover quickly if needed.
