# SEREIN API contract

Base URL during development: `http://localhost:4000/api/v1`.

Successful responses use `{ "data": ... }`, with optional `meta`. Errors use:

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Check the request fields.",
    "requestId": "request UUID",
    "details": [{ "path": "quantity", "message": "Validation message" }]
  }
}
```

Use `error.code` to select English/Persian frontend messages. Never depend on parsing the English error string. Statuses: `400` invalid input, `401` missing/invalid session, `403` disallowed origin, `404` unknown resource, `409` cart/stock/idempotency conflict, `413` oversized body, `429` rate limit, `500` unexpected failure, `503` database readiness failure. Do not automatically retry validation failures; an order retry must reuse its original idempotency key and request body.

Protected requests require `Authorization: Bearer <token from Clerk getToken()>`. The account ID always comes from that verified token. Cookies and client-provided account IDs are not used.

## Products

`GET /products?locale=en` returns `{data: Product[], meta: {locale, currency}}`. Locale can be `en` or `fa`, default `en`. `GET /products/balancing-toner?locale=fa` returns `{data: Product}`. The `01`–`05` product IDs also work in place of a slug.

Example English product:

```json
{
  "id": "01",
  "slug": "balancing-toner",
  "name": "Balancing Toner",
  "subtitle": "Clarifying Liquid",
  "description": "A refreshing liquid texture for a quiet moment after cleansing.",
  "size": "150 mL",
  "sizeMl": 150,
  "price": 34,
  "priceCents": 3400,
  "currency": "USD",
  "image": "image4.png",
  "hover": "BalancingToner-Image4.png",
  "hoverImage": "BalancingToner-Image4.png",
  "imageUrl": "/images/landing/image4.png",
  "hoverImageUrl": "/images/landing/BalancingToner-Image4.png",
  "inStock": true
}
```

The image URLs are paths on your **frontend** host. Image files stay in the existing frontend `public/images/` directory. The backend does not duplicate or serve those images. All prices are USD in either language; localization changes copy/digits, not currency or price.

## Account

`GET /account` returns the authenticated user's local profile, creating it on first access. Clerk handles sign-up, verified identity and passwords. This endpoint's `id` is the Clerk subject; the other fields are local profile fields.

`PATCH /account` accepts one or more of:

```json
{ "displayName": "Alex Example", "phone": "+90 555 000 0000", "address": "123 Example Street" }
```

Each field can be `null` to clear it. Unknown fields (including `id`, `email`, roles or permissions) are rejected. Updating these local fields does not change the Clerk user's identity.

## Cart

`GET /cart?locale=en` returns:

```json
{
  "data": {
    "items": [{ "product": { "id": "01", "name": "Balancing Toner" }, "quantity": 2, "available": true, "lineTotalCents": 6800 }],
    "itemCount": 2,
    "subtotalCents": 6800,
    "subtotal": 68,
    "currency": "USD"
  }
}
```

The `product` object is the full product response above; this example abbreviates it.

`PUT /cart/items/01` body: `{ "quantity": 2 }`. This **sets** an absolute quantity; retrying it does not add two more. Only integers from 1–20 are accepted. The product must be active with sufficient stock. Do not send a price, amount, account ID or total.

`DELETE /cart/items/01` removes one product. `DELETE /cart` clears this account's cart. Removing an absent product is safe. Cart mutation responses return the updated cart. Adding to cart does not reserve stock; checkout rechecks availability.

The existing guest browser cart can remain in localStorage until sign-in. During frontend integration, fetch the account cart first and deliberately reconcile guest quantities before issuing absolute PUTs. The API does not automatically merge or overwrite a shopper's account cart.

## Demo orders

`POST /orders?locale=en` requires a fresh UUID header for each new checkout attempt:

```text
Idempotency-Key: 6ba7b810-9dad-41d1-80b4-00c04fd430c8
```

Body:

```json
{ "shipping": { "name": "Alex Example", "email": "alex@example.com", "address": "123 Example Street" } }
```

The server reads the authenticated account's cart and calculates its USD total using database prices. Shipping and tax are zero in this portfolio simulation. Quantities, amounts, currency and product lists cannot be supplied in this request.

The first success is `201` with `{data: order, meta: {replayed: false}}`. A retry with the same key and body is `200` with the original order and `replayed: true`, even though the cart was cleared. Reusing that key with different shipping data returns `409 IDEMPOTENCY_CONFLICT`. Keep the same key while retrying a failed connection; generate a new one only when starting a different checkout.

An order contains `id`, `status: "DEMO_CONFIRMED"`, `demo: true`, `currency: "USD"`, `totalCents`, `total`, `createdAt`, `shipping`, and item snapshots (`productId`, localized `name`, `image`, `quantity`, `unitPriceCents`, `lineTotalCents`). Stock deduction, item snapshots, order creation and cart clearing are one transaction. On failure they roll back together.

No payment provider is contacted. This is the persisted equivalent of the existing frontend's demo checkout, not a real payment endpoint. Keep the demo language visible in the account/checkout UI.

`GET /orders?locale=en&page=1&limit=20` returns the current user's orders plus `meta: {page, limit, total}`. Limit is at most 50. `GET /orders/<order UUID>?locale=fa` returns one owned order. Missing orders and other users' orders both return `404`.

## Newsletter

`POST /newsletter` body:

```json
{ "email": "alex@example.com", "locale": "en", "consent": true }
```

Consent must be explicitly `true`. Successful new and duplicate requests both return `202` with the same generic message. The email is normalized to lowercase and stored once with its language and consent timestamp. The endpoint does not send emails or confirm whether an address already subscribed. Add a consent checkbox when connecting the current demo newsletter form.

## Frontend integration checklist

- Set a frontend environment variable for the API base URL when wiring requests.
- Products can replace the local catalog with the same ID/slug/image/price fields.
- Send the current `locale` on catalog, cart and order reads.
- Add Clerk login/account UI and attach fresh session bearer tokens to protected calls.
- Persist guest cart locally, then reconcile it explicitly on sign-in.
- Render totals from API cent values; handle `OUT_OF_STOCK` and `EMPTY_CART` clearly.
- Generate one checkout idempotency UUID per attempt and preserve it for retries.
- Add loading/error states and newsletter consent when wiring those forms.

These frontend integration edits are intentionally outside this backend-only ZIP.