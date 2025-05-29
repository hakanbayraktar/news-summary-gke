#!/bin/bash

set -e

# Color definitions
GREEN='\033[0;32m'
BLUE='\033[1;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Installing Argo CD...${NC}"

# Create Argo CD namespace
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
echo -e "${GREEN}✅ Namespace 'argocd' created.${NC}"

# Apply Argo CD components
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
echo -e "${GREEN}✅ Argo CD components applied.${NC}"

# Patch Argo CD service to expose it via LoadBalancer
echo -e "${BLUE}🌐 Exposing Argo CD UI via LoadBalancer...${NC}"
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'

# Wait for Argo CD server deployment to be available
echo -e "${BLUE}⏳ Waiting for Argo CD server deployment...${NC}"
kubectl wait deployment/argocd-server -n argocd --for=condition=Available=True --timeout=180s
echo -e "${GREEN}✅ Argo CD server is now available.${NC}"

# Wait for LoadBalancer IP
echo -e "${BLUE}🔍 Waiting for external IP assignment...${NC}"
for i in {1..20}; do
  EXTERNAL_IP=$(kubectl get svc argocd-server -n argocd -o jsonpath="{.status.loadBalancer.ingress[0].ip}")
  if [ -n "$EXTERNAL_IP" ]; then
    echo -e "${GREEN}✅ Argo CD UI is available at: ${YELLOW}https://$EXTERNAL_IP${NC}"
    break
  else
    echo -e "${YELLOW}⏳ Still waiting for external IP... (${i}/20)${NC}"
    sleep 10
  fi
done

if [ -z "$EXTERNAL_IP" ]; then
  echo -e "${RED}❌ ERROR: External IP not assigned after 200 seconds.${NC}"
  exit 1
fi

# Get initial admin password
echo -e "${BLUE}🔐 Argo CD admin login credentials:${NC}"
echo -e "Username: ${YELLOW}admin${NC}"
echo -ne "Password: ${YELLOW}"
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
echo -e "${NC}"
