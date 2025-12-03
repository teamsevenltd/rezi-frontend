import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const validrole = route.data["role"];
  if (!authService.isLogin() || authService.userRole() !== validrole) {
    router.navigate(['/']);
    return false;
  }
  else{
    return true;
  }
};
