# Addition MR Push API

This backend connects to MongoDB and provides APIs for contact messages and
protected login activity records. It does not implement user registration or login.

## Deploy frontend and API together on Netlify

The root `netlify.toml` builds the Vite frontend and routes `/api/*` requests to
the Express Netlify Function in `backend/netlify/functions/api.js`.

1. Push this project to a Git provider connected to Netlify.
2. In Netlify, import the repository. The included `netlify.toml` sets the build
   command, `dist` publish directory, function directory, and API redirects.
3. In **Site configuration → Environment variables**, add:
   - `MONGODB_URI`: a MongoDB Atlas connection URI. Netlify cannot connect to
     your computer's `127.0.0.1` MongoDB.
   - `API_KEY`: a private random secret of at least 32 characters. Keep it out
     of frontend code and source control.
   - `CLIENT_URL`: your Netlify site origin, such as `https://your-site.netlify.app`.
   - `MONGODB_COLLECTION`: only if your existing login-log collection is not
     named `loginlogs`.
4. Deploy the site, then check `https://your-site.netlify.app/api/health`.
5. To view messages, call `/api/contact-messages` and
   `/api/contact-messages/stats` with the `x-api-key` header. The public contact
   form submits to `/api/contact-messages` without an API key.

Do not set the local MongoDB URI on Netlify. Create an Atlas database, configure
its network access for your deployment, and use the Atlas URI as a Netlify
environment variable. Netlify does not deploy the local `.env` file.

## Setup in PowerShell

From the project root:

```powershell
cd .\backend
Copy-Item .env.example .env
npm install
```

Edit `backend\.env` and set `API_KEY` to a private random value of at least 32
characters. Keep `.env` private and do not commit it. The login activity
collection defaults to `loginlogs`; set `MONGODB_COLLECTION` to the actual
existing collection name if your record is stored elsewhere. Contact messages
are stored separately in `contactmessages`.

Start the backend:

```powershell
npm run dev
```

## Endpoints

- `GET /api/health` — public server and database health check.
- `GET /api/login-logs?page=1&limit=20` — list records; supports `email` and
  `action` filters.
- `GET /api/login-logs/:id` — get a record by MongoDB ObjectId.
- `POST /api/login-logs` — add a record with `Email`, `Action`, and optional
  `Date` and `#` fields.
- `POST /api/contact-messages` — public, rate-limited contact form submission.
- `GET /api/contact-messages?page=1&limit=20` — list contact messages; requires
  the API key and supports an `email` filter.
- `GET /api/contact-messages/stats` — total messages and counts by month;
  requires the API key.

All `/api/login-logs` requests and contact-message read/statistics requests
require the `x-api-key` request header. Contact submissions do not require a key
so a browser form can use the endpoint; submissions are rate limited. The API
does not provide update or delete endpoints for audit records or messages.

The `contactmessages` collection is created with MongoDB JSON Schema validation.
It requires `name`, `email`, `message`, `createdAt`, and `updatedAt`, checks
their BSON types and lengths, and rejects unexpected fields. Mongoose also
validates inputs in the API. Indexes support newest-first listing and email
search. On server startup, the backend applies this validator and ensures both
indexes exist.

## View contact data in MongoDB

In PowerShell, start the Mongo shell:

```powershell
mongosh "mongodb://127.0.0.1:27017/additionmrpush1282025"
```

In `mongosh`, inspect documents, aggregate monthly counts, indexes, and the
MongoDB validator:

```javascript
db.contactmessages.find().sort({ createdAt: -1 }).limit(20).pretty()

db.contactmessages.aggregate([
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m", date: "$createdAt", timezone: "UTC" } },
      count: { $sum: 1 }
    }
  },
  { $sort: { _id: -1 } }
])

db.contactmessages.getIndexes()
db.getCollectionInfos({ name: "contactmessages" })[0].options
```

To check the API record list and monthly aggregation, send the private API key
from PowerShell:

```powershell
$headers = @{ "x-api-key" = "YOUR_PRIVATE_API_KEY" }
Invoke-RestMethod "http://localhost:5001/api/contact-messages" -Headers $headers
Invoke-RestMethod "http://localhost:5001/api/contact-messages/stats" -Headers $headers
```

Public contact-form example:

```powershell
$body = @{
  name = "Your Name"
  email = "you@example.com"
  message = "Hello, I would like to get in touch."
} | ConvertTo-Json

Invoke-RestMethod "http://localhost:5001/api/contact-messages" `
  -Method Post -ContentType "application/json" -Body $body
```

Example PowerShell requests:

```powershell
$headers = @{ "x-api-key" = "YOUR_PRIVATE_API_KEY" }
Invoke-RestMethod "http://localhost:5000/api/login-logs/6aeb514737ed6d91b04160f2" -Headers $headers
Invoke-RestMethod "http://localhost:5000/api/login-logs?email=abdusalimmrpush@gmail.com&action=LOGIN" -Headers $headers
```

Example record body:

```json
{
  "#": 1,
  "Email": "abdusalimmrpush@gmail.com",
  "Date": "2026-11-04T14:39:39.814Z",
  "Action": "LOGIN"
}
```
