# API Conventions

## Base URL
/api/v1

## Success Response
{
  "success": true,
  "message": "Products fetched successfully",
  "data": {}
}

## Paginated Success Response
{
  "success": true,
  "message": "Products fetched successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 248,
    "totalPages": 21
  }
}

## Error Response
{
  "success": false,
  "message": "You do not have enough credits",
  "errorCode": "INSUFFICIENT_CREDITS"
}

## Error Codes
AUTH_REQUIRED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
INSUFFICIENT_CREDITS
NOT_VERIFIED
SUBSCRIPTION_REQUIRED
ALREADY_CONNECTED
PLAN_LIMIT_REACHED
PAYMENT_FAILED
INTERNAL_ERROR

## Authentication
All protected routes require:
Header: Authorization: Bearer <token>
Or: Cookie: agroconnect.session_token

## Pagination Query Params
?page=1&limit=12

## Language Header
All AI routes accept:
Header: Accept-Language: en | bn
Default: en

## File Upload
Multipart form-data
Field name: file
Max size: 5MB
Allowed: jpg, jpeg, png, webp, pdf (documents only)