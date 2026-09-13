import { inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, Router } from "@angular/router";
import { getUserFromSessionStorage } from "../shared/auth.util";
import { LoginTypeKey } from "../model/admin.enum";
import { AuthService } from "./auth.service";
import { BottomMenue } from "../../shared/utils/bottom-menue";

// Es-tu connecté ?
export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);
  
    if (!isPlatformBrowser(platformId)) {
      return true;
    }

    if (!authService.isLoggedIn()) {
      return router.createUrlTree(['/']);
    }
    return true;
  };

  
  // Tu es déjà connecté ? Alors ne retourne pas au login.
  export const guestGuard: CanActivateFn = () => {

  const router = inject(Router);

  const user = getUserFromSessionStorage();

  if (!user) {
    return true;
  }

  return router.parseUrl(
    BottomMenue.getDefaultPath(user.loginType)
  );
};

  // Quelle est ta page d'accueil ?
  export const defaultRouteGuard: CanActivateFn = () => {

  const router = inject(Router);

  const user = getUserFromSessionStorage();

  if (!user) {
    return router.parseUrl('/admin/login');
  }

  const defaultPath =
    BottomMenue.getDefaultPath(user.loginType);

  return router.parseUrl(defaultPath);
};


// As tu le droit d'acceder a cette page 
export const roleGuard: CanActivateChildFn = (
  route: ActivatedRouteSnapshot
) => {

  const router = inject(Router);

  const user = getUserFromSessionStorage();

  if (!user) {
    return router.parseUrl('/admin/login');
  }

  const allowedTypes =
    route.data['loginTypes'] as LoginTypeKey[] | undefined;


  // Route sans restriction particulière
  if (!allowedTypes || allowedTypes.length === 0) {
    return true;
  }


  // Utilisateur autorisé
  if (allowedTypes.includes(user.loginType)) {
    return true;
  }


  // Pas autorisé :
  // retour vers SA propre page d'accueil
  return router.parseUrl(
    BottomMenue.getDefaultPath(user.loginType)
  );
};