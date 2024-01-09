import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'user-login',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './user-signup.component.html',
  styleUrl: './user-signup.component.css'
})

export class UserSignupComponent {
    signupData = { username: '', email: '', password: '' };
    errorMessage = '';
    showPassword = false;

    constructor(private authService: AuthService, private router: Router) {}

    ngOnInit(): void {
      this.authService.isLoggedIn().subscribe(isLoggedIn => {
        if (isLoggedIn) {
          // Redirect to anime list if the user is already logged in
          this.router.navigate(['/anime-list']);
        }
      });
    }
      

    onSignUp(): void {
      this.authService.signUp(this.signupData).subscribe(
        result => {
          this.router.navigate(['/anime-list']); // Redirect on success
          this.errorMessage = ''; // Clear error message
        },
        error => {
          this.errorMessage = error; // Display error message
        }
      );
    }    
    
    redirectToLogin(): void {
      this.router.navigate(['/user-login']);
    }

    togglePasswordVisibility(): void {
      this.showPassword = !this.showPassword;
    }
}
