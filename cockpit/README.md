# AI Platform Cockpit

A zero-dependency (Node 18+) control-tower web app to monitor and control the platform components: start, stop, restart, health, replicas, resource usage, configuration parameters and an activity log.

```bash
cd cockpit
npm start                   # http://localhost:8080
npm test
docker compose up --build   # deploy alongside the other components
```

- `COCKPIT_TOKEN`: when set, `/api/*` requires a bearer token in the `Authorization` header (`/healthz` stays open). Put the app behind your gateway or SSO for production.
- `PORT`: listen port in the container or process (default 8080).
- `COCKPIT_PORT`: published host port for `docker compose` (default 8080). The compose file binds to `127.0.0.1` by default so the cockpit is not exposed on every interface.

API: `GET /api/summary`, `GET /api/components`, `GET /api/components/:id`, `POST /api/components/:id/{start|stop|restart}`, `PUT /api/components/:id/config` (JSON patch of known parameters plus `replicas`), `POST /api/actions/{start|stop|restart}-all`, `GET /api/events`.

The component state is simulated in memory (`registry.js`). Replace its adapters with Kubernetes, Argo CD or each tool's admin API to drive real components.
