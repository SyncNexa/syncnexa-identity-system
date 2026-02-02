interface SchoolSecretPayload {
  api_token: string;
  hmac_secret: string;
  [key: string]: any;
}
