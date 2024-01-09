import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'user-login',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css'
})

export class UserLoginComponent {
  loginData = { username: '', password: '' };
  errorMessage = '';
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/anime-list']);
    }
  }

  onLogin(): void {
    this.authService.login(this.loginData).subscribe(
      result => {
        this.router.navigate(['/anime-list']); // Redirect on success
        this.errorMessage = ''; // Clear error message
      },
      error => {
        this.errorMessage = error; // Display error message
      }
    );
  }  

  redirectToSignup(): void {
    this.router.navigate(['/user-signup']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
