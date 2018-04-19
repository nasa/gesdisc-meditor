import { AuthConfig } from '../../libs/angular-oauth2-oidc/angular-oauth2-oidc/src';

export const noDiscoveryAuthConfig: AuthConfig = {

  // Url of the Identity Provider
  loginUrl: 'https://sit.urs.earthdata.nasa.gov/oauth/authorize',
  // issuer: 'https://accounts.google.com',
  tokenEndpoint: 'https://sit.urs.earthdata.nasa.gov/oauth/token',
  // URL of the SPA to redirect the user to after login
  redirectUri: window.location.origin + '/home',

  // URL of the SPA to redirect the user after silent refresh
  // silentRefreshRedirectUri: window.location.origin + '/home',

  // The SPA's id. The SPA is registerd with this id at the auth-server
  clientId: 'oDG3RXp6Oxlslx8-MQM_UQ',
  // clientId: 'gesdisc_eula_test_archive',
  // set the scope for the permissions the client should request
  // The first three are defined by OIDC. The 4th is a usecase-specific one
  // scope: 'openid profile email voucher',

  // showDebugInformation: true,
  oidc: false,
  // responseType: 'code',

}
