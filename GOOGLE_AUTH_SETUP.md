# Google Authentication Setup Guide

This guide explains how to set up Google Authentication for the WelthWest application.

## 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add a name for your OAuth client
7. Add authorized JavaScript origins:
   - For development: `http://localhost:3000`
   - For production: `https://your-domain.com`
8. Add authorized redirect URIs:
   - For development: `http://localhost:3000`
   - For production: `https://your-domain.com`
9. Click "Create" and note your Client ID and Client Secret

## 2. Configure Frontend Environment Variables

Create a `.env` file in the root of the WelthWestClientSharing directory with the following content:

```
# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-goes-here

# API Configuration
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000/api/ws
```

Replace `your-google-client-id-goes-here` with the Client ID you obtained from the Google Cloud Console.

## 3. Configure Backend Environment Variables

Add the following to your `.env` file in the WelthWestServer2 directory:

```
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-goes-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-goes-here
```

Replace the placeholder values with your actual Google OAuth credentials.

## 4. Testing Google Authentication

1. Start your backend server:
   ```
   cd WelthWestServer2
   python run.py
   ```

2. Start your frontend development server:
   ```
   cd WelthWestClientSharing
   npm start
   ```

3. Navigate to the login page and click the "Continue with Google" button
4. Select your Google account
5. You should be automatically logged in and redirected to the dashboard

## Troubleshooting

- If you see "Error 400: redirect_uri_mismatch", make sure the redirect URI in your Google Cloud Console matches the URI of your application.
- If you see "Invalid Client ID", double-check that you've correctly set the REACT_APP_GOOGLE_CLIENT_ID in your frontend .env file.
- If you see "Invalid token", ensure that your GOOGLE_CLIENT_ID in the backend .env file matches the Client ID from Google Cloud Console.