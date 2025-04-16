import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models/movie.model';
import { AuthService } from '../../../auth/auth.service';
import { MovieResponse } from '../../models/movie-response.model';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class MovieListComponent implements OnInit {
  movies: Movie[] = [];
  searchId: string = '';
  selectedMovie: Movie | null = null;
  error: string = '';
  isAdmin: boolean = false;
  apiKey: string = '9c31d025';
  imdbId: string = '';

  constructor(
    private movieService: MovieService,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.movieService.getAllMovies().subscribe(
      (response: MovieResponse) => {
        if (response.success) {
          this.movies = response.movies || [];
          this.error = '';
        } else {
          this.error = response.message || 'Failed to load movies';
        }
      },
      (error: Error) => {
        this.error = 'Failed to load movies: ' + error.message;
      }
    );
  }

  addMovie(): void {
    if (!this.imdbId) {
      this.error = 'Please enter an IMDB ID';
      return;
    }

    if (!this.isAdmin) {
      this.error = 'Only administrators can add movies';
      return;
    }

    this.movieService.addMovie(this.imdbId, this.apiKey).subscribe(
      (response: MovieResponse) => {
        if (response.success && response.movie) {
          this.movies.push(response.movie);
          this.imdbId = ''; // Clear the input
          this.error = 'Movie added successfully!';
          this.loadMovies(); // Refresh the list
        } else {
          this.error = 'Failed to add movie: ' + (response.message || 'Unknown error');
        }
      },
      (error: Error) => {
        this.error = 'Failed to add movie: ' + error.message;
      }
    );
  }

  searchMovie(): void {
    if (!this.searchId) {
      this.error = 'Please enter a movie ID';
      return;
    }

    const movieId = parseInt(this.searchId);
    if (isNaN(movieId)) {
      this.error = 'Please enter a valid movie ID';
      return;
    }

    this.movieService.getMovieById(movieId).subscribe(
      (response: MovieResponse) => {
        if (response.success && response.movie) {
          this.selectedMovie = response.movie;
          this.error = '';
          console.log('Movie found:', response.movie);
        } else {
          this.error = response.message || 'Movie not found';
          this.selectedMovie = null;
          console.log('Movie not found:', response);
        }
      },
      (error: Error) => {
        this.error = 'Failed to find movie: ' + error.message;
        this.selectedMovie = null;
        console.error('Error searching movie:', error);
      }
    );
  }

  deleteMovie(movieId: number): void {
    if (!this.isAdmin) {
      this.error = 'Only administrators can delete movies';
      return;
    }

    if (confirm('Are you sure you want to delete this movie?')) {
      this.movieService.deleteMovie(movieId).subscribe(
        (response: MovieResponse) => {
          if (response.success) {
            this.movies = this.movies.filter(m => m.id !== movieId);
            this.error = response.message || 'Movie deleted successfully';
            if (this.selectedMovie?.id === movieId) {
              this.selectedMovie = null;
            }
            this.loadMovies(); // Refresh the list
          } else {
            this.error = response.message || 'Failed to delete movie';
          }
        },
        (error: Error) => {
          this.error = 'Failed to delete movie: ' + error.message;
        }
      );
    }
  }
}
