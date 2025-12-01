# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy pnpm configuration files to leverage Docker cache
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build the SvelteKit application for production
RUN pnpm run build

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm globally for the runner stage (if needed for `pnpm start`)
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml for production dependencies
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy the built application from the builder stage
COPY --from=builder /app/build ./build

# Expose the port SvelteKit uses (default for adapter-node is 3000)
EXPOSE 3000

# Command to run the application using the "start" script
CMD ["pnpm", "start"]
