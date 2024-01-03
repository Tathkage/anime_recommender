import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ReactiveFormsModule],
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent {
  userForm: FormGroup;
  userId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService, 
    private router: Router, 
    private authService: AuthService
  ) {
    this.userForm = this.fb.group({
      username: [''], // No validators, always valid
      email: [''], // No validators, always valid
      currentPassword: [''], // No validators, but used for conditional validation
      newPassword: [''], // No validators, but used for conditional validation
      confirmPassword: [''] // No validators, used for conditional validation
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe(user => {
      this.userId = user.user_id; // Adjust according to your user object
      // Set the form values
      this.userForm.patchValue({
        username: user.username,
        email: user.email
      });
    });
  }  

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/user-login']);
  }

  navigateToWatchlist(): void {
    this.router.navigate(['/user-watchlist']);
  }

  navigateToAnimeList(): void {
    this.router.navigate(['/anime-list']);
  }

  passwordMatchValidator(form: FormGroup) {
    const condition = form.get('currentPassword')?.value 
                    && form.get('newPassword')?.value 
                    && form.get('newPassword')?.value === form.get('confirmPassword')?.value;

    return condition ? null : { passwordMismatch: true };
  }

  updateUser() {
    console.log('Current User:', this.userId);
    if (this.isFormValid() && this.userId !== null) {
      this.userService.updateUser(this.userForm.value).subscribe(
        response => {
          console.log('User updated successfully', response);
          // Handle successful update here
        },
        error => {
          console.error('Error updating user', error);
          // Log the detailed error response
          console.error('Error details', error.error);
          // Handle error here
        }
      );
    } else {
      console.error('Form is invalid or userId is null');
      // Handle the case where the form is invalid or userId is null
    }
  }

  isFormValid() {
    const form = this.userForm;
    const usernameFilled = !!form.get('username')?.value;
    const emailFilled = !!form.get('email')?.value;
    const passwordsFilled = !!form.get('currentPassword')?.value 
                        && !!form.get('newPassword')?.value
                        && form.get('newPassword')?.value === form.get('confirmPassword')?.value;

    return usernameFilled || emailFilled || passwordsFilled;
  }
  
  deleteUser() {
    if (this.userId !== null) {
      this.userService.deleteUser(this.userId).subscribe(
        response => {
          console.log('User deleted successfully', response);
          // Handle successful deletion here
          this.authService.logout();
          this.router.navigate(['/']);
        },
        error => {
          console.error('Error deleting user', error);
          // Handle error here
        }
      );
    } else {
      console.error('UserId is null');
      // Handle the case where userId is null
    }
  }
  
  confirmDeleteUser() {
    const confirmation = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmation) {
      this.deleteUser();
    }
  }
}
