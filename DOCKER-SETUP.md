# 🐳 Heydesk Backend Docker Setup

This guide will help you run your .NET 9 backend with Docker, connecting to external TiDB Cloud databases.

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- Access to TiDB Cloud databases (already configured)
- Git (to clone the repository)

## 🚀 Quick Start

### 1. Environment Setup

The environment variables are already configured in `Heydesk.Server/.env` with your TiDB Cloud connections:

```bash
# Verify the .env file exists and has your database connections
cat Heydesk.Server/.env
```

**Pre-configured Environment Variables:**

- `LOCAL_DATABASE` - Local MySQL connection
- `CLOUD_DATABASE` - TiDB Cloud production database
- `VECTOR_DATABASE` - TiDB Cloud vector database
- `CLIENT_URL` - Frontend URL (http://localhost:3000)
- `JWT_SECRET` - JWT signing key
- `JWT_ISSUER` - JWT issuer
- `JWT_AUDIENCE` - JWT audience
- `AZURE_AI_ENDPOINT` - Azure AI endpoint
- `AZURE_AI_APIKEY` - Azure AI API key
- `EXA_AI_APIKEY` - Exa AI API key

### 2. Run with Docker Compose

```bash
# Start the Heydesk API service
docker-compose up -d

# View logs
docker-compose logs -f heydesk-api

# Stop the service
docker-compose down
```

### 3. Database Migrations

After the container is running, you'll need to run database migrations:

```bash
# Run migrations on the API container
docker-compose exec heydesk-api dotnet ef database update
```

## 🔧 Service Management

### Start Backend API

```bash
docker-compose up -d heydesk-api
```

### View Service Logs

```bash
# API logs
docker-compose logs -f heydesk-api
```

### Restart Service

```bash
docker-compose restart heydesk-api
```

## 🌐 Service URLs

Once running, your service will be available at:

- **Heydesk API**: http://localhost:5000
- **API Swagger**: http://localhost:5000/swagger
- **HTTPS API**: https://localhost:5001

## 🛠️ Development Commands

### Build and Run Backend Only

```bash
# Build the Docker image
docker build -t heydesk-api ./Heydesk.Server

# Run the container
docker run -p 5000:8080 --env-file ./Heydesk.Server/.env heydesk-api
```

### Access Container Shell

```bash
# Access the API container
docker-compose exec heydesk-api /bin/bash
```

### Database Management

```bash
# Test database connectivity
docker-compose exec heydesk-api dotnet ef database update --dry-run
```

## 🧹 Cleanup

### Stop and Remove Containers

```bash
# Stop container
docker-compose down

# Remove container and image
docker-compose down --rmi all
```

### Reset Everything

```bash
# Stop, remove container and image
docker-compose down --rmi all

# Remove any orphaned containers
docker system prune -f
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```bash
   # Check what's using the port
   lsof -i :5000

   # Kill the process or change ports in docker-compose.yml
   ```

2. **Database Connection Issues**

   ```bash
   # Check if API container is running
   docker-compose ps

   # Test database connectivity
   docker-compose exec heydesk-api dotnet ef database update --dry-run
   ```

3. **Environment Variables Not Loading**

   ```bash
   # Verify .env file exists and has correct format
   cat Heydesk.Server/.env

   # Check if variables are loaded in container
   docker-compose exec heydesk-api env | grep JWT
   ```

4. **Build Issues**

   ```bash
   # Clean build
   docker-compose build --no-cache heydesk-api

   # Rebuild and start
   docker-compose up --build heydesk-api
   ```

### Health Checks

```bash
# Check if API is responding
curl http://localhost:5000/health

# Check database connections
docker-compose exec heydesk-api dotnet ef database update --dry-run
```

## 📝 Notes

- Database connections are to external TiDB Cloud instances
- Environment variables are loaded from `Heydesk.Server/.env`
- The API runs on port 5000 (HTTP) and 5001 (HTTPS)
- CORS is configured to allow your frontend URL (http://localhost:3000)
- No local databases are required - all data is stored in TiDB Cloud

## 🔄 Development Workflow

1. Make changes to your .NET code
2. Rebuild the container: `docker-compose build heydesk-api`
3. Restart the service: `docker-compose restart heydesk-api`
4. Check logs: `docker-compose logs -f heydesk-api`

For production deployment, consider using a proper orchestration platform like Kubernetes or Docker Swarm.
