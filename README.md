# Vortemis Mobile

Expo (React Native + TypeScript) client for **Vortemis.io**. It is a live
operator dashboard that reads the `/v1` API: flows, anomalies, anomaly rate,
MITRE tactic distribution, an anomalies-over-time chart and the most recent
detections, refreshed every three seconds.

## Run

```bash
npm install
npx expo start --tunnel
```

Scan the QR code with **Expo Go**. The tunnel QR works even when the phone and
the computer are on different networks.

## API base

The login screen has an **API base** field. It defaults to the current demo
tunnel and can be pointed at any reachable `/v1` endpoint (for example
`http://192.168.0.95:8000` on the same LAN).

Native apps are not subject to browser CORS, so the API needs no allowlist
change for the mobile client.

## Screens

- **Login**: username, password and API base.
- **Live**: KPIs, tactic distribution, timeline and recent detections.
- **System**: engine metadata, feature baseline, session details and the
  MITRE tactic catalog.

The console uses a bottom tab bar (Live / System) and respects the device safe
area, so the header stays clear of the status bar and notch.

## Auth and storage

- Tokens are stored with `expo-secure-store`.
- Access tokens rotate through `/v1/auth/refresh`; a rejected refresh clears the
  session and returns to the login screen.
- The theme matches the web console: violet on near-black.

## Stack

- Expo SDK 58, React Native 0.88, React 19.
- `expo-secure-store` for tokens.
- `react-native-svg` for the timeline chart.
