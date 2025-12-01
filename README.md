# Simple chat app using Sveltekit (for user research)

## Get started (local development):

```
pnpm install
pnpm run dev
```

Then visit `http://localhost:5173/`

## Running with Docker Compose

This project is configured to run in a Docker container using Docker Compose.

### Prerequisites

- Docker
- Docker Compose

### Usage

1.  **Build and Start the Service:**
    This command will build the Docker image (if it doesn't exist or if you explicitly request a rebuild) and start the application container.

    ```bash
    docker-compose up
    ```

    To force a rebuild of the application image (e.g., after changing source code or `Dockerfile`), use:

    ```bash
    docker-compose up --build
    ```

    You can add the `-d` flag to run the container in detached mode (in the background):

    ```bash
    docker-compose up -d
    ```

    or for a rebuild in detached mode:

    ```bash
    docker-compose up --build -d
    ```

    The application will be available at `http://localhost:3000`.

2.  **Stop the Service:**
    To stop the running container(s):

    ```bash
    docker-compose down
    ```

    This command stops and removes the containers defined in the `docker-compose.yml` file.
