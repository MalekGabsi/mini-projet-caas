# Mini projet : prise de rendez-vous (microservices, MERN)

## Objectif MVP

- Voir les créneaux disponibles d’un pro.
- Réserver un créneau.
- Voir / annuler ses rendez-vous.

## Architecture

- **API Gateway** (Express) : point d’entrée unique.
- **User Service** : inscription / connexion.
- **Availability Service** : gestion des slots.
- **Appointment Service** : réservation / annulation.
- **MongoDB** : persistance.

## Démarrage rapide

```bash
docker compose up --build
```

Les services démarrent sur :

- Gateway : http://localhost:3000
- User Service : http://localhost:4001
- Availability Service : http://localhost:4002
- Appointment Service : http://localhost:4003

## Modèle de données

- **users**: `{ _id, name, email, passwordHash, role }`
- **slots**: `{ _id, proId, start, end, status }`
- **appointments**: `{ _id, userId, proId, slotId, status }`

## Routes (via gateway)

### User Service
- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/pros`

### Availability Service
- `GET /api/availability/:proId?from=...&to=...`
- `POST /api/availability/:proId/slots`
- `PATCH /api/availability/slots/:id/hold`

### Appointment Service
- `POST /api/appointments`
- `GET /api/appointments?userId=...`
- `DELETE /api/appointments/:id`

## Réservation sans double-booking (HOLD)

1. Le client demande un `hold` sur le slot (`FREE → HELD`).
2. Si ok, création du rendez-vous.
3. Le slot passe à `BOOKED`.

## Frontend

Le dossier `frontend/` est prêt à recevoir un projet React (Vite) minimal pour les pages MVP.
