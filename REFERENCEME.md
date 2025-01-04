# Prop Trading Checkout System

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

- Copy `.env.example` to `.env`
- Add your Stripe API keys
- Set webhook secret

3. Start the server:

```bash
npm start
```

## Squarespace Integration

1. Create a code block in Squarespace
2. Copy the contents of `public/thebestcheckout.html`
3. Update the Stripe publishable key
4. Update API endpoints to match your server URL

## Security Notes

- Always use HTTPS
- Keep API keys secure
- Implement rate limiting in production
- Add additional validation as needed

## Maintenance

- Monitor Stripe dashboard for transactions
- Keep dependencies updated
- Check logs for errors
- Backup customer data regularly
