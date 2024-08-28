# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Make port 8000 available to the world outside this container
EXPOSE 8080

# Define environment variable
ENV LOKI_URL = http://host.docker.internal:3100
ENV COGNITO_REGION = ap-southeast-1
ENV COGNITO_USERPOOL_ID = ap-southeast-1_crJBQ7yo6
ENV COGNITO_APP_CLIENT_ID = 4kqil27q4dcielr3vbdqqemkm5

# Run app.py when the container launches
CMD ["python", "app.py"]