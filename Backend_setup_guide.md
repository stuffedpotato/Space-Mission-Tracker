# Backend Setup Guide (Node.js + OracleDB)

## 1. Install Node.js

Ensure Node.js and npm are installed:

```bash
node -v
npm -v
```

If not installed, download from: [https://nodejs.org](https://nodejs.org)

---

## 2. Install Oracle Instant Client (Optional)

Download from: [https://www.oracle.com/database/technologies/instant-client.html](https://www.oracle.com/database/technologies/instant-client.html)

### After Download:

- **Mac/Linux:** Extract and set environment variable:

```bash
export LD_LIBRARY_PATH=/path/to/instantclient:$LD_LIBRARY_PATH
```

- **Windows:** Add the extracted folder to your System PATH.

---

## 3. Install Backend Dependencies

Navigate to the backend folder:

```bash
cd oracle-backend
npm install
```

This installs:

- `express`: Web server framework
- `oracledb`: Oracle DB driver
- `cors`: Enables frontend requests (if needed)

If needed, install CORS:

```bash
npm install cors
```

---

## 4. Oracle DB Configuration

In `server.js`, the Oracle DB is configured to:

```js
const dbConfig = {
  user: 'system',
  password: 'oracle',
  connectString: 'localhost:1521/XEPDB1'
};
```

Modify if your DB uses different credentials.

---

## 5. Start Oracle XE (via Docker)

If using Docker:

```bash
docker run --platform linux/amd64 -d -p 1521:1521 -p 5500:5500 \
  --name oracle-xe \
  -e ORACLE_PASSWORD=oracle \
  gvenzl/oracle-xe:latest
```

---

## 6. Initialize the Database

Run the setup script:

```bash
node setupDB.js
```

This creates tables and inserts sample data.

---

## 7. Start the Backend Server

Run:

```bash
node server.js
```

You should see:

```
🚀 Server running at http://localhost:3001
Test endpoints:
  GET /test
  GET /missions
  GET /astronauts
  GET /assignments
  GET /mission-logs
```

---

## 8. Test Endpoints

Open browser:

- [http://localhost:3001/test](http://localhost:3001/test)
- Other endpoints return JSON from the Oracle DB.

---

## 9. Frontend Access

Frontend (React) can fetch data from these endpoints. Ensure CORS is enabled if backend and frontend run on different ports.

---

## Notes:

- Ensure Oracle Instant Client is installed and correctly referenced.
- Docker image is lightweight and ideal for development.
- Use `setupDB.js` whenever you need to reset the database.

