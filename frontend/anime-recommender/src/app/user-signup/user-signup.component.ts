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
    errorMessage ='Sorry bud, something went wrong.'

    constructor(private authService: AuthService, private router: Router) {}

    onSignUp(): void {
        this.authService.signUp(this.signupData).subscribe(result => {
        this.router.navigate(['/anime-list']); // Redirect on success
        }, error => {
        this.errorMessage = 'Sign-up failed: Please try again.'; // Display error message
        });
    }
}
