import { Component } from '@angular/core';
import { LoginResponse } from '../models/auth.model';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink]
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      console.log('Attempting login with username:', username);
      
      this.authService.login(username, password).subscribe({
        next: (response: LoginResponse) => {
          console.log('Login successful:', response);
          if (response && response.token) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('userRole', response.role || 'USER');
            this.error = '';
            // Navigate to the movies page after successful login
            this.router.navigate(['/movies']);
          } else {
            console.error('No token received');
            this.error = 'Login failed: No authentication token received';
          }
        },
        error: (error) => {
          console.error('Login failed:', error);
          if (error.status === 0) {
            this.error = 'Unable to connect to the server. Please check if the server is running.';
          } else if (error.status === 401) {
            this.error = 'Invalid username or password';
          } else if (error.status === 400) {
            this.error = error.error?.message || 'Invalid login data';
          } else {
            this.error = 'Login failed. Please try again.';
          }
        },
        complete: () => {
          console.log('Login request completed');
        }
      });
    } else {
      this.error = 'Please fill in all required fields.';
      console.log('Form validation errors:', this.loginForm.errors);
    }
  }
}
