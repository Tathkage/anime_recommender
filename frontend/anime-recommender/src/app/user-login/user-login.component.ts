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
  errorMessage ='Sorry bud, something went wrong.'

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/anime-list']);
    }
  }

  onLogin(): void {
    this.authService.login(this.loginData).subscribe(result => {
      this.router.navigate(['/anime-list']); // Redirect on success
    }, error => {
      this.errorMessage = 'Login failed: Incorrect username or password.'; // Display error message
    });
  }

  redirectToSignup(): void {
    this.router.navigate(['/user-signup']);
  }
}
