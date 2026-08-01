# Production Deployment Guide — MarketForge AI™

This guide details enterprise deployment configurations for deploying MarketForge AI™ in containerized, VM-based, and serverless environments.

## 📦 Container Deployment (Docker & Compose)

To build and run the complete full-stack environment locally or on any cloud provider supporting Docker:

```bash
# Build the production container image
docker build -t marketforge-ai:production .

# Run the container mapping ingress port 3000
docker run -p 3000:3000 --env-file .env marketforge-ai:production
```

Or using `docker-compose.yml`:

```yaml
version: '3.8'
services:
  marketforge-os:
    image: marketforge-ai:production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: always
```

---

## ☁️ Azure App Service & Container Instances

Deploy directly using the Azure CLI or Azure Devops pipelines:

```bash
az webapp up --name marketforge-os --resource-group rg-mforge --plan plan-mforge --runtime "NODE|18-lts"
```

---

## ☁️ AWS ECS & Fargate Orchestration

Deploy securely to AWS Fargate by uploading your image to Amazon ECR and configuring an Application Load Balancer targeting port `3000`.

1. **ECS Task Definition Security**: Attach task execution roles with access to AWS Secrets Manager to pull `GEMINI_API_KEY` and `FIREBASE_PRIVATE_KEY` dynamically.
2. **CDN Static Distribution**: Run CloudFront targeting S3 bucket containing browser assets in `dist/` directory.

---

## ⚙️ cPanel Application Manager Setup (Node.js Passenger)

If deploying in standard shared environments using cPanel Node.js Application Manager:

1. **Build and Prepare the Application (Required)**:
   - Before launching or starting the application, you **MUST** run the installation and compilation command in your development environment or server:
     ```bash
     npm install && npm run build
     ```
   - This command restores all external packages and compiles the backend into `dist/server.cjs` and the frontend into `dist/`.
   - **CRITICAL**: Do NOT upload the `node_modules` folder from your local PC to the server if they were compiled for a different OS (e.g., Windows/Mac to Linux). Running local Windows/Mac packages on a Linux cPanel server will crash the application and cause a **503 Service Unavailable** error.

2. **Configure cPanel Node.js Application**:
   - **Node.js Version**: Select **Node.js 18.x or 20.x** (do not use version 16 or below).
   - **Application Mode**: Select **Production**.
   - **Application Root**: Enter the folder path where you uploaded your files (e.g., `public_html` or a custom subfolder).
   - **Application URL**: Select your domain (e.g., `marketforge.scamspike.com`).
   - **Application Startup File**: Enter `server.js` (this file bootstraps `dist/server.cjs` safely).

3. **Install Dependencies on Server**:
   - Go to your cPanel Node.js App page and click the **Run NPM Install** button.
   - Alternatively, SSH into your server, go to the application root, delete any existing `package-lock.json` and `node_modules` folder, and run:
     ```bash
     npm install --production
     ```

4. **Define Environment Variables**:
   - Add your environment variables in the cPanel Node.js UI:
     - `NODE_ENV` = `production`
     - `GEMINI_API_KEY` = `your_gemini_key`
     - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (if using live Firestore).

5. **Fixing 503 (Service Unavailable) & Asset Loading Errors**:
   - **Delete local node_modules**: If you uploaded `node_modules` from your PC, delete the `node_modules` directory and `package-lock.json` on the server, then run NPM Install inside the cPanel UI again.
   - **Mismatched Asset Hashes**: If your browser console requests old assets (like `index-PMBeEpp7.js`), your browser has cached the old `index.html`. Clear your browser cache or test the site in an **Incognito / Private Window** to load the newly built files (`index-XOnTlg9S.js`, etc.).
   - **Restart the App**: Click the **Restart** button in your cPanel Node.js Application Manager after making any edits or uploading new builds.

