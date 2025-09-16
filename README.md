
# Universal Authentication API

## What is the Backend?

The backend is a Django REST Framework API that provides all authentication, user management, and security logic for Universal Auth. It handles:
- User registration, login, and JWT token management
- Email verification and password reset via OTP
- Two-Factor Authentication (2FA) with TOTP (Google Authenticator, Authy, etc.)
- All business logic, validation, and secure storage of user data

The backend lives in the `universal_auth_project/` folder. It exposes REST API endpoints for the frontend or any client to use.

## What is the Frontend?

The frontend is a modern React application (see `universal-auth-frontend/`) that provides a user interface for Universal Auth. It allows users to:
- Register, log in, and manage their profile
- Enable and verify 2FA
- Reset their password
- Interact with all backend API endpoints securely

The frontend connects to the backend via HTTP API calls and handles all user-facing logic and UI/UX.

## Project Purpose

This project provides a robust, production-ready authentication system for Django REST Framework, including:
- User registration and login
- Email verification via OTP
- Password reset via OTP
- Two-Factor Authentication (2FA) with TOTP (Google Authenticator, Authy, etc.)
- JWT-based authentication

It is designed for modern web and mobile apps that require secure user management and authentication flows.

---

## API Endpoints & Usage

### 1. Register
**POST** `/api/v1/register/`
#### Request:
```json
{
  "email": "user@example.com",
  "username": "user1",
  "first_name": "User",
  "last_name": "One",
  "password": "yourpassword"
}
```
#### Response:
```json
{
  "email": "user@example.com",
  "username": "user1",
  "first_name": "User",
  "last_name": "One"
}
```

---

### 2. Send OTP (for email verification or password reset)
**POST** `/api/v1/send-otp/`
#### Request:
```json
{
  "email": "user@example.com"
}
```
#### Response:
```json
{
  "detail": "OTP sent successfully"
}
```

---

### 3. Verify OTP (for email verification)
**POST** `/api/v1/verify-otp/`
#### Request:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```
#### Possible Responses:
- Success:
  ```json
  { "detail": "OTP verified successfully" }
  ```
- Errors:
  ```json
  { "detail": "Invalid OTP" }
  { "detail": "OTP expired" }
  { "detail": "User not found" }
  { "detail": "No OTP generated" }
  ```

---


### 4. Login (with optional 2FA)
**POST** `/api/v1/login/`
#### Request:
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```
#### Possible Responses:
- If 2FA is not enabled:
  ```json
  {
    "user": { ... },
    "refresh": "...",
    "access": "..."
  }
  ```
- If 2FA is enabled:
  ```json
  { "detail": "2FA code required" }
  ```
- Errors:
  ```json
  { "non_field_errors": ["Invalid credentials"] }
  { "non_field_errors": ["Email not verified. Please verify first."] }
  ```

### 5. 2FA Login (if required)
**POST** `/api/v1/2fa/login/`
#### Request:
```json
{
  "email": "user@example.com",
  "password": "yourpassword",
  "code": "123456"  // code from authenticator app
}
```
#### Response (success):
```json
{
  "user": { ... },
  "refresh": "...",
  "access": "..."
}
```
#### Response (invalid code):
```json
{ "detail": "Invalid 2FA code." }
```

---

### 6. Password Reset (send OTP)
**POST** `/api/v1/password-reset/`
#### Request:
```json
{
  "email": "user@example.com"
}
```
#### Response:
```json
{
  "detail": "OTP sent for password reset"
}
```

---

### 7. Password Reset Confirm
**POST** `/api/v1/password-reset-confirm/`
#### Request:
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "newpassword"
}
```
#### Possible Responses:
- Success:
  ```json
  { "detail": "Password reset successfully" }
  ```
- Errors:
  ```json
  { "non_field_errors": ["Invalid or expired OTP."] }
  { "non_field_errors": ["User not found."] }
  ```

---

### 8. Profile (Get/Update)
**GET/PUT** `/api/v1/profile/` (Requires Authorization header)
#### Example GET Response:
```json
{
  "id": "...",
  "email": "user@example.com",
  "username": "user1",
  "first_name": "User",
  "last_name": "One",
  "is_email_verified": true,
  "is_2fa_enabled": false
}
```

---

### 9. 2FA Setup (Enable Two-Factor Authentication)
**POST** `/api/v1/2fa/setup/` (Requires Authorization header)
#### Response:
```json
{
  "qr_code_url": "otpauth://totp/UniversalAuth:user@example.com?secret=...&issuer=UniversalAuth",
  "secret": "..."
}
```
Scan the QR code or enter the secret in your authenticator app.

---

### 10. 2FA Verify (Complete 2FA Setup)
**POST** `/api/v1/2fa/verify/` (Requires Authorization header)
#### Request:
```json
{
  "code": "123456"
}
```
#### Possible Responses:
- Success:
  ```json
  { "detail": "2FA enabled successfully." }
  ```
- Error:
  ```json
  { "detail": "Invalid 2FA code." }
  ```

---

## Authentication
- All endpoints except register, login, send-otp, verify-otp, password-reset, and password-reset-confirm require the `Authorization: Bearer <access_token>` header.
- Use the `refresh` token to obtain a new `access` token when expired.

---


## Demo Practice (Step-by-step)
1. Register a user.
2. Send OTP to email and verify it.
3. Login with email and password.
   - If 2FA is not enabled, you will receive tokens and be logged in.
   - If 2FA is enabled, you will receive `{ "detail": "2FA code required" }`.
4. If 2FA is required, submit email, password, and 2FA code to `/api/v1/2fa/login/` to complete login.
5. (Optional) Enable 2FA and verify with authenticator app.
6. Use access token for profile and other protected endpoints.
7. Test password reset by sending and verifying OTP, then setting a new password.

---

## How to Connect the Frontend (React Example)

You can use any frontend framework. Here’s how to connect a React frontend (like the included `universal-auth-frontend`) to this API:

### 1. Login Flow (with 2FA support)

```js
import { login, twoFALogin } from './utils/api';

// ...in your login form submit handler:
const handleLogin = async (email, password, code) => {
  if (!code) {
    // Step 1: Try normal login
    const res = await login({ email, password });
    if (res.data.detail === '2FA code required') {
      // Show 2FA code input to user
    } else {
      // Login success: save tokens and user info
    }
  } else {
    // Step 2: Submit 2FA code
    const res = await twoFALogin({ email, password, code });
    if (res.data.access) {
      // Login success: save tokens and user info
    } else {
      // Handle invalid 2FA code
    }
  }
};
```

### 2. Protecting Routes
Use the access token in the `Authorization` header for all protected API calls:

```js
axios.get('/api/v1/profile/', {
  headers: { Authorization: `Bearer ${accessToken}` }
});
```

### 3. 2FA Setup
To enable 2FA, call `/api/v1/2fa/setup/` (POST, with Authorization header). Show the returned QR code URL in a QR code component or use a QR code image service.

### 4. Password Reset
Use `/api/v1/password-reset/` and `/api/v1/password-reset-confirm/` as described above.

---

## Project Structure

- `universal_auth_project/` — Django backend (API)
- `universal-auth-frontend/` — React frontend (example implementation)

---

---

## Notes
- This project is for educational/demo purposes. For production, use a proper email backend and secure your secret keys.
- 2FA is optional but highly recommended for security.
- You can extend this project with social login, account lockout, or other features as needed.

---

## Contact
For questions or contributions, open an issue or pull request.
