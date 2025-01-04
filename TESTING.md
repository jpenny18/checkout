# Testing Guide

## Test Cards

- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Authentication Required: 4000 0025 0000 3155

## Test Flow

1. Fill out form with test data
2. Use test card number
3. Future date for expiry
4. Any 3 digits for CVC

## Webhook Testing

1. Use Stripe CLI for local testing
2. Run: stripe listen --forward-to localhost:3000/webhook
