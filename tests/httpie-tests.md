# 🧪 Subscription Tracker — HTTPie Test Guide

Base URL: `http://localhost:5500/api/v1`

> **Before you start:** Run the server with `npm run dev`, then copy the `token` from sign-up/sign-in and replace `<TOKEN>` in all authenticated requests.

---

## 🔐 Auth Routes (`/api/v1/auth`)

### 1. Sign Up

```bash
http POST http://localhost:5500/api/v1/auth/sign-up \
  name="John Doe" \
  email="john@example.com" \
  password="Password123"
```

**Expected:** `201 Created`
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "token": "<jwt-token>",
    "user": { "_id": "...", "name": "John Doe", "email": "john@example.com" }
  }
}
```

---

### 2. Sign In

```bash
http POST http://localhost:5500/api/v1/auth/sign-in \
  email="john@example.com" \
  password="Password123"
```

**Expected:** `200 OK` with token

---

### 3. Sign Out

```bash
http POST http://localhost:5500/api/v1/auth/sign-out \
  "Authorization:Bearer <TOKEN>"
```

**Expected:** `200 OK`

---

### 4. Duplicate Sign Up (error case)

```bash
http POST http://localhost:5500/api/v1/auth/sign-up \
  name="John Doe" \
  email="john@example.com" \
  password="Password123"
```

**Expected:** `409 Conflict` — `"User already exists"`

---

## 👤 User Routes (`/api/v1/users`)

> Replace `<USER_ID>` with a real MongoDB ObjectId from the sign-up response.

### 5. Get All Users

```bash
http GET http://localhost:5500/api/v1/users \
  "Authorization:Bearer <TOKEN>"
```

### 6. Get User by ID

```bash
http GET http://localhost:5500/api/v1/users/<USER_ID> \
  "Authorization:Bearer <TOKEN>"
```

### 7. Create User

```bash
http POST http://localhost:5500/api/v1/users \
  "Authorization:Bearer <TOKEN>" \
  name="Jane Doe" \
  email="jane@example.com"
```

### 8. Update User

```bash
http PUT http://localhost:5500/api/v1/users/<USER_ID> \
  "Authorization:Bearer <TOKEN>" \
  name="John Updated"
```

### 9. Delete User

```bash
http DELETE http://localhost:5500/api/v1/users \
  "Authorization:Bearer <TOKEN>"
```

---

## 📋 Subscription Routes (`/api/v1/subscriptions`)

> Replace `<TOKEN>`, `<USER_ID>`, `<SUB_ID>` with real values.

### 10. Get All Subscriptions

```bash
http GET http://localhost:5500/api/v1/subscriptions \
  "Authorization:Bearer <TOKEN>"
```

### 11. Get Subscription by ID

```bash
http GET http://localhost:5500/api/v1/subscriptions/<SUB_ID> \
  "Authorization:Bearer <TOKEN>"
```

### 12. Create Subscription (valid)

```bash
http POST http://localhost:5500/api/v1/subscriptions \
  "Authorization:Bearer <TOKEN>" \
  name="Netflix" \
  price:=15.99 \
  currency="USD" \
  frequency="monthly" \
  category="entertainment" \
  status="active" \
  startDate="2026-10-01T00:00:00.000Z" \
  renewalDate="2026-11-01T00:00:00.000Z" \
  user="<USER_ID>"
```

**Expected:** `200 OK`

---

### 13. Create Subscription — missing required field (error case)

```bash
http POST http://localhost:5500/api/v1/subscriptions \
  "Authorization:Bearer <TOKEN>" \
  price:=15.99 \
  currency="USD"
```

**Expected:** `400 Bad Request` — validation error for missing `name`, `category`, etc.

---

### 14. Create Subscription — invalid enum value (error case)

```bash
http POST http://localhost:5500/api/v1/subscriptions \
  "Authorization:Bearer <TOKEN>" \
  name="Bad Sub" \
  price:=10 \
  currency="USD" \
  frequency="biweekly" \
  category="entertainment" \
  startDate="2026-10-01T00:00:00.000Z" \
  renewalDate="2026-11-01T00:00:00.000Z" \
  user="<USER_ID>"
```

**Expected:** `400 Bad Request` — `frequency` is not a valid enum value

---

### 15. Update Subscription

```bash
http PUT http://localhost:5500/api/v1/subscriptions/<SUB_ID> \
  "Authorization:Bearer <TOKEN>" \
  price:=19.99
```

### 16. Delete Subscription

```bash
http DELETE http://localhost:5500/api/v1/subscriptions/<SUB_ID> \
  "Authorization:Bearer <TOKEN>"
```

### 17. Get All Subscriptions for a User

```bash
http GET http://localhost:5500/api/v1/subscriptions/user/<USER_ID> \
  "Authorization:Bearer <TOKEN>"
```

### 18. Cancel Subscription

```bash
http PUT http://localhost:5500/api/v1/subscriptions/<SUB_ID>/cancle \
  "Authorization:Bearer <TOKEN>"
```

> ⚠️ Note: Route is spelled `cancle` (typo) in `subscription.router.js` — use it as-is.

---

### 19. Get Upcoming Renewals

```bash
http GET http://localhost:5500/api/v1/subscriptions/upcoming-renewals \
  "Authorization:Bearer <TOKEN>"
```

---

## 🏠 Health Check

```bash
http GET http://localhost:5500/
```

**Expected:** `200 OK` — `Hello World!`

---

## 💡 Tips

| Tip | Command |
|-----|---------|
| Save token to env var | `export TOKEN=paste_token_here` |
| Use token variable | `"Authorization:Bearer $TOKEN"` |
| Verbose (show headers) | Add `-v` flag |
| Print headers only | Add `--print=h` flag |
| Send raw JSON | `echo '{"key":"val"}' \| http POST <url>` |
| Watch response status | `http --check-status POST ...` (exits non-zero on 4xx/5xx) |

