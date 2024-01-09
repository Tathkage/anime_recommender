import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { User } from '../models/user.model';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ReactiveFormsModule],
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent {
  userForm: FormGroup;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  errorMessage = '';

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
    this.userService.getCurrentUser().subscribe((user: User) => {
      // Set the form values using the fetched user data
      this.userForm.patchValue({
        username: user.username,
        email: user.email
      });
    });
  }  

  onLogout(): void {
    this.authService.logout().subscribe(
      () => {
        console.log('Logout successful');
        this.router.navigate(['/user-login']);
      },
      error => {
        console.error('Error during logout:', error);
      }
    );
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
    if (this.isFormValid()) {
      this.userService.updateUser(this.userForm.value).subscribe(
        response => {
          console.log('User updated successfully', response);
          // Handle successful update here
        },
        error => {
          console.error('Error updating user', error);
          // Display error message to the user
          // Assuming you have a mechanism to show this, like `errorMessage`
          this.errorMessage = error;
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
    const confirmation = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmation) {
      this.userService.deleteUser().subscribe(
        response => {
          console.log('User deleted successfully', response);
          this.authService.logout();
          this.router.navigate(['/user-login']);
        },
        error => {
          console.error('Error deleting user', error);
        }
      );
    }
  }  
  
  confirmDeleteUser() {
    const confirmation = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmation) {
      this.deleteUser();
    }
  }

  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
