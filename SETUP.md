# SmartAccident — Setup Guide

Complete setup instructions for running SmartAccident locally using **Docker Compose**. One command gets everything running.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| **Git** | 2.x+ | [git-scm.com](https://git-scm.com/) |
| **Docker** | 24.x+ | [docker.com/get-docker](https://docs.docker.com/get-docker/) |
| **Docker Compose** | v2.x+ (included with Docker Desktop) | Comes with Docker Desktop |

> **That's it.** No Python, Node.js, or database installation needed — everything runs inside containers.

---

## 1. Clone the Repository

```bash
git clone https://github.com/Auxilus08/HackByte4.0.git
cd HackByte4.0
```

---

## 2. Configure Environment

Copy the example environment file and edit it:

```bash
cp .env.example .env
```

Open `.env` and fill in the values:

```dotenv
# ─── Database (defaults work out of the box) ───
DATABASE_URL=postgresql+asyncpg://smartaccident:smartaccident_secret@db:5432/smartaccident_db
SECRET_KEY=change_me_in_production

# ─── Twilio Voice API (optional — for real phone calls) ───
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# ─── Google Maps Geocoding API (optional) ───
GOOGLE_MAPS_API_KEY=

# ─── Blockchain / Polygon Amoy (optional) ───
WEB3_PROVIDER_URL=https://rpc-amoy.polygon.technology
REWARD_CONTRACT_ADDRESS=
DEPLOYER_PRIVATE_KEY=
```

> **Note:** For initial setup, only `DATABASE_URL` and `SECRET_KEY` are needed. The platform starts in simulation/fallback mode for Twilio, geocoding, and blockchain features if those keys are not set.

---

## 3. Start Everything

```bash
docker compose up --build -d
```

This single command will:
1. Pull and start **PostgreSQL 16 + PostGIS** database
2. Build and start the **FastAPI backend** (auto-runs database migrations + ML model training)
3. Build and start the **Next.js 16 frontend**

Wait ~60 seconds for the initial build, then verify:

```bash
docker compose ps
```

Expected output — all 3 services should be `Up`:

```
NAME                     STATUS          PORTS
smartaccident_db         Up (healthy)    0.0.0.0:5432->5432/tcp
smartaccident_backend    Up              0.0.0.0:8000->8000/tcp
smartaccident_frontend   Up              0.0.0.0:3000->3000/tcp
```

---

## 4. Access the Application

| Service | URL | Description |
|---|---|---|
| **Frontend** | [http://localhost:3000](http://localhost:3000) | Landing page → Login → Dashboard |
| **Backend API** | [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger UI (interactive API docs) |
| **Health Check** | [http://localhost:8000/health](http://localhost:8000/health) | API status endpoint |

### Default Credentials

| Role | Username | Password |
|---|---|---|
| **Admin** | `admin` | `admin123` |
| **Volunteer** | Register via the login page | — |

---

## 5. Test the Full Pipeline

You can test the entire flow using `curl` — no Twilio account needed:

```bash
# 1. Register a volunteer
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rahul Sharma",
    "phone": "+919876543210",
    "password": "pass123",
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
    "location": {"lat": 21.15, "lng": 79.09}
  }'

# 2. Simulate a voice-reported accident
curl -X POST "http://localhost:8000/api/v1/voice/report?location=NH44+near+Nagpur" \
  -d "SpeechResult=Major+truck+accident+with+5+people+trapped+fire+spreading&Confidence=0.9&From=+919876543210"

# 3. Open the dashboard to see the incident
# → http://localhost:3000/login (login as admin/admin123)

# 4. Check tasks
curl http://localhost:8000/api/v1/tasks/

# 5. Verify a task (triggers blockchain reward if configured)
curl -X PATCH http://localhost:8000/api/v1/tasks/{TASK_ID} \
  -H "Content-Type: application/json" \
  -d '{"status": "verified"}'
```

---

## 6. Blockchain Setup (Optional)

If you want blockchain rewards to work:

### Deploy the Smart Contract

```bash
# Install Node.js 20+ locally (only needed for contract deployment)
cd blockchain
npm install
npx hardhat compile
npx hardhat test                                 # 8 passing tests
npx hardhat run scripts/deploy.js --network amoy  # Deploy to Polygon Amoy
```

After deployment, update your `.env`:

```dotenv
WEB3_PROVIDER_URL=https://rpc-amoy.polygon.technology
REWARD_CONTRACT_ADDRESS=0xYourDeployedContractAddress
DEPLOYER_PRIVATE_KEY=your_deployer_private_key
```

Then restart the backend:

```bash
docker compose restart backend
```

### Fund the Reward Pool

Send test MATIC to the contract address via [Polygon Amoy Faucet](https://faucet.polygon.technology/).

---

## Common Commands

### Service Management

```bash
# Start all services
docker compose up -d

# Start all services (rebuild images)
docker compose up --build -d

# Stop all services
docker compose down

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Restart a single service
docker compose restart backend
```

### Database

```bash
# Connect to PostgreSQL shell
docker exec -it smartaccident_db psql -U smartaccident -d smartaccident_db

# Check tables
docker exec smartaccident_db psql -U smartaccident -d smartaccident_db -c "\dt public.*"

# Check PostGIS extensions
docker exec smartaccident_db psql -U smartaccident -d smartaccident_db -c "\dx"

# Reset database (CAUTION: deletes all data)
docker compose down -v
docker compose up --build -d
```

### Run Migrations Manually

```bash
docker exec smartaccident_backend alembic upgrade head
docker exec smartaccident_backend alembic current
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `port 5432 already in use` | Stop local PostgreSQL: `sudo systemctl stop postgresql` (Linux) or stop PostgreSQL in Windows Services |
| `port 3000 already in use` | Kill the process: `lsof -ti:3000 \| xargs kill` |
| `port 8000 already in use` | Kill the process: `lsof -ti:8000 \| xargs kill` |
| Backend keeps restarting | Check logs: `docker compose logs backend` — likely a DB connection issue |
| Frontend build fails | Delete volumes and rebuild: `docker compose down -v && docker compose up --build -d` |
| `docker compose` not found | Upgrade Docker Desktop or install `docker-compose-plugin` |
| WSL/Hyper-V issues (Windows) | Enable WSL2 and Hyper-V in Windows Features, restart Docker Desktop |
| Container `unhealthy` | Wait 30s for DB to initialize, then check: `docker compose ps` |

---

## Project Structure

```
HackByte4.0/
├── backend/                        # FastAPI Backend
│   ├── src/
│   │   ├── config/                 # Settings + async DB engine
│   │   ├── models/                 # SQLAlchemy ORM (Accident, Volunteer, Task)
│   │   ├── schemas/                # Pydantic v2 request/response schemas
│   │   ├── routes/                 # REST + WebSocket + Twilio TwiML handlers
│   │   ├── services/               # Business logic (dispatch, ML, blockchain, etc.)
│   │   └── main.py                 # FastAPI app entry point
│   ├── alembic/                    # Database migrations
│   ├── requirements.txt            # Python dependencies
│   └── Dockerfile                  # Backend container definition
│
├── frontend/                       # Next.js 16 Dashboard + Volunteer Portal
│   └── src/
│       ├── app/                    # Pages: landing, login, dashboard/*, portal
│       ├── components/             # WebSocket, Maps, Navbar, Sidebar
│       └── lib/api.ts              # API client + TypeScript types
│   ├── Dockerfile                  # Frontend container definition
│
├── blockchain/                     # Solidity Smart Contracts
│   ├── contracts/RewardPool.sol    # Volunteer reward pool (OpenZeppelin)
│   ├── scripts/deploy.js           # Deployment script (Polygon Amoy)
│   ├── test/RewardPool.test.js     # 8 passing tests
│   └── hardhat.config.js           # Hardhat config (Amoy testnet)
│
├── ml-model/                       # ML Model Training
│   ├── train.py                    # TF-IDF + GradientBoosting trainer
│   └── training_data.csv           # 600 synthetic accident reports
│
├── docker-compose.yml              # All services: DB + Backend + Frontend
├── .env.example                    # Environment variable template
└── SETUP.md                        # ← You are here
```
