# SyncNexa Identity - Docker Deployment Guide

## Quick Start with Docker

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/SyncNexa/syncnexa-identity-system.git
   cd syncnexa-identity-system
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Start all services**

   ```bash
   docker-compose up -d
   ```

4. **Check health**
   ```bash
   curl http://localhost:3000/health
   ```

### Production Deployment

#### Build Production Image

```bash
docker build -t syncnexa-identity:latest .
```

#### Run with Custom Network

```bash
# Create network
docker network create syncnexa-network

# Run MySQL
docker run -d \
  --name syncnexa-mysql \
  --network syncnexa-network \
  -e MYSQL_ROOT_PASSWORD=your_root_password \
  -e MYSQL_DATABASE=identity_db \
  -e MYSQL_USER=identity_user \
  -e MYSQL_PASSWORD=your_db_password \
  -v mysql-data:/var/lib/mysql \
  mysql:8.0

# Run Redis
docker run -d \
  --name syncnexa-redis \
  --network syncnexa-network \
  -v redis-data:/data \
  redis:7-alpine redis-server --requirepass your_redis_password

# Run Identity Service
docker run -d \
  --name syncnexa-identity \
  --network syncnexa-network \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=syncnexa-mysql \
  -e DB_USER=identity_user \
  -e DB_PASSWORD=your_db_password \
  -e DB_NAME=identity_db \
  -e REDIS_HOST=syncnexa-redis \
  -e REDIS_PASSWORD=your_redis_password \
  -e JWT_SECRET=your_jwt_secret \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/logs:/app/logs \
  syncnexa-identity:latest
```

### Docker Compose Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f identity

# Restart a service
docker-compose restart identity

# Scale (if needed)
docker-compose up -d --scale identity=3

# Remove everything including volumes
docker-compose down -v
```

### Environment Variables

Key environment variables to configure:

| Variable         | Description                          | Required |
| ---------------- | ------------------------------------ | -------- |
| `NODE_ENV`       | Environment (production/development) | Yes      |
| `PORT`           | Application port                     | Yes      |
| `DB_HOST`        | MySQL host                           | Yes      |
| `DB_USER`        | MySQL user                           | Yes      |
| `DB_PASSWORD`    | MySQL password                       | Yes      |
| `DB_NAME`        | Database name                        | Yes      |
| `REDIS_HOST`     | Redis host                           | Yes      |
| `REDIS_PASSWORD` | Redis password                       | No       |
| `JWT_SECRET`     | JWT signing key (min 32 chars)       | Yes      |

### Health Checks

The container includes built-in health checks:

- **Endpoint**: `GET /health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3

Check container health:

```bash
docker inspect --format='{{.State.Health.Status}}' syncnexa-identity
```

### Logs

View application logs:

```bash
# Docker logs
docker logs -f syncnexa-identity

# Application logs (if volume mounted)
tail -f logs/combined.log
tail -f logs/error.log
```

### Troubleshooting

**Container won't start:**

```bash
# Check logs
docker logs syncnexa-identity

# Inspect container
docker inspect syncnexa-identity
```

**Database connection issues:**

```bash
# Test MySQL connectivity
docker exec -it syncnexa-mysql mysql -u root -p

# Check network
docker network inspect syncnexa-network
```

**Redis connection issues:**

```bash
# Test Redis
docker exec -it syncnexa-redis redis-cli ping
```

### Security Best Practices

1. **Never commit .env files** - Use .env.example as template
2. **Use secrets management** - For production, use Docker secrets or vault
3. **Run as non-root** - Container runs as user `nodejs` (UID 1001)
4. **Keep images updated** - Regularly rebuild with latest base images
5. **Use private registry** - For production deployments
6. **Scan for vulnerabilities**:
   ```bash
   docker scan syncnexa-identity:latest
   ```

### Performance Optimization

1. **Use multi-stage build** - Already implemented
2. **Layer caching** - Optimize COPY order
3. **Minimize image size**:
   ```bash
   docker images syncnexa-identity
   ```
4. **Resource limits** - Set in docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: "2"
         memory: 2G
   ```

### Backup and Restore

**Backup MySQL:**

```bash
docker exec syncnexa-mysql mysqldump -u root -p identity_db > backup.sql
```

**Restore MySQL:**

```bash
docker exec -i syncnexa-mysql mysql -u root -p identity_db < backup.sql
```

**Backup Redis:**

```bash
docker exec syncnexa-redis redis-cli SAVE
docker cp syncnexa-redis:/data/dump.rdb ./redis-backup.rdb
```

### Monitoring

Add monitoring with Prometheus and Grafana:

```bash
# Add to docker-compose.yml
prometheus:
  image: prom/prometheus
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
```

### CI/CD Integration

**GitHub Actions Example:**

```yaml
- name: Build Docker Image
  run: docker build -t syncnexa-identity:${{ github.sha }} .

- name: Push to Registry
  run: |
    docker tag syncnexa-identity:${{ github.sha }} your-registry/syncnexa-identity:latest
    docker push your-registry/syncnexa-identity:latest
```

### Production Checklist

- [ ] Set strong passwords for all services
- [ ] Configure SSL/TLS certificates
- [ ] Set up reverse proxy (nginx/traefik)
- [ ] Enable firewall rules
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerting
- [ ] Review and update resource limits
- [ ] Enable log rotation
- [ ] Configure rate limiting
- [ ] Set up health check alerts
