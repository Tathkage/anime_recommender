import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-user-logout',
  templateUrl: './user-logout.component.html',
  styleUrls: ['./user-logout.component.css']
})

export class UserLogoutComponent {
  constructor(private authService: AuthService, private router: Router) {}

  onLogout(): void {
    this.authService.logout().subscribe(
      response => {
        console.log('Logout successful', response);
        this.router.navigate(['/user-login']);
      },
      error => {
        console.error('Error during logout:', error);
      }
    );
  }
}
