# Backend Architecture

## Pattern
Feature-based modular architecture.
Thin controllers. Business logic in services only.

## Each Module Contains
- controller.ts   → handle req/res only
- service.ts      → all business logic
- routes.ts       → route definitions
- validation.ts   → zod schemas
- (optional) queries.ts → complex prisma queries

## Module List
- auth
- user
- seller
- category
- product
- shop (shop feed)
- order
- payment
- credit
- subscription
- connection
- review
- ai
- upload
- notification
- blog
- newsletter
- admin

## API Versioning
All routes prefixed: /api/v1

## Real-time
Socket.io for notifications (order status, connection alerts)

## Background Jobs
BullMQ queues:
- email-queue (order emails, connection alerts, subscription reminders)
- subscription-queue (auto-renewal, expiry checks)

## Caching
Redis via ioredis:
- Product feed cache (5 min)
- Shop feed cache (5 min)
- Category cache (1 hour)
- AI recommendations cache (15 min)
- Single product/shop cache (10 min)

## File Uploads
Cloudinary via multer middleware.
Used by: products, shop profiles, seller verification documents.

## Logging
Winston:
- Combined log file: logs/combined.log
- Error log file: logs/error.log
- Console in development