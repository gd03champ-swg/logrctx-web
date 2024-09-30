# Get confirmation if pasted shuttle creds
echo "Please confirm that you have pasted the shuttle creds in the terminal"
read -p "Press [Enter] key to continue..."

# Login docker to shuttle ecr
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 157529275398.dkr.ecr.ap-southeast-1.amazonaws.com

# Navigate to frontend, build and push new image
cd frontend
docker buildx build --push --platform linux/arm64 -t 157529275398.dkr.ecr.ap-southeast-1.amazonaws.com/logrctx/backend:latest .

# Navigate to backend, build and push new image
cd ../backend
docker buildx build --push --platform linux/arm64 -t 157529275398.dkr.ecr.ap-southeast-1.amazonaws.com/logrctx/frontend:latest .

echo "New images have been built and pushed to ECR"

