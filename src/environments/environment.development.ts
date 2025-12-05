export const environment = {
  production: false,
  enviroment: 'DEV',

  // URLs
  urlFrontend: 'http://localhost:4200',
  apiUrl: 'https://dev.api.app.hqdm.ai/api/v1',

  // AWS S3
  awsS3Bucket: 'hqdm-app-backend-dev.s3.amazonaws.com',

  // Google OAuth
  googleClientId: '586503218193-jsu5u8d60mp9e5dluc6979k3enk8gshd.apps.googleusercontent.com',

  // Storage Keys
  storageKeys: {
    authToken: 'auth_token',
    userData: 'user_data',
    selectedCompany: 'selected_company',
    otpEmail: 'otp_email'
  }
};
