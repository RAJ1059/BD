import dotenv from 'dotenv'

dotenv.config()

function required(name, fallback) {
  const value = process.env[name] ?? fallback
  return value
}

export const env = {
  nodeEnv: required('NODE_ENV', 'development'),
  isProd: process.env.NODE_ENV === 'production',
  port: Number(required('PORT', 5000)),
  appName: required('APP_NAME', 'Business Direction Admin'),
  apiBaseUrl: required('API_BASE_URL', 'http://localhost:5000'),
  clientUrl: required('CLIENT_URL', 'http://localhost:5173'),
  adminClientUrl: required('ADMIN_CLIENT_URL', 'http://localhost:5175'),

  mongoUri: required('MONGO_URI', 'mongodb://127.0.0.1:27017/bd_admin'),

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', 'dev_access_secret'),
    accessExpires: required('JWT_ACCESS_EXPIRES', '15m'),
    refreshSecret: required('JWT_REFRESH_SECRET', 'dev_refresh_secret'),
    refreshExpires: required('JWT_REFRESH_EXPIRES', '7d'),
    refreshExpiresRememberMe: required('JWT_REFRESH_EXPIRES_REMEMBER_ME', '30d'),
  },

  cookieSecret: required('COOKIE_SECRET', 'dev_cookie_secret'),

  seedSuperAdmin: {
    name: required('SEED_SUPER_ADMIN_NAME', 'Super Admin'),
    email: required('SEED_SUPER_ADMIN_EMAIL', 'superadmin@businessdirection.com'),
    password: required('SEED_SUPER_ADMIN_PASSWORD', 'ChangeMe@12345'),
  },

  storage: {
    driver: required('STORAGE_DRIVER', 'local'),
    localDir: required('LOCAL_UPLOAD_DIR', 'uploads'),
    maxUploadMb: Number(required('MAX_UPLOAD_MB', 15)),
    aws: {
      region: required('AWS_REGION', ''),
      accessKeyId: required('AWS_ACCESS_KEY_ID', ''),
      secretAccessKey: required('AWS_SECRET_ACCESS_KEY', ''),
      bucket: required('AWS_S3_BUCKET', ''),
    },
    cloudinary: {
      cloudName: required('CLOUDINARY_CLOUD_NAME', ''),
      apiKey: required('CLOUDINARY_API_KEY', ''),
      apiSecret: required('CLOUDINARY_API_SECRET', ''),
      url: required('CLOUDINARY_URL', ''),
      folder: required('CLOUDINARY_FOLDER', 'business-direction'),
    },
  },

  mail: {
    driver: required('MAIL_DRIVER', 'smtp'),
    host: required('SMTP_HOST', ''),
    port: Number(required('SMTP_PORT', 587)),
    secure: required('SMTP_SECURE', 'false') === 'true',
    user: required('SMTP_USER', ''),
    pass: required('SMTP_PASS', ''),
    from: required('MAIL_FROM', 'Business Direction <no-reply@businessdirection.com>'),
  },

  sendgridApiKey: required('SENDGRID_API_KEY', ''),
  mailgunApiKey: required('MAILGUN_API_KEY', ''),
  mailgunDomain: required('MAILGUN_DOMAIN', ''),

  awsSes: {
    region: required('AWS_SES_REGION', required('AWS_REGION', '')),
    accessKeyId: required('AWS_SES_ACCESS_KEY_ID', ''),
    secretAccessKey: required('AWS_SES_SECRET_ACCESS_KEY', ''),
  },

  notifications: {
    slackWebhookUrl: required('SLACK_WEBHOOK_URL', ''),
    discordWebhookUrl: required('DISCORD_WEBHOOK_URL', ''),
  },

  rateLimit: {
    windowMinutes: Number(required('RATE_LIMIT_WINDOW_MINUTES', 15)),
    max: Number(required('RATE_LIMIT_MAX', 300)),
    authMax: Number(required('AUTH_RATE_LIMIT_MAX', 20)),
  },

  integrations: {
    googleClientId: required('GOOGLE_CLIENT_ID', ''),
    googleClientSecret: required('GOOGLE_CLIENT_SECRET', ''),
    googleAnalyticsPropertyId: required('GOOGLE_ANALYTICS_PROPERTY_ID', ''),
    metaAppId: required('META_APP_ID', ''),
    metaAppSecret: required('META_APP_SECRET', ''),
    metaAccessToken: required('META_ACCESS_TOKEN', ''),
    whatsappBusinessToken: required('WHATSAPP_BUSINESS_TOKEN', ''),
    goHighLevelApiKey: required('GOHIGHLEVEL_API_KEY', ''),
    mailchimpApiKey: required('MAILCHIMP_API_KEY', ''),
  },
}
