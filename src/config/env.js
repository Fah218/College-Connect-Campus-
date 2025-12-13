export const config = {
  appName: import.meta.env.VITE_APP_NAME || 'CampusConnect',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  environment: import.meta.env.VITE_ENV || 'development',
  features: {
    notifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    recommendations: import.meta.env.VITE_ENABLE_RECOMMENDATIONS === 'true'
  }
}

export const isDevelopment = config.environment === 'development'
export const isProduction = config.environment === 'production'
