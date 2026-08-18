# School SSO Setup

This app supports Single Sign-On (SSO) so students and staff can sign in with
their existing **Google Workspace for Education** or **Microsoft Entra ID**
(formerly Azure AD) school accounts. Authentication is handled by
[Auth.js v5 (NextAuth)](https://authjs.dev) using each provider's OAuth 2.0 /
OpenID Connect endpoints.

You can enable **either or both** providers — the login page automatically shows
a button only for the ecosystems you configure.

This guide is written for **school IT administrators** who register the OAuth
apps and hand the resulting credentials to whoever operates the deployment
(they get entered in the Render dashboard, never committed to source).

---

## How it works

- All application routes are protected by `middleware.ts`. Unauthenticated
  visitors are redirected to `/login`.
- `/login` offers "Sign in with Google" and/or "Sign in with Microsoft".
- On success, Auth.js persists the user and their linked account to the database
  (via the Prisma adapter) and issues a signed session cookie.
- Login outcomes are recorded to Honeycomb as OpenTelemetry span events
  (`sso_login_success`, `sso_login_failure`).

### Redirect (callback) URLs

Every OAuth app you register needs the app's **callback URL** allow-listed. The
pattern is:

```
https://YOUR_APP_DOMAIN/api/auth/callback/<provider>
```

| Provider          | Callback URL                                                        |
| ----------------- | ------------------------------------------------------------------- |
| Google            | `https://YOUR_APP_DOMAIN/api/auth/callback/google`                  |
| Microsoft Entra   | `https://YOUR_APP_DOMAIN/api/auth/callback/microsoft-entra-id`      |

For local development, replace `https://YOUR_APP_DOMAIN` with
`http://localhost:3000`.

---

## 1. Google Workspace for Education

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and
   select (or create) a project owned by your school's organization.
2. **APIs & Services → OAuth consent screen**
   - User type: **Internal** (restricts sign-in to your school's Workspace
     domain — recommended).
   - Fill in the app name, support email, and authorized domain
     (`YOUR_APP_DOMAIN`).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**.
   - **Authorized redirect URIs:** add
     `https://YOUR_APP_DOMAIN/api/auth/callback/google`
     (and the `localhost` variant for development).
4. Copy the generated **Client ID** and **Client secret**.
5. Provide them to the deployment operator as:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

---

## 2. Microsoft Entra ID (Azure AD)

1. In the [Microsoft Entra admin center](https://entra.microsoft.com/) go to
   **Identity → Applications → App registrations → New registration**.
2. Name the app, and under **Supported account types** choose
   **Accounts in this organizational directory only** (single tenant — restricts
   sign-in to your school's tenant).
3. Under **Redirect URI**, select platform **Web** and enter
   `https://YOUR_APP_DOMAIN/api/auth/callback/microsoft-entra-id`.
4. After creation, from the app's **Overview** page copy:
   - **Application (client) ID** → `AZURE_AD_CLIENT_ID`
   - **Directory (tenant) ID** → `AZURE_AD_TENANT_ID`
5. Go to **Certificates & secrets → New client secret**, create one, and copy
   its **Value** (not the Secret ID) → `AZURE_AD_CLIENT_SECRET`.
6. Under **API permissions**, ensure the delegated Microsoft Graph permissions
   `openid`, `profile`, and `email` are granted (they are present by default).

---

## 3. Deployment configuration

Set the following environment variables in the **Render dashboard** (or your
host of choice). See `.env.example` for the full list.

| Variable                | Required | Purpose                                              |
| ----------------------- | -------- | ---------------------------------------------------- |
| `AUTH_SECRET`           | Yes      | Signs session cookies. `openssl rand -base64 32`.    |
| `AUTH_TRUST_HOST`       | Yes\*    | Set to `true` off-Vercel (Render, Docker).           |
| `GOOGLE_CLIENT_ID`      | Google   | Google OAuth client id.                              |
| `GOOGLE_CLIENT_SECRET`  | Google   | Google OAuth client secret.                          |
| `AZURE_AD_CLIENT_ID`    | Entra    | Entra application (client) id.                        |
| `AZURE_AD_CLIENT_SECRET`| Entra    | Entra client secret **value**.                       |
| `AZURE_AD_TENANT_ID`    | Entra    | Entra directory (tenant) id.                          |

\* Not needed on Vercel, which sets the host automatically.

A provider is only enabled when **all** of its variables are present, so you can
run Google-only, Microsoft-only, or both.

### Database migration

The SSO tables ship as a Prisma migration
(`prisma/migrations/20260725_add_auth_tables`). It is applied automatically on
deploy — the container's start command runs `npx prisma migrate deploy` before
starting the server.

### Restricting who can sign in

Two independent layers control access:

1. **Provider tenant restriction** — choosing "Internal" (Google) / single-tenant
   (Entra) above limits sign-in to accounts in your school's directory.
2. **Soft-launch allow-list** — `SOFT_LAUNCH_ALLOWLIST` (comma-separated emails)
   further limits access to a named cohort during a phased rollout. Leave it
   unset to allow every authenticated school user.

---

## Troubleshooting

- **`redirect_uri_mismatch`** — the callback URL registered with the provider
  does not exactly match `https://YOUR_APP_DOMAIN/api/auth/callback/<provider>`.
  Check for http vs https, trailing slashes, and the exact provider slug.
- **The provider's button is missing on `/login`** — its environment variables
  are not all set; the app hides unconfigured providers.
- **`MissingSecret` / cookie errors** — `AUTH_SECRET` is not set.
- **Callback works locally but not in production** — set `AUTH_TRUST_HOST=true`
  on non-Vercel hosts.
