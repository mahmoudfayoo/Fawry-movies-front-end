import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class RegisterComponent {
  registerForm: FormGroup;
  error: string = '';
  successMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { username, password, email } = this.registerForm.value;
      console.log('Attempting registration with:', { username, email });
      
      this.authService.register(username, password, email).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          // Show the success message from the backend
          this.error = '';
          this.successMessage = response;
          // Wait for 2 seconds to show the success message
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          console.error('Registration failed:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            message: error.message
          });
          
          if (error.status === 0) {
            this.error = 'Unable to connect to the server. Please check if the server is running.';
          } else if (error.status === 400) {
            this.error = error.error?.message || 'Invalid registration data.';
          } else if (error.status === 200 || error.status === 201) {
            // If we get here, it means the response was actually successful
            console.log('Registration actually succeeded');
            this.error = '';
            this.router.navigate(['/login']);
            return;
          } else {
            this.error = `Registration failed: ${error.error?.message || error.message || 'Unknown error'}`;
          }
        },
        complete: () => {
          console.log('Registration request completed');
        }
      });
    } else {
      this.error = 'Please fill in all required fields correctly.';
      console.log('Form validation errors:', this.registerForm.errors);
    }
  }
}
