export const environment = {
  production: true,
  enviroment: 'PROD',

  // URLs
  urlFrontend: 'https://app.hqdm.ai', // TODO: Replace with your production URL
  apiUrl: 'https://api.app.hqdm.ai/api/v1', // TODO: Replace with your production API URL

  // AWS S3
  awsS3Bucket: 'hqdm-app-backend-prod.s3.amazonaws.com', // TODO: Replace with your production S3 bucket

  // Google OAuth
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID_PROD', // TODO: Replace with your production Google Client ID

  // Storage Keys
  storageKeys: {
    authToken: 'auth_token',
    userData: 'user_data',
    selectedCompany: 'selected_company',
    otpEmail: 'otp_email'
  }
};
