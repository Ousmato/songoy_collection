import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { APP_ROUTES } from './shared/routing/app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(APP_ROUTES),
    provideClientHydration(),
    importProvidersFrom(ReactiveFormsModule)
  ]
};
