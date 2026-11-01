# Deployment Overview

This project is designed to be deployed across various environments using standard web deployment practices. The primary goal is to ensure consistency between development, staging, and production environments.

## Deployment Options

### 1. Docker (Recommended for Self-Hosting)
The project includes a `Dockerfile` and `docker-compose.yml` for easy containerization.
- **Environment**: Suitable for VPS, DigitalOcean, AWS EC2, etc.
- **Setup**: 
  - Use `docker-compose up --build -d` to start the application in detached mode.
  - Nginx is used as a reverse proxy (if configured) to handle SSL and port mapping.

### 2. Vercel (Recommended for Frontend-only)
Since the project uses Next.js, Vercel provides an optimized deployment pipeline.
- **Setup**: Connect your GitHub repository to Vercel.
- **Configuration**: Vercel will automatically detect Next.js and configure the build commands (`npm run build` and `npm run start`).
- **Environment Variables**: Ensure all necessary `.env` variables are set in the Vercel dashboard.

### 3. GitHub Pages
*Note: This is primarily for static exports.*
- **Setup**: Requires `next export` (or the `output: 'export'` in `next.config.js`).
- **Limitations**: Dynamic features of Next.js (like Server Actions or dynamic API routes) will not work on GitHub Pages.

## CI/CD Pipeline
- **GitHub Actions**: Can be used to automate the build process, run linting, and trigger deployments to Vercel or Docker registries.
- **Makefile**: Use the provided `Makefile` to standardize common deployment-related commands like building, linting, and container startup.

## Environment Variables
Ensure the following variables are configured in your production environment:
- `NEXT_PUBLIC_API_URL`: The base URL for your backend services.
- `NODE_ENV`: Set to `production`.
- (Other project-specific secrets should be added here).
