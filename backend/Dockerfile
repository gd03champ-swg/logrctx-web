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
ENV LOKI_URL=http://loki-loki-distributed-query-frontend.default:3100
ENV COGNITO_REGION=ap-southeast-1
ENV COGNITO_USERPOOL_ID=ap-southeast-1_crJBQ7yo6
ENV COGNITO_APP_CLIENT_ID=4kqil27q4dcielr3vbdqqemkm5

# LLM and Embedding Model IDs 
ENV MISTRAL_7B_MODEL_ID = mistral.mistral-7b-instruct-v0:2
ENV MISTRAL_7X8B_MODEL_ID = mistral.mixtral-8x7b-instruct-v0:1
ENV MISTRAL_LARGE_MODEL_ID = mistral.mistral-large-2407-v1:0
ENV EMBEDDING_MODEL_ID = cohere.embed-english-v3



# Start the app
CMD ["python", "app.py"]