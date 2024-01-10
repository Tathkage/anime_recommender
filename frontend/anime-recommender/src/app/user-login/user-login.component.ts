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
  loginData = { email: '', password: '' };
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe(
      isLoggedIn => {
        if (isLoggedIn) {
          this.router.navigate(['/anime-list']);
        }
      },
      error => {
        if (error !== 'Not logged in') {
          // Only set the error message if the error is not 'Not logged in'
          this.errorMessage = error;
        }
      }
    );
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

  onForgotPassword(): void {
    const email = prompt('Please enter your email to reset password:');
    if (email) {
      this.authService.forgotPassword(email).subscribe(
        response => {
          this.successMessage = 'A password reset email has been sent to your email address.'; // Update success message
          this.errorMessage = ''; // Clear any existing error messages
        },
        error => {
          this.errorMessage = error;
        }
      );
    }
  }

  redirectToSignup(): void {
    this.router.navigate(['/user-signup']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
