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
  production: false,
  name: 'development',
  appVersion: '1.0.0',
  api: {
    baseUrl: 'http://localhost:4200/api/v1',
    timeoutMs: 15000,
    enableMock: true,
  },
  auth: {
    storageKey: 'songoy.auth.token',
    tokenHeaderName: 'Authorization',
    enableMockLogin: true,
  },
  assets: {
    baseUrl: '',
    logoPath: 'favicon.ico',
    faviconPath: 'favicon.ico',
  },
  sentry: {
    enabled: false,
  },
  analytics: {
    enabled: false,
  },
};
