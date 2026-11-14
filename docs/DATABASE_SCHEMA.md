# Database Schema

Database: Cloud Firestore (Native mode).
All timestamps are server timestamps (`request.time` or Admin REST
`setToServerValue`).

## Collection map

```text
users/{uid}
courses/{courseId}
lessons/{lessonId}
enrollments/{uid_courseId}
orders/{orderId}
progress/{uid_courseId_lessonId}
webhookEvents/{razorpayEventId}
auditLogs/{autoId}
```

Document IDs for `enrollments` and `progress` are deterministic. This makes
grants and progress writes idempotent.

## users/{uid}

| Field         | Type           | Notes                                                                |
| ------------- | -------------- | -------------------------------------------------------------------- |
| `uid`         | string         | Must equal document ID.                                              |
| `email`       | string         | From verified token on creation.                                     |
| `displayName` | string         | User editable.                                                       |
| `photoURL`    | string \| null | From Google account.                                                 |
| `role`        | string         | `student`, `instructor`, or `admin`. Default `student`. Server only. |
| `createdAt`   | timestamp      | Server.                                                              |
| `updatedAt`   | timestamp      | Server.                                                              |
| `lastLoginAt` | timestamp      | Server.                                                              |

Rules: user can read own document. User can update `displayName` and `photoURL`
only. User cannot change `role`, `email`, or timestamps.

## courses/{courseId}

| Field         | Type                    | Notes                                        |
| ------------- | ----------------------- | -------------------------------------------- |
| `slug`        | string                  | Unique, URL safe.                            |
| `title`       | string                  | Public.                                      |
| `summary`     | string                  | Public, short.                               |
| `description` | string                  | Public, Markdown.                            |
| `pricePaise`  | integer                 | Authoritative price. INR paise. Server only. |
| `currency`    | string                  | `INR`.                                       |
| `status`      | string                  | `draft` or `published`.                      |
| `level`       | string                  | `beginner`, `intermediate`, `advanced`.      |
| `thumbnail`   | string                  | Public image path or URL.                    |
| `modules`     | array<{id,title,order}> | Embedded module list. Single instructor MVP. |
| `lessonCount` | integer                 | Derived and maintained by API.               |
| `createdAt`   | timestamp               | Server.                                      |
| `updatedAt`   | timestamp               | Server.                                      |

Rules: public read when `status == published` and limited to public fields via
API. Client writes denied. Server API only.

## lessons/{lessonId}

| Field             | Type                              | Notes                                                       |
| ----------------- | --------------------------------- | ----------------------------------------------------------- |
| `courseId`        | string                            | Parent course.                                              |
| `moduleId`        | string                            | Must exist in `courses.modules`.                            |
| `moduleTitle`     | string                            | Denormalized for display.                                   |
| `title`           | string                            | Public.                                                     |
| `slug`            | string                            | Unique within course.                                       |
| `order`           | integer                           | Order inside the course.                                    |
| `youtubeVideoId`  | string                            | Private. Never in public output.                            |
| `durationSeconds` | integer                           | Optional.                                                   |
| `isFreePreview`   | boolean                           | Free lessons skip enrollment check.                         |
| `status`          | string                            | `draft` or `published`.                                     |
| `resources`       | array<{id,name,type,url?,r2Key?}> | `type` is `link` or `pdf`. Paid resources use `r2Key` only. |
| `createdAt`       | timestamp                         | Server.                                                     |
| `updatedAt`       | timestamp                         | Server.                                                     |

Rules: no client read or write. Public lesson metadata is served by API with
`youtubeVideoId` and `r2Key` removed.

## enrollments/{uid_courseId}

Document ID format: `${uid}_${courseId}`.

| Field       | Type              | Notes                               |
| ----------- | ----------------- | ----------------------------------- |
| `uid`       | string            | Student UID.                        |
| `courseId`  | string            | Course ID.                          |
| `status`    | string            | `pending`, `active`, or `revoked`.  |
| `orderId`   | string \| null    | Internal order that granted access. |
| `grantedAt` | timestamp         | Server.                             |
| `grantedBy` | string            | `system:webhook` or instructor UID. |
| `revokedAt` | timestamp \| null | Server.                             |
| `revokedBy` | string \| null    | Instructor UID.                     |
| `updatedAt` | timestamp         | Server.                             |

Rules: student can read own enrollment. Client writes denied. A grant uses a
transaction: set only if the document is absent or already active.

