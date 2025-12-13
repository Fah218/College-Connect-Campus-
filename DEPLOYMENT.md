# CampusConnect Deployment Guide

## Production Deployment

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Web server (Nginx/Apache) or hosting platform

### Environment Setup

1. **Create Environment File**
```bash
cp .env.example .env
```

2. **Configure Production Variables**
```env
VITE_APP_NAME=CampusConnect
VITE_API_URL=https://api.campusconnect.com
VITE_ENV=production
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_RECOMMENDATIONS=true
```

### Build for Production

```bash
# Install dependencies
npm install

# Build optimized production bundle
npm run build
```

The build output will be in the `dist/` directory.

### Deployment Options

#### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

#### Option 2: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Option 3: Traditional Server (Nginx)

1. Upload `dist/` folder to server
2. Configure Nginx:

```nginx
server {
    listen 80;
    server_name campusconnect.com;
    root /var/www/campusconnect/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

### Security Checklist

- ✅ Environment variables configured
- ✅ HTTPS enabled
- ✅ CORS properly configured
- ✅ API endpoints secured
- ✅ Rate limiting implemented
- ✅ Input validation on all forms
- ✅ XSS protection enabled

### Performance Optimization

- Code splitting enabled (Vite default)
- Assets minified and compressed
- Images optimized
- Lazy loading for routes
- Service worker for caching (optional)

### Monitoring

Set up monitoring for:
- Error tracking (Sentry)
- Analytics (Google Analytics)
- Performance metrics (Web Vitals)
- Uptime monitoring

### Backup Strategy

- Database backups (if using backend)
- User data exports
- Configuration backups
- Regular snapshots

### CI/CD Pipeline

Example GitHub Actions workflow:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Post-Deployment

1. Test all features in production
2. Verify analytics tracking
3. Check error logging
4. Monitor performance
5. Set up alerts

### Rollback Plan

Keep previous builds:
```bash
# Tag releases
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
```

### Support

For issues, contact: support@campusconnect.com
