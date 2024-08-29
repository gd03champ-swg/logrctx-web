# Use an official Python runtime as a parent image
FROM python:3.9-slim AS base

# Set the working directory in the container
WORKDIR /app

# Install dependencies
# Copy only the requirements file first for caching the layer
COPY requirements.txt .

# Install dependencies with no cache and using pip's "--upgrade" flag to ensure the latest versions
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose port 8080
EXPOSE 8080

# Define environment variables without spaces around the "="
ENV LOKI_URL=http://loki-loki-distributed-query-frontend.default:3100 \
    COGNITO_REGION=ap-southeast-1 \
    COGNITO_USERPOOL_ID=ap-southeast-1_crJBQ7yo6 \
    COGNITO_APP_CLIENT_ID=4kqil27q4dcielr3vbdqqemkm5

# Start the app
CMD ["python", "app.py"]