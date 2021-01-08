import axios from 'axios';

// https://www.themoviedb.org/settings/api
// https://developers.themoviedb.org/3/movies/

/* Movie fields extracted from the themoviedb.org */
export interface MovieI {
  id: number,
  title: string,
  overview: string
  genres: [ { name: string } ] | undefined,
  poster_path: string,
  production_companies: [ { logo_path: string, name: string } ] | undefined,
  production_countries: [ { name: string } ] | undefined,
  release_date: string | undefined,
  revenue: number | undefined,
  runtime: number | undefined,
  spoken_languages: [ { english_name: string, name: string } ] | undefined,
  tagline: string | undefined,
  video: boolean,
  vote_average: number | undefined,
  vote_count: number | undefined
}

/* API for handling all requests to the themoviedb.org */
export class API {
  private readonly key: string;
  private readonly upcoming: string;
  private readonly rated: string;
  private readonly popular: string;
  private readonly baseUrl: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.key = apiKey;
    this.baseUrl = baseUrl || 'https://api.themoviedb.org/3/movie/';
    this.upcoming = this.baseUrl + `upcoming?api_key=${this.key}&language=en-US&page=`;
    this.rated = this.baseUrl + `top_rated?api_key=${this.key}&language=en-US&page=`;
    this.popular = this.baseUrl + `popular?api_key=${this.key}&language=en-US&page=`;
  }

  /* Get random page number and movie index  */
  private static getRand(totalPages: number): { page: number, index: number } {
    const page = Math.floor(Math.random() * totalPages) +1;
    const index = Math.floor(Math.random() * 18) +1; // 20 movies per page

    return { page, index };
  }

  /* Get movie data */
  private async getMovieData(link: string): Promise<MovieI | boolean> {
    try {
      // Get total pages count from first page
      const res = await axios.get(link + 1);
      // Generate random page number and movie index in the array
      const rand = API.getRand(res.data.total_pages);
      // Get selected page with movies
      const result = await axios.get(link + rand.page);
      // Get movie
      let choice: MovieI = result.data.results[rand.index];
      // Check required parameters
      while (!choice.id || !choice.poster_path || !choice.title || !choice.overview) {
        choice = result.data.results[API.getRand(1).index];
      }

      const movieDetails = await axios.get(this.baseUrl + `${choice.id}?api_key=${this.key}&language=en-US`);
      return movieDetails.data;
    } catch (_) {
      return false;
    }
  }
  /* Get upcoming movies */
  getUpcoming = async (): Promise<MovieI | boolean> => this.getMovieData(this.upcoming);
  /* Get top rated movies */
  getTopRated = async (): Promise<MovieI | boolean> => this.getMovieData(this.rated);
  /* Get popular movies */
  getPopular = async  (): Promise<MovieI | boolean> => this.getMovieData(this.popular);
}
