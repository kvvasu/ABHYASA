# API Reference

Base URL: `/api`
Content type: `application/json`
Authentication: `Authorization: Bearer <Firebase ID token>` on protected routes.
Errors: `{ "error": { "code": "string", "message": "string" } }`

Status codes: `200` OK, `201` created, `400` bad request, `401` unauthenticated,
`403` forbidden, `404` not found, `409` conflict, `429` rate limited,
`500` internal error, `503` dependency unavailable.

## Public

### GET /api/health

Returns build and dependency status. No secrets.

```json
{ "status": "ok", "version": "0.1.0" }
```

### GET /api/courses

Published courses only. No private fields.

```json
{
  "courses": [
    {
      "id": "servicenow-itsm-fundamentals",
      "slug": "servicenow-itsm-fundamentals",
      "title": "ServiceNow ITSM Fundamentals",
      "summary": "Learn Incident, Problem, and Change Management.",
      "pricePaise": 199900,
      "currency": "INR",
      "level": "beginner",
      "thumbnail": "/images/courses/itsm.webp",
      "lessonCount": 24
    }
  ]
}
```

### GET /api/courses/:courseId

Published course with public lesson metadata. `youtubeVideoId` and `r2Key` are
removed.

```json
{
  "course": {
    "id": "servicenow-itsm-fundamentals",
    "title": "ServiceNow ITSM Fundamentals",
    "pricePaise": 199900,
    "currency": "INR",
    "modules": [{ "id": "m1", "title": "Getting Started", "order": 1 }],
    "lessons": [
      {
        "id": "lesson-01",
        "title": "Course Introduction",
        "moduleId": "m1",
        "order": 1,
        "isFreePreview": true,
        "status": "published"
      }
    ]
  }
}
```

## Authentication-dependent student routes

### GET /api/me

Returns the caller's profile. Creates the user document on first call.

```json
{
  "uid": "firebase-uid",
  "email": "student@example.com",
  "displayName": "Student",
  "role": "student"
}
```

### POST /api/checkout/create

Request:

```json
{ "courseId": "servicenow-itsm-fundamentals" }
```

Behavior:

1. Verify the Firebase ID token.
2. Reject if the course is not published.
3. Reject if an active enrollment exists.
4. Read `pricePaise` from Firestore.
5. Create internal order and Razorpay order.

Response:

```json
{
  "orderId": "internal-order-id",
  "razorpayOrderId": "order_xxx",
  "amountPaise": 199900,
  "currency": "INR",
  "keyId": "rzp_test_xxx",
  "name": "ServiceNow Learn Easy",
  "description": "ServiceNow ITSM Fundamentals"
}
```

The response does not contain a key secret.

### GET /api/payments/:orderId/status

Caller must own the order.

```json
{
  "orderId": "internal-order-id",
  "status": "paid",
  "courseId": "servicenow-itsm-fundamentals",
  "enrollmentStatus": "active",
  "updatedAt": "2026-11-14T00:00:00Z"
}
```

### GET /api/enrollments/me

```json
{
  "enrollments": [
    {
      "courseId": "servicenow-itsm-fundamentals",
      "status": "active",
      "grantedAt": "2026-11-14T00:00:00Z"
    }
  ]
}
```

### GET /api/lessons/:lessonId

Protected lesson data. Requires an active enrollment unless the lesson is a free
preview.

```json
{
  "lesson": {
    "id": "lesson-01",
    "courseId": "servicenow-itsm-fundamentals",
    "title": "Course Introduction",
    "youtubeVideoId": "PRIVATE_ID",
    "durationSeconds": 540,
    "resources": [
      { "id": "r1", "name": "Worksheet", "type": "link", "url": "https://..." }
    ]
  }
}
```

Response headers: `Cache-Control: private, no-store`.

### GET /api/resources/:lessonId/:resourceId

Returns a short-lived signed R2 URL or streams the private file. Requires an
active enrollment. Implement only if paid PDFs are approved in Phase 10.

### GET /api/progress/:courseId

```json
{
  "courseId": "servicenow-itsm-fundamentals",
  "lessons": [
    {
      "lessonId": "lesson-01",
      "completed": true,
      "completedAt": "2026-11-14T00:00:00Z",
      "lastPositionSeconds": 540
    }
  ]
}
```

### PUT /api/progress/:lessonId

Request:

```json
{ "completed": true, "lastPositionSeconds": 540 }
```

Server checks enrollment, lesson publication, and course ownership. Server sets
timestamps. Response is the stored record.

## Instructor routes

All instructor routes require a verified token and `users/{uid}.role` of
`instructor` or `admin`. Instructor routes record an audit log entry.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/instructor/courses` | List all courses, including drafts. |
| POST | `/api/instructor/courses` | Create a course. |
| PATCH | `/api/instructor/courses/:courseId` | Update course fields, modules, or status. |
| GET | `/api/instructor/courses/:courseId/lessons` | List lessons with private fields. |
| POST | `/api/instructor/courses/:courseId/lessons` | Create a lesson. |
| PATCH | `/api/instructor/lessons/:lessonId` | Update title, order, video ID, resources, or status. |
| DELETE | `/api/instructor/lessons/:lessonId` | Soft delete. Set status to `draft`. |
| GET | `/api/instructor/enrollments` | List enrollments, optional course filter. |
| POST | `/api/instructor/enrollments` | Grant access manually. Requires confirmation and audit. |
| PATCH | `/api/instructor/enrollments/:enrollmentId` | Revoke access. |
| GET | `/api/instructor/orders` | List orders and payment states. |
| GET | `/api/instructor/audit-logs` | Recent audit entries. |

Grant request:

```json
{ "uid": "student-uid", "courseId": "servicenow-itsm-fundamentals", "reason": "Support case 123" }
```

Revoke request:

```json
{ "status": "revoked", "reason": "Refund approved" }
```

Instructor responses may include `youtubeVideoId` and `r2Key` because the caller
is authorized. They must never be cached publicly.

## Razorpay webhook

### POST /api/webhooks/razorpay

- Requires `X-Razorpay-Signature` and `X-Razorpay-Event-Id`.
- Verify HMAC-SHA256 over the raw body with `RAZORPAY_WEBHOOK_SECRET`.
- Reject invalid signatures with `400`.
- Process events idempotently by `eventId`.
- Return `200` quickly. Use `waitUntil` for non-critical logging.
- Handled events: `payment.captured`, `payment.failed`, `refund.processed`,
  `payment.dispute.created`.

Verification steps for `payment.captured`:

1. Signature valid.
2. Event ID unseen or already processed.
3. `order_id` matches an internal order.
4. `amount` and `currency` match the internal order.
5. Payment status is `captured`.
6. Order is not already paid.
7. In one transaction: set order `paid`, set enrollment `active`, mark event
   `processed`.

## Decap OAuth

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/auth/github` | Start GitHub OAuth with signed state. |
| GET | `/api/auth/callback` | Exchange code, return token to Decap popup. |

No secret is returned to third-party pages.

## Common failure behavior

| Condition | HTTP | Error code |
|---|---|---|
| Missing or malformed token | 401 | `unauthenticated` |
| Invalid, expired, or wrong-audience token | 401 | `invalid_token` |
| No active enrollment | 403 | `enrollment_required` |
| Lesson or course unpublished | 404 | `not_found` |
| Order belongs to another user | 404 | `not_found` |
| Invalid webhook signature | 400 | `invalid_signature` |
| Duplicate webhook event | 200 | processed as no-op |
| Firestore unavailable | 503 | `dependency_unavailable` |

Do not return a private video ID or private resource key in any error response.
