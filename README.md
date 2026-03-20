# Eligibility Chat Frontend

A SvelteKit-based frontend for various eligibility prototypes, designed for user research and testing.

## Getting Started (Local Development)

### 1. Prerequisites
- Node.js
- `pnpm`

### 2. Environment Setup
Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set the `PUBLIC_ADK_API_URL`. This should point to a running instance of the ADK API from https://github.com/govuk-once/gds-eligibility-agentic-backend.

### 3. Install Dependencies & Start
```bash
pnpm install
pnpm dev
```
The application will be available at `http://localhost:5173`.

---

## Prototypes & Agent Access

This frontend hosts multiple prototypes. You can access them via the following URLs:

### 1. Child Benefit Agent
A dedicated agent for Child Benefit eligibility and information. Tested in user research round 1.
- **URL:** `http://localhost:5173/child-benefit`

### 2. UC / PIP Agents (Default Home)
Updated version of the prototype tested in user research round 2.
- **URL:** `http://localhost:5173/`


### 3. Proactive Prototypes
Tested in user research round 3, these prototypes simulate proactive benefit engagement for different life stages:
- **Thirties:** `http://localhost:5173/proactive/thirties`
- **Fifties:** `http://localhost:5173/proactive/fifties`
- **Over 66:** `http://localhost:5173/proactive/over66`

#### 🔄 Resetting Proactive Journeys
To clear your session and start a fresh journey (essential when switching between age groups or restarting a user journey), use the `/reset` path:
- **Example:** `http://localhost:5173/proactive/thirties/reset`

---

## Infrastructure & Deployment

The infrastructure code (Terraform/AWS) is located in the **backend repository** (https://github.com/govuk-once/gds-eligibility-agentic-backend).

### Updating the Frontend Image
Once the infrastructure is deployed, you can update the frontend by pushing a new Docker image to Amazon ECR.

#### Deployment Commands

```bash
# 1. Authenticate Docker to ECR
aws-vault exec <AWS PROFILE> -- aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.eu-west-2.amazonaws.com

# 2. Push to ECR (ensure correct account - staging or dev - is uncommented in docker-compose.yml)
docker compose build --push app
```
