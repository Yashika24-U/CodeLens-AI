FROM node:20-slim

WORKDIR /app

# Install system dependencies for PostgreSQL
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Copy package files and install
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

EXPOSE 5000

CMD ["npm", "start"]