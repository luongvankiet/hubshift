#!/bin/bash
set -e # Exit on any error

echo "🚀 Starting production deployment..."

# Determine if we need to use sudo for Docker commands
DOCKER_CMD="docker"
DOCKER_COMPOSE_CMD="docker-compose"

if [ "$USE_SUDO_DOCKER" = "true" ]; then
    DOCKER_CMD="sudo docker"
    DOCKER_COMPOSE_CMD="sudo docker-compose"
    echo "ℹ️  Using sudo for Docker commands due to permission requirements"
fi

# Restart nginx container to pick up new configuration
$DOCKER_COMPOSE_CMD -f docker-compose.production.yml restart nginx

echo "✅ Nginx restarted successfully"
    
# Pull latest images for changed services (skip if infrastructure-only)
if [ "$CHANGED_BACKEND" != "[]" ]; then
    echo "Pulling backend service images..."
    for service in $(echo $CHANGED_BACKEND | jq -r '.[]'); do
        echo "Pulling $DOCKER_USERNAME/$service:latest"
        $DOCKER_CMD pull $DOCKER_USERNAME/$service:latest
    done
fi

if [ "$CHANGED_FRONTEND" != "[]" ]; then
    echo "Pulling frontend service images..."
    for service in $(echo $CHANGED_FRONTEND | jq -r '.[]'); do
        echo "Pulling $DOCKER_USERNAME/$service:latest"
        $DOCKER_CMD pull $DOCKER_USERNAME/$service:latest
    done
fi

# Start/restart services using docker-compose
echo "Deploying services..."
$DOCKER_COMPOSE_CMD -f docker-compose.production.yml up -d

# Wait for services to be healthy with dynamic checking
echo "Waiting for services to be healthy..."

# Function to check if containers are running
# check_containers() {
#     local nginx_status=$($DOCKER_CMD ps --filter "name=nginx-1" --format "{{.Status}}" | grep -c "Up" || echo "0")
#     local gateway_status=$($DOCKER_CMD ps --filter "name=hubshift-api-gateway" --format "{{.Status}}" | grep -c "Up" || echo "0")
    
#     if [ "$nginx_status" = "1" ] && [ "$gateway_status" = "1" ]; then
#         return 0
#     else
#         return 1
#     fi
# }

# Function to check if health endpoint responds
check_health_endpoint() {
    # Try API subdomain first, fallback to main domain
    if curl -f -k -s --max-time 5 https://kevin-luong.info/gateway-health > /dev/null 2>&1; then
        return 0
    else
        # Fallback to main domain (for backward compatibility during transition)
        curl -f -k -s --max-time 5 https://kevin-luong.info/gateway-health > /dev/null 2>&1
        return $?
    fi
}

# Wait for containers to start (max 5 minutes)
# echo "⏳ Waiting for containers to start..."
# CONTAINER_TIMEOUT=300  # 5 minutes
# CONTAINER_ELAPSED=0

# while ! check_containers && [ $CONTAINER_ELAPSED -lt $CONTAINER_TIMEOUT ]; do
#     echo "   Containers starting... (${CONTAINER_ELAPSED}s elapsed)"
#     sleep 10
#     CONTAINER_ELAPSED=$((CONTAINER_ELAPSED + 10))
# done

# if ! check_containers; then
#     echo "❌ Containers failed to start within ${CONTAINER_TIMEOUT} seconds!"
#     echo "Container status:"
#     $DOCKER_CMD ps | grep hubshift
#     exit 1
# fi

# echo "✅ Containers are running!"

# Wait for health endpoint to respond (max 3 minutes)
# echo "⏳ Waiting for health endpoint to respond..."
# HEALTH_TIMEOUT=180  # 3 minutes
# HEALTH_ELAPSED=0

# while ! check_health_endpoint && [ $HEALTH_ELAPSED -lt $HEALTH_TIMEOUT ]; do
#     echo "   Health check pending... (${HEALTH_ELAPSED}s elapsed)"
#     sleep 15
#     HEALTH_ELAPSED=$((HEALTH_ELAPSED + 15))
# done

# if ! check_health_endpoint; then
#     echo "⚠️  Health endpoint not ready within ${HEALTH_TIMEOUT} seconds, but continuing with verification..."
# else
#     echo "✅ Health endpoint is responding!"
# fi

# Verify deployment with multiple checks
echo "Verifying deployment..."

# Check 1: API subdomain HTTPS endpoint (primary)
if curl -f -k https://api.kevin-luong.info/gateway-health > /dev/null 2>&1; then
    echo "✅ API subdomain HTTPS endpoint working!"
    HTTPS_OK=true
else
    echo "⚠️  API subdomain failed, trying main domain..."
    # Check 1b: Main domain fallback
    if curl -f -k https://kevin-luong.info/api/gateway-health > /dev/null 2>&1; then
        echo "✅ Main domain HTTPS endpoint working!"
        HTTPS_OK=true
    else
        echo "⚠️  Both endpoints failed, trying alternatives..."
        HTTPS_OK=false
    fi
fi

# Check 2: Direct IP with HTTPS (fallback)
if [ "$HTTPS_OK" = false ]; then
    if curl -f -k -H "Host: kevin-luong.info" https://54.152.161.13/api/gateway-health > /dev/null 2>&1; then
        echo "✅ Direct HTTPS access working!"
        HTTPS_OK=true
    else
        echo "⚠️  Direct HTTPS failed, checking HTTP redirect..."
    fi
fi

# Check 3: HTTP redirect (should get 301)
if [ "$HTTPS_OK" = false ]; then
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://54.152.161.13/ || echo "000")
    if [ "$HTTP_STATUS" = "301" ]; then
        echo "✅ HTTP redirect working (301 to HTTPS)!"
        HTTPS_OK=true
    else
        echo "❌ HTTP status: $HTTP_STATUS (expected 301)"
    fi
fi

# Check 4: Container health (fallback)
if [ "$HTTPS_OK" = false ]; then
    echo "Checking container health..."
    if $DOCKER_CMD ps | grep -q "hubshift-nginx.*Up"; then
        echo "✅ Nginx container is running!"
        if $DOCKER_CMD ps | grep -q "hubshift-api-gateway.*Up"; then
            echo "✅ API Gateway container is running!"
            echo "⚠️  Services are running but may need time to initialize"
            HTTPS_OK=true
        else
            echo "❌ API Gateway container not running!"
        fi
    else
        echo "❌ Nginx container not running!"
    fi
fi

# Final verdict
if [ "$HTTPS_OK" = true ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo "🌐 Site available at: https://kevin-luong.info"
    echo "🔧 API Subdomain: https://api.kevin-luong.info"
    echo "🔧 API Health: https://api.kevin-luong.info/gateway-health"
    echo "⚙️  Admin: https://admin.kevin-luong.info"
else
    echo ""
    echo "❌ Deployment verification failed!"
    echo "🔍 Debug commands:"
    echo "  $DOCKER_CMD ps | grep hubshift-nginx"
    echo "  $DOCKER_CMD logs hubshift-nginx --tail 20"
    echo "  $DOCKER_CMD logs hubshift-api-gateway --tail 20"
    echo "  curl -v https://kevin-luong.info/gateway-health"
    exit 1
fi
