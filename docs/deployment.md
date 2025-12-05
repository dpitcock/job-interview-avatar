# Deployment Guide

## Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- API keys for cloud services (if using CLOUD mode)

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/interview-avatar.git
   cd interview-avatar
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Build and run**:
   ```bash
   docker-compose up -d
   ```

4. **Access the app**:
   - Open `http://localhost:3000`

### Configuration

Edit `.env.local` or set environment variables:

```bash
# Mode
INTERVIEW_MODE=LOCAL  # or CLOUD

# Cloud APIs (optional)
ANTHROPIC_API_KEY=your_key
OPENAI_API_KEY=your_key
ELEVENLABS_API_KEY=your_key
HEYGEN_API_KEY=your_key
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| app | 3000 | Next.js application |
| ollama | 11434 | Local LLM server |

### Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Pull latest Ollama model
docker-compose exec ollama ollama pull deepseek-r1:latest
```

## Vercel Deployment

### Prerequisites
- Vercel account
- GitHub repository

### Steps

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/interview-avatar.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables (see below)
   - Deploy

3. **Environment Variables** (in Vercel dashboard):
   ```
   INTERVIEW_MODE=CLOUD
   ANTHROPIC_API_KEY=your_key
   OPENAI_API_KEY=your_key
   ELEVENLABS_API_KEY=your_key
   HEYGEN_API_KEY=your_key
   ```

4. **Note**: Vercel deployment uses CLOUD mode only (no Ollama)

## Railway Deployment

### Prerequisites
- Railway account
- GitHub repository

### Steps

1. **Connect to Railway**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure Environment**:
   - Add environment variables from `.env.example`
   - Set `INTERVIEW_MODE=LOCAL` or `CLOUD`

3. **Deploy**:
   - Railway will automatically build and deploy
   - Access via the provided URL

## Self-Hosted (VPS)

### Prerequisites
- Ubuntu 22.04+ server
- Docker installed
- Domain name (optional)

### Steps

1. **SSH into server**:
   ```bash
   ssh user@your-server.com
   ```

2. **Install Docker**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

3. **Clone and deploy**:
   ```bash
   git clone https://github.com/yourusername/interview-avatar.git
   cd interview-avatar
   cp .env.example .env.local
   # Edit .env.local
   docker-compose up -d
   ```

4. **Set up reverse proxy** (optional, for HTTPS):
   ```bash
   # Install Caddy
   sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
   sudo apt update
   sudo apt install caddy

   # Configure Caddy
   sudo nano /etc/caddy/Caddyfile
   ```

   Add:
   ```
   your-domain.com {
       reverse_proxy localhost:3000
   }
   ```

   ```bash
   sudo systemctl restart caddy
   ```

## Performance Optimization

### Next.js
- Enable output: 'standalone' in `next.config.js`
- Use Image Optimization
- Enable caching headers

### Ollama
- Allocate sufficient RAM (8GB+ recommended)
- Use GPU if available
- Pre-pull models on deployment

### Database
- Use persistent volumes for ChromaDB
- Regular backups of RAG documents

## Monitoring

### Health Checks

```bash
# Check app health
curl http://localhost:3000/api/status

# Check Ollama
curl http://localhost:11434/api/tags
```

### Logs

```bash
# Docker logs
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f ollama
```

## Troubleshooting

### "Cannot connect to Ollama"
- Ensure Ollama container is running: `docker-compose ps`
- Check logs: `docker-compose logs ollama`
- Verify network: `docker network ls`

### "Out of memory"
- Increase Docker memory limit
- Use smaller Ollama model (e.g., `mistral:7b`)
- Switch to CLOUD mode

### "Build fails"
- Clear Docker cache: `docker-compose build --no-cache`
- Check Node version (requires 18+)
- Verify all dependencies in package.json

## Security

### Production Checklist
- [ ] Change default passwords
- [ ] Use HTTPS (SSL certificate)
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Rotate API keys regularly
- [ ] Keep dependencies updated
- [ ] Monitor for security vulnerabilities

### Environment Variables
- Never commit `.env.local` to git
- Use secrets management (e.g., Vercel Secrets, Railway Variables)
- Rotate API keys if exposed

## Scaling

### Horizontal Scaling
- Deploy multiple app instances behind load balancer
- Use Redis for session storage
- Separate Ollama instances for LLM requests

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Use larger Ollama models
- Optimize database queries

## Backup & Recovery

### Backup
```bash
# Backup RAG documents
docker-compose exec app tar -czf /tmp/rag-backup.tar.gz ./data

# Copy to host
docker cp interview-avatar_app_1:/tmp/rag-backup.tar.gz ./backups/
```

### Restore
```bash
# Copy backup to container
docker cp ./backups/rag-backup.tar.gz interview-avatar_app_1:/tmp/

# Extract
docker-compose exec app tar -xzf /tmp/rag-backup.tar.gz -C ./
```
