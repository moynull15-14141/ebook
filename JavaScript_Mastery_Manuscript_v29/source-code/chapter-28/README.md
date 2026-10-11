# DeployReady Travel Operations API (Educational)

Requires Node.js 20+. Run `npm test`, then `npm start`. Test endpoints:

```bash
curl -i http://localhost:3000/health/live
curl -i http://localhost:3000/health/ready
curl -i http://localhost:3000/metrics
curl -i -X POST http://localhost:3000/api/jobs -H 'content-type: application/json' -d '{"title":"Check itinerary"}'
curl -i http://localhost:3000/api/jobs
```

Docker (if installed): `docker compose up --build`. CI workflow is an example; GitHub Actions has not been executed here.

**Limitations:** In-memory data is lost on restart; no authentication, database, TLS termination, rate limiting, distributed metrics, or deployment credentials. Do not expose this demo as a production service. For production use an authenticated API, persistent database, external observability, secret manager, image scanning and rollback plan.
