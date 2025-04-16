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
  filteredMovies: Movie[] = [];

  constructor(
    private movieService: MovieService,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.isAdmin();
    console.log('User role:', this.authService.getUserRole());
    console.log('Is admin:', this.isAdmin);
  }

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.movieService.getAllMovies().subscribe({
      next: (movies: Movie[]) => {
        console.log('Received movies:', movies);
        this.movies = movies;
        this.filteredMovies = [...this.movies];
        console.log('Movies after assignment:', this.movies);
      },
      error: (error) => {
        console.error('Error loading movies:', error);
        this.error = 'Failed to load movies. Please try again later.';
      }
    });
  }

  addMovie(): void {
    if (!this.imdbId) {
      this.error = 'Please enter an IMDB ID';
      return;
    }

    this.movieService.addMovie(this.imdbId, this.apiKey).subscribe({
      next: (movie: Movie) => {
        console.log('Movie added successfully:', movie);
        this.movies.push(movie);
        this.filteredMovies = [...this.movies];
        this.imdbId = ''; // Clear the input
        this.error = ''; // Clear any previous errors
      },
      error: (error) => {
        console.error('Error adding movie:', error);
        this.error = 'Failed to add movie. Please check the IMDB ID and try again.';
      }
    });
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
    if (!movieId) {
      this.error = 'Invalid movie ID';
      return;
    }

    if (confirm('Are you sure you want to delete this movie?')) {
      this.movieService.deleteMovie(movieId).subscribe({
        next: () => {
          console.log('Movie deleted successfully');
          // Remove the movie from the local list
          this.movies = this.movies.filter(movie => movie.id !== movieId);
          this.filteredMovies = [...this.movies];
          this.error = ''; // Clear any previous errors
        },
        error: (error) => {
          console.error('Error deleting movie:', error);
          this.error = 'Failed to delete movie. Please try again.';
        }
      });
    }
  }
}
