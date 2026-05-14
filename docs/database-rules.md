# Database Rules

## IDs
Use UUID for all primary keys.
@default(cuid()) is acceptable alternative.

## Timestamps
Every table must have:
- createdAt DateTime @default(now())
- updatedAt DateTime @updatedAt

## Soft Delete
Tables that support soft delete must have:
- deletedAt DateTime? (null = active, set = deleted)
- isDeleted Boolean @default(false)

Tables with soft delete:
- User
- Product
- Shop
- Order
- Review

## Enums
Use Prisma enums for all fixed values.
Never store role/status as raw strings.

Current enums:
- Role: CUSTOMER, SELLER, ADMIN
- SellerPlan: FREE, STARTER, PRO
- SubscriptionStatus: ACTIVE, CANCELLED, EXPIRED, PENDING
- VerificationStatus: PENDING, APPROVED, REJECTED
- OrderStatus: PLACED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
- PaymentMethod: COD, ONLINE
- PaymentStatus: PENDING, PAID, FAILED
- ReviewType: PRODUCT, WHOLESALE_SHOP, WHOLESALE_BUYER

## Naming
- Prisma model names: PascalCase (User, OrderItem)
- Database column names: snake_case via @map
- Table names: snake_case via @@map

## Relations
Always define both sides of a relation.
Use explicit foreign key names.

## Indexing
Add @@index on:
- Foreign keys used in frequent queries
- Fields used in search/filter (category, location, status)
- createdAt on feed tables (sort by newest)