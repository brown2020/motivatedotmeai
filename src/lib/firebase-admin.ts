import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as {
      project_id: string;
      private_key: string;
      client_email: string;
    };
  } catch {
    throw new Error(
      "Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON. Provide the full service account JSON string."
    );
  }
}

export function getAdminAuth() {
  if (!getApps().length) {
    const serviceAccount = getServiceAccount();
    if (!serviceAccount) {
      throw new Error(
        "Missing FIREBASE_SERVICE_ACCOUNT_KEY. Needed to create/verify session cookies."
      );
    }

    initializeApp({
      credential: cert(serviceAccount as never),
      projectId: serviceAccount.project_id,
    });
  }

  return getAuth();
}
