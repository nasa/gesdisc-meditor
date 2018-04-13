import { AuthConfig } from 'angular-oauth2-oidc';

export const noDiscoveryAuthConfig: AuthConfig = {

  // Url of the Identity Provider
  loginUrl: 'https://urs.earthdata.nasa.gov/oauth/authorize',
  // issuer: 'https://accounts.google.com',
  tokenEndpoint: 'https://urs.earthdata.nasa.gov/oauth/token',
  // URL of the SPA to redirect the user to after login
  redirectUri: window.location.origin + '/home',

  // URL of the SPA to redirect the user after silent refresh
  silentRefreshRedirectUri: window.location.origin + '/home',

  // The SPA's id. The SPA is registerd with this id at the auth-server
  clientId: 'demo-resource-owner',

  // set the scope for the permissions the client should request
  // The first three are defined by OIDC. The 4th is a usecase-specific one
  scope: 'openid profile email voucher',

  // showDebugInformation: true,

  // oidc: false

}