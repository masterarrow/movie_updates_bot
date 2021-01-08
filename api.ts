import axios from 'axios';

// https://www.themoviedb.org/settings/api
// https://developers.themoviedb.org/3/movies/

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

  private static getRand(totalPages: number): { page: number, index: number } {
    const page = Math.floor(Math.random() * totalPages) +1; // 1-11
    const index = Math.floor(Math.random() * 18) +1; // 20 movies per page

    return { page, index };
  }

  private async getMovieData(link: string): Promise<MovieI | boolean> {
    try {
      const rand = API.getRand(11);
      const result = await axios.get(link);

      let choice: MovieI = result.data.results[rand.index];

      while (!choice.id || !choice.poster_path || !choice.title || !choice.overview) {
        choice = result.data.results[API.getRand(11).index];
      }

      const movieDetails = await axios.get(this.baseUrl + `${choice.id}?api_key=${this.key}&language=en-US`);
      return movieDetails.data;
    } catch (_) {
      return false;
    }
  }

  async getUpcoming(): Promise<MovieI | boolean> {
    const rand = API.getRand(11);
    return this.getMovieData(this.upcoming + rand.page);
  }

  async getTopRated(): Promise<MovieI | boolean> {
    const rand = API.getRand(412);
    return this.getMovieData(this.rated + rand.page);
  }

  async getPopular(): Promise<MovieI | boolean> {
    const rand = API.getRand(500);
    return this.getMovieData(this.popular + rand.page);
  }
}
