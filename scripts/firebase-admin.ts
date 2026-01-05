// scripts/firebase-admin.ts
import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  try {
    // Option 1: Using service account key file (create this from Firebase Console)
    const serviceAccountPath = join(process.cwd(), 'service-account-key.json');
    
    let serviceAccount;
    try {
      const serviceAccountFile = readFileSync(serviceAccountPath, 'utf8');
      serviceAccount = JSON.parse(serviceAccountFile);
    } catch (error) {
      console.log('Service account key not found, using environment variables...');
      
      // Option 2: Using environment variables
      serviceAccount = {
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
      };
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
      });
    }
    
    console.log('Firebase Admin initialized successfully');
    return admin;
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
};

export { initializeFirebaseAdmin };