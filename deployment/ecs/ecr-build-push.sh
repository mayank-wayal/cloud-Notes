#!/usr/bin/env bash
set -euo pipefail

: "${AWS_ACCOUNT_ID:?Set AWS_ACCOUNT_ID}"
: "${AWS_REGION:?Set AWS_REGION}"

IMAGE_TAG="${IMAGE_TAG:-$(date +%Y%m%d%H%M%S)}"
BACKEND_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/cloudnotes-backend"
FRONTEND_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/cloudnotes-frontend"

aws ecr describe-repositories --repository-names cloudnotes-backend >/dev/null 2>&1 ||
  aws ecr create-repository --repository-name cloudnotes-backend >/dev/null

aws ecr describe-repositories --repository-names cloudnotes-frontend >/dev/null 2>&1 ||
  aws ecr create-repository --repository-name cloudnotes-frontend >/dev/null

aws ecr get-login-password --region "$AWS_REGION" |
  docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

docker build -t "cloudnotes-backend:${IMAGE_TAG}" ./backend
docker tag "cloudnotes-backend:${IMAGE_TAG}" "${BACKEND_REPO}:${IMAGE_TAG}"
docker push "${BACKEND_REPO}:${IMAGE_TAG}"

docker build --build-arg VITE_API_URL=/api -t "cloudnotes-frontend:${IMAGE_TAG}" ./frontend
docker tag "cloudnotes-frontend:${IMAGE_TAG}" "${FRONTEND_REPO}:${IMAGE_TAG}"
docker push "${FRONTEND_REPO}:${IMAGE_TAG}"

echo "Pushed:"
echo "  ${BACKEND_REPO}:${IMAGE_TAG}"
echo "  ${FRONTEND_REPO}:${IMAGE_TAG}"
