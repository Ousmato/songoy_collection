export interface EnvironmentConfig {
  production: boolean;
  name: 'local' | 'development' | 'staging' | 'production';
  appVersion: string;
  api: {
    baseUrl: string;
    timeoutMs: number;
    enableMock: boolean;
  };
  auth: {
    storageKey: string;
    tokenHeaderName: string;
    enableMockLogin: boolean;
  };
  assets: {
    baseUrl: string;
    imagesBaseUrl: string;
    logoPath: string;
    faviconPath: string;
  };
  sentry?: {
    enabled: boolean;
    dsn?: string;
    environment?: string;
    sampleRate?: number;
  };
  analytics?: {
    enabled: boolean;
    gaMeasurementId?: string;
  };
}

export const environment: EnvironmentConfig = {
  production: true,
  name: 'production',
  appVersion: '1.0.0',
  api: {
    baseUrl: 'https://api.songoy-collection.mg/api',
    timeoutMs: 20000,
    enableMock: false,
  },
  auth: {
    storageKey: 'songoy.auth.token',
    tokenHeaderName: 'Authorization',
    enableMockLogin: false,
  },
  assets: {
    baseUrl: 'https://cdn.songoy-collection.mg',
    imagesBaseUrl: 'https://cdn.songoy-collection.mg',
    logoPath: 'assets/logo-songoy.svg',
    faviconPath: 'assets/favicon.ico',
  },
  sentry: {
    enabled: true,
    dsn: 'YOUR_SENTRY_DSN_HERE',
    environment: 'production',
    sampleRate: 0.8,
  },
  analytics: {
    enabled: true,
    gaMeasurementId: 'G-YOUR_GA_ID_HERE',
  },
};