## orders/{orderId}

| Field               | Type              | Notes                                                           |
| ------------------- | ----------------- | --------------------------------------------------------------- |
| `uid`               | string            | Buyer.                                                          |
| `courseId`          | string            | Course.                                                         |
| `amountPaise`       | integer           | Copied from course at creation.                                 |
| `currency`          | string            | `INR`.                                                          |
| `status`            | string            | `created`, `pending`, `paid`, `failed`, `refunded`, `disputed`. |
| `razorpayOrderId`   | string            | Unique. Index this field.                                       |
| `razorpayPaymentId` | string \| null    | Set by webhook.                                                 |
| `razorpaySignature` | string \| null    | Stored for audit only.                                          |
| `receipt`           | string            | Internal receipt, max 40 characters.                            |
| `createdAt`         | timestamp         | Server.                                                         |
| `updatedAt`         | timestamp         | Server.                                                         |
| `paidAt`            | timestamp \| null | Server.                                                         |
| `refundedAt`        | timestamp \| null | Server.                                                         |
| `failureReason`     | string \| null    | Sanitized. Never store raw payment data.                        |

Rules: student can read own order status via API. Client writes denied.

## progress/{uid_courseId_lessonId}

Document ID format: `${uid}_${courseId}_${lessonId}`.

| Field                 | Type              | Notes                           |
| --------------------- | ----------------- | ------------------------------- |
| `uid`                 | string            | Student.                        |
| `courseId`            | string            | Course.                         |
| `lessonId`            | string            | Lesson.                         |
| `completed`           | boolean           | Manual or automatic completion. |
| `completedAt`         | timestamp \| null | Server.                         |
| `lastPositionSeconds` | integer           | Optional resume position.       |
| `updatedAt`           | timestamp         | Server.                         |

Rules: student can read own progress. Writes go through the authenticated API
after an enrollment check. Client writes denied to prevent forged completion and
cross-user writes.

## webhookEvents/{razorpayEventId}

| Field         | Type              | Notes                                              |
| ------------- | ----------------- | -------------------------------------------------- |
| `eventId`     | string            | `X-Razorpay-Event-Id`. Must equal document ID.     |
| `type`        | string            | For example `payment.captured`.                    |
| `payloadHash` | string            | SHA-256 of the raw body.                           |
| `status`      | string            | `processing`, `processed`, `ignored`, or `failed`. |
| `receivedAt`  | timestamp         | Server.                                            |
| `processedAt` | timestamp \| null | Server.                                            |
| `error`       | string \| null    | Sanitized.                                         |

Rules: no client access. Used for idempotency and audit.

## auditLogs/{autoId}

| Field        | Type      | Notes                                      |
| ------------ | --------- | ------------------------------------------ |
| `actorUid`   | string    | Instructor or system identifier.           |
| `actorRole`  | string    | `instructor`, `admin`, or `system`.        |
| `action`     | string    | For example `enrollment.grant`.            |
| `targetType` | string    | `course`, `lesson`, `enrollment`, `order`. |
| `targetId`   | string    | Document ID.                               |
| `metadata`   | map       | Small, sanitized details. No secrets.      |
| `createdAt`  | timestamp | Server.                                    |

Rules: instructor read only. Append only through API.

## Required indexes

| Collection    | Fields                         |
| ------------- | ------------------------------ |
| `courses`     | `status ASC`, `createdAt DESC` |
| `lessons`     | `courseId ASC`, `order ASC`    |
| `enrollments` | `uid ASC`, `status ASC`        |
| `enrollments` | `courseId ASC`, `status ASC`   |
| `orders`      | `razorpayOrderId ASC`          |
| `orders`      | `uid ASC`, `createdAt DESC`    |
| `orders`      | `status ASC`, `createdAt DESC` |
| `progress`    | `uid ASC`, `courseId ASC`      |

## Invariants

1. A course price is read from Firestore at checkout. Never from the browser.
2. An enrollment is created only by a verified webhook or an audited instructor
   action.
3. Order transitions are forward-only: `created -> pending -> paid`, `paid ->
refunded`, `paid -> disputed`. Repeated events do not change a paid order.
4. `youtubeVideoId` is returned only by the protected lesson endpoint.
5. `lastPositionSeconds` is clamped to the lesson duration on the server.
6. No secret, private key, or webhook secret is stored in any collection.
