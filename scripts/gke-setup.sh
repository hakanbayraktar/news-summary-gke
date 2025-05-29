#!/bin/bash

echo "📢 GKE setup is starting. Current user session will not be revoked automatically. If needed, run 'gcloud auth revoke' manually."

# 🔍 Check if gcp-key.json exists
if [ ! -f gcp-key.json ]; then
  echo "❌ ERROR: 'gcp-key.json' file not found. Please place your service account key in the script directory."
  exit 1
fi

# 🔐 Authenticate with the service account
gcloud auth activate-service-account --key-file=gcp-key.json

# 📌 Set the target GCP project
PROJECT_ID="Your-Project_ID"
REGION="us-central1"
CLUSTER_NAME="devops-cluster-test"

gcloud config set project "$PROJECT_ID"

# ⚙️ Enable required GCP services
gcloud services enable container.googleapis.com artifactregistry.googleapis.com

# 🧹 Optional: Delete previous cluster (if needed)
# gcloud container clusters delete "$CLUSTER_NAME" --region="$REGION" --quiet

# 🏗️ Create GKE cluster with minimal resources
gcloud container clusters create "$CLUSTER_NAME" \
  --num-nodes=1 \
  --machine-type=e2-small \
  --disk-type=pd-standard \
  --disk-size=50 \
  --region="$REGION" \
  --release-channel=stable \
  --project="$PROJECT_ID"

# 🔗 Get credentials for kubectl access
gcloud container clusters get-credentials "$CLUSTER_NAME" \
  --region="$REGION" \
  --project="$PROJECT_ID"

# ⏳ Wait until the cluster becomes reachable
echo "⏳ Waiting for GKE cluster to become reachable..."
MAX_ATTEMPTS=6
SLEEP_SECONDS=15

for ((i=1; i<=MAX_ATTEMPTS; i++)); do
  if kubectl get nodes &> /dev/null; then
    echo "✅ GKE cluster is ready. You can now proceed with Argo CD installation."
    exit 0
  else
    echo "❗ Attempt $i/$MAX_ATTEMPTS: Cluster not ready yet. Retrying in $SLEEP_SECONDS seconds..."
    sleep $SLEEP_SECONDS
  fi
done

echo "❌ ERROR: GKE cluster is not reachable after $((MAX_ATTEMPTS * SLEEP_SECONDS)) seconds. Please check your quota, region, or credentials."
exit 1
