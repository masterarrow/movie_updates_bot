import * as dotenv from 'dotenv';
import { API } from '../src/api';

dotenv.config();

describe('Test TMDb API module', () => {
  const api = new API(process.env.TMDB_KEY);

  test('Test get a random popular movie', async () => {
    const movie = await api.getPopular();

    if (movie) {
      expect(movie).toBeDefined();
      expect(movie.id).toBeGreaterThanOrEqual(0);
      expect(movie.title.length).toBeGreaterThan(0);
      expect(movie.overview.length).toBeGreaterThan(0);
    }
  });

  test('Test get a random upcoming movie', async () => {
    const movie = await api.getUpcoming();

    if (movie) {
      expect(movie).toBeDefined();
      expect(movie.id).toBeGreaterThanOrEqual(0);
      expect(movie.title.length).toBeGreaterThan(0);
      expect(movie.overview.length).toBeGreaterThan(0);

      // if (movie.release_date) {
      //   // Release date must be in this year or next
      //   const movieYear = new Date(movie.release_date).getFullYear();
      //   const currentYear = new Date().getFullYear();
      //
      //   expect(movieYear).toBeGreaterThanOrEqual(currentYear);
      // }
    }
  });

  test('Test get a random top rated movie', async () => {
    const movie = await api.getTopRated();

    if (movie) {
      expect(movie).toBeDefined();
      expect(movie.id).toBeGreaterThanOrEqual(0);
      expect(movie.title.length).toBeGreaterThan(0);
      expect(movie.overview.length).toBeGreaterThan(0);
    }
  });

  test('Test to search movies by title', async () => {
    const query = 'wonder';
    const movies = await api.search(query);

    movies.forEach(movie => {
      expect(movie).toBeDefined();
      expect(movie.id).toBeGreaterThanOrEqual(0);

      const title = movie.title.toLowerCase().split(' ');

      // Movie title must contain a searchable string
      expect(title).toContain(query);
    });
  });

  test('Test get movie by id', async () => {
    const movieIds = [161620, 59961, 9944];
    const movieTitles = ['Wonder Woman', 'Safe House', 'The Pelican Brief'];

    for (let i = 0; i < movieIds.length - 1; i++) {
      const movie = await api.getMovieById(movieIds[i]);

      expect(movie).toBeDefined();
      expect(movie.title).toEqual(movieTitles[i]);
    }
  });
});
