# Deployment Checklist

## Before Deployment

1. Update Environment Variables:

   - [ ] Set production Stripe keys
   - [ ] Update CORS_ORIGIN to your Squarespace domain
   - [ ] Set proper webhook secret

2. Server Setup:

   - [ ] Choose hosting provider (Heroku/DigitalOcean/etc.)
   - [ ] Set up SSL certificate
   - [ ] Configure domain name

3. Squarespace Setup:

   - [ ] Create new page or section
   - [ ] Add Code Block
   - [ ] Paste contents of deploy/squarespace-checkout.html
   - [ ] Update API endpoint URLs

4. Testing:
   - [ ] Test payment flow with test cards
   - [ ] Verify webhook functionality
   - [ ] Check success page redirect
   - [ ] Validate form submissions

## Deployment Steps

1. Server Deployment:

   ```bash
   # Set environment to production
   export NODE_ENV=production

   # Install dependencies
   npm install --production

   # Start server
   npm start
   ```

2. Squarespace Integration:

   - Navigate to Pages > Add Section > Code
   - Paste the contents of deploy/squarespace-checkout.html
   - Save and publish

3. Post-Deployment:
   - [ ] Verify live payments
   - [ ] Check webhook events
   - [ ] Monitor error logs
   - [ ] Test customer notifications
