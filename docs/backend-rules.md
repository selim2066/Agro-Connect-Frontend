# Backend Rules

## Controller Rules
- Never write business logic in controllers
- Only call service methods
- Only handle req/res/next
- Keep under 20 lines per handler

## Service Rules
- All business logic lives here
- Validate business rules (plan limits, credit balance, etc.)
- Use Prisma transactions for multi-step operations
- Never directly access req or res

## Validation Rules
- Validate all input with Zod
- Validate in routes before controller
- Never trust frontend data
- Strip unknown fields

## Error Handling
- Use centralized error handler (globalErrorHandler middleware)
- Use asyncHandler wrapper for all async controllers
- Create custom AppError class with statusCode + errorCode
- Never expose stack traces in production

## Prisma Rules
- Use transactions for: order creation, credit deduction + connection creation
- Always scope queries by userId or shopId (never fetch all without filter)
- Use select to return only needed fields
- Never return password or sensitive fields

## Redis Rules
- Always set TTL on every cache key
- Invalidate cache on relevant data mutation
- Use try/catch around Redis calls (never crash if Redis is down)
- Cache key format: module:identifier:params_hash

## BullMQ Rules
- Never await job completion in request handlers
- Add jobs and return response immediately
- Always handle job failure gracefully
- Log failed jobs with Winston

## Security Rules
- Rate limit all public routes
- Extra rate limit on AI routes per user per day
- Sanitize file uploads (check MIME type, not just extension)
- Never log passwords, tokens, or payment data
- Use helmet for HTTP headers
- Use cors with explicit origin whitelist

## AI Rules
- Always include language context in system prompt
- Always handle AI API errors gracefully
- Validate AI response before returning to client
- Track AI usage per user per day (enforce plan limits)
- Log all AI calls with Winston (not the response content)