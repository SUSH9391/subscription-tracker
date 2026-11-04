#!/usr/bin/env bash
# ============================================================
# Subscription Tracker — HTTPie test runner
# Usage: bash tests/run-tests.sh
# Requires: httpie (pip install httpie)
# ============================================================

BASE="http://localhost:5500/api/v1"

echo ""
echo "============================================"
echo "  SUBSCRIPTION TRACKER - HTTPie Test Suite"
echo "============================================"
echo ""

# ── HEALTH CHECK ────────────────────────────────────────────
echo "▶ [HEALTH] GET /"
http --check-status GET http://localhost:5500/ && echo "✅ PASS" || echo "❌ FAIL"
echo ""

# ── AUTH: SIGN UP ───────────────────────────────────────────
echo "▶ [AUTH] POST /auth/sign-up"
SIGNUP_RESPONSE=$(http --ignore-stdin POST "$BASE/auth/sign-up" \
  name="Test User" \
  email="testuser@example.com" \
  password="Password123" 2>/dev/null)

echo "$SIGNUP_RESPONSE"

TOKEN=$(echo "$SIGNUP_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['token'])" 2>/dev/null)
USER_ID=$(echo "$SIGNUP_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['user']['_id'])" 2>/dev/null)

if [ -n "$TOKEN" ]; then
  echo "✅ PASS — TOKEN captured"
else
  echo "⚠️  Sign-up may have failed or user already exists. Trying sign-in..."
  SIGNIN_RESPONSE=$(http --ignore-stdin POST "$BASE/auth/sign-in" \
    email="testuser@example.com" \
    password="Password123" 2>/dev/null)
  echo "$SIGNIN_RESPONSE"
  TOKEN=$(echo "$SIGNIN_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['token'])" 2>/dev/null)
  USER_ID=$(echo "$SIGNIN_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['user']['_id'])" 2>/dev/null)
fi

echo ""
echo "📌 USER_ID: $USER_ID"
echo "📌 TOKEN:   ${TOKEN:0:40}..."
echo ""

# ── AUTH: DUPLICATE SIGN UP (expect 409) ────────────────────
echo "▶ [AUTH] POST /auth/sign-up — duplicate (expect 409)"
http POST "$BASE/auth/sign-up" \
  name="Test User" \
  email="testuser@example.com" \
  password="Password123"
echo ""

# ── AUTH: SIGN IN ───────────────────────────────────────────
echo "▶ [AUTH] POST /auth/sign-in"
http POST "$BASE/auth/sign-in" \
  email="testuser@example.com" \
  password="Password123"
echo ""

# ── USERS ───────────────────────────────────────────────────
echo "▶ [USERS] GET /users"
http GET "$BASE/users" "Authorization:Bearer $TOKEN"
echo ""

echo "▶ [USERS] GET /users/$USER_ID"
http GET "$BASE/users/$USER_ID" "Authorization:Bearer $TOKEN"
echo ""

echo "▶ [USERS] PUT /users/$USER_ID"
http PUT "$BASE/users/$USER_ID" "Authorization:Bearer $TOKEN" name="Updated Name"
echo ""

# ── SUBSCRIPTIONS ───────────────────────────────────────────
echo "▶ [SUBS] GET /subscriptions"
http GET "$BASE/subscriptions" "Authorization:Bearer $TOKEN"
echo ""

echo "▶ [SUBS] POST /subscriptions — valid"
SUB_RESPONSE=$(http --ignore-stdin POST "$BASE/subscriptions" \
  "Authorization:Bearer $TOKEN" \
  name="Netflix" \
  price:=15.99 \
  currency="USD" \
  frequency="monthly" \
  category="entertainment" \
  status="active" \
  startDate="2026-10-01T00:00:00.000Z" \
  renewalDate="2026-11-01T00:00:00.000Z" \
  user="$USER_ID" 2>/dev/null)
echo "$SUB_RESPONSE"
SUB_ID=$(echo "$SUB_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('_id',''))" 2>/dev/null)
echo "📌 SUB_ID: $SUB_ID"
echo ""

echo "▶ [SUBS] POST /subscriptions — missing fields (expect 400)"
http POST "$BASE/subscriptions" \
  "Authorization:Bearer $TOKEN" \
  price:=10 \
  currency="USD"
echo ""

echo "▶ [SUBS] POST /subscriptions — invalid enum (expect 400)"
http POST "$BASE/subscriptions" \
  "Authorization:Bearer $TOKEN" \
  name="BadSub" \
  price:=10 \
  currency="USD" \
  frequency="biweekly" \
  category="entertainment" \
  startDate="2026-10-01T00:00:00.000Z" \
  renewalDate="2026-11-01T00:00:00.000Z" \
  user="$USER_ID"
echo ""

if [ -n "$SUB_ID" ]; then
  echo "▶ [SUBS] GET /subscriptions/$SUB_ID"
  http GET "$BASE/subscriptions/$SUB_ID" "Authorization:Bearer $TOKEN"
  echo ""

  echo "▶ [SUBS] PUT /subscriptions/$SUB_ID"
  http PUT "$BASE/subscriptions/$SUB_ID" "Authorization:Bearer $TOKEN" price:=19.99
  echo ""

  echo "▶ [SUBS] PUT /subscriptions/$SUB_ID/cancle"
  http PUT "$BASE/subscriptions/$SUB_ID/cancle" "Authorization:Bearer $TOKEN"
  echo ""

  echo "▶ [SUBS] DELETE /subscriptions/$SUB_ID"
  http DELETE "$BASE/subscriptions/$SUB_ID" "Authorization:Bearer $TOKEN"
  echo ""
else
  echo "⚠️  Skipping sub detail tests — no SUB_ID captured (controller not yet implemented?)"
  echo ""
fi

echo "▶ [SUBS] GET /subscriptions/user/$USER_ID"
http GET "$BASE/subscriptions/user/$USER_ID" "Authorization:Bearer $TOKEN"
echo ""

echo "▶ [SUBS] GET /subscriptions/upcoming-renewals"
http GET "$BASE/subscriptions/upcoming-renewals" "Authorization:Bearer $TOKEN"
echo ""

# ── SIGN OUT ────────────────────────────────────────────────
echo "▶ [AUTH] POST /auth/sign-out"
http POST "$BASE/auth/sign-out" "Authorization:Bearer $TOKEN"
echo ""

echo "============================================"
echo "  ✅ Test run complete"
echo "============================================"

