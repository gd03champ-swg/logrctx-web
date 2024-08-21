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
ENV LOKI_URL http://localhost:3100/loki/api/v1/query_range

# Run app.py when the container launches
CMD ["python", "app.py"]