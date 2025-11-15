# Deployment Guide

## Cloudflare Workers with OpenNext Adapter

This Next.js app is configured to deploy on Cloudflare Workers using the [@opennextjs/cloudflare](https://opennext.js.org/cloudflare) adapter. This enables full Next.js functionality including:

- Server-side rendering (SSR)
- API routes
- Server components
- Incremental static regeneration (ISR)
- Image optimization via Cloudflare Images

Reference: [Cloudflare Next.js Documentation](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)

## Local Development

### Standard Next.js Development

For the best developer experience with hot-reload:

```bash
npm run dev
```

This runs the Next.js development server on `http://localhost:3000`

### Preview with Cloudflare Runtime

To test your app in the actual Cloudflare Workers runtime (workerd):

```bash
npm run preview
```

This builds your app with the OpenNext adapter and runs it locally using `wrangler dev`. Use this before deploying to catch any runtime-specific issues.

## Deployment

### From Local Machine

Deploy directly from your local machine:

```bash
npm run deploy
```

This will:
1. Build your Next.js app
2. Transform it with the OpenNext adapter
3. Deploy to Cloudflare Workers

### From Cloudflare Dashboard / CI

If deploying from Cloudflare Dashboard or a CI system:

**Build command:**
```bash
npm run build
```

**Deploy command:**
```bash
npx wrangler deploy
```

Or use the combined command:
```bash
npm run deploy
```

## Configuration Files

### `wrangler.jsonc`

Configures the Cloudflare Worker:
- Worker entry point: `.open-next/worker.js`
- Assets directory: `.open-next/assets`
- Node.js compatibility enabled
- Compatibility date: `2025-03-25`

### `open-next.config.ts`

Configures the OpenNext adapter. You can customize caching behavior here. See [OpenNext Cloudflare caching docs](https://opennext.js.org/cloudflare/caching) for details.

## Environment Variables

Set environment variables in the Cloudflare Dashboard or use wrangler secrets:

```bash
npx wrangler secret put SECRET_NAME
```

For local development, create a `.dev.vars` file (already in .gitignore):

```
SECRET_NAME=value
```

## Custom Domains

After deploying, you can add a custom domain:

1. Go to your Cloudflare Dashboard
2. Navigate to Workers & Pages
3. Select your `focus-ramp` worker
4. Go to Settings → Domains & Routes
5. Add your custom domain

## Benefits of This Setup

✅ Full Next.js feature support (SSR, API routes, etc.)  
✅ Runs on Cloudflare's edge network for low latency  
✅ Ready for Firebase integration via API routes  
✅ Image optimization via Cloudflare Images  
✅ No cold starts  
✅ Automatic scaling  

## Testing Checklist

Before deploying to production:

- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run preview` - test in Cloudflare runtime
- [ ] Test all routes work correctly
- [ ] Verify environment variables are set
- [ ] Check that the build completes without errors

## Common Issues

### Build fails

Make sure all dependencies are installed:
```bash
npm install
```

### Runtime errors in preview/production

The Cloudflare Workers runtime (workerd) is different from Node.js. Some Node.js-specific APIs may not work. Use the `preview` command to catch these issues before deploying.

### Environment variables not working

Use `wrangler secret put` for sensitive values, or add them in the Cloudflare Dashboard under Settings → Variables and Secrets.

