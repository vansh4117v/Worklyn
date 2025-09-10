// Environment validation for client-side
const requiredEnvVars = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
  
  if (import.meta.env.PROD) {
    // In production, throw an error to prevent the app from running
    throw new Error(errorMessage);
  } else {
    // In development, log a warning
    console.warn(errorMessage);
  }
}

export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};
