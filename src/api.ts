import axios from 'axios';

// https://www.themoviedb.org/settings/api
// https://developers.themoviedb.org/3/movies/

/* Movie fields extracted from the themoviedb.org */
export interface MovieI {
  id: number;
  title: string;
  overview: string;
  genres: [{ name: string }] | undefined;
  poster_path: string | null;
  production_companies: [{ logo_path: string; name: string }] | undefined;
  production_countries: [{ name: string }] | undefined;
  release_date: string | undefined;
  revenue: number | undefined;
  runtime: number | null;
  spoken_languages: [{ english_name: string; name: string }] | undefined;
  tagline: string | undefined;
  trailer: { link: string; name: string } | undefined;
  vote_average: number | undefined;
  vote_count: number | undefined;
}

interface VideoI {
  id: string;
  key: string;
  name: string;
  site: string;
}

/* API for handling all requests to the themoviedb.org */
export class API {
  /* API key */
  private readonly key: string;
  /* URL to get a list of upcoming movies */
  private readonly upcoming: string;
  /* URL to get the top rated movies on TMDb */
  private readonly rated: string;
  /* URL to get a list of the current popular movies on TMDb. Daily updates */
  private readonly popular: string;
  /* Base url for API requests to TMDb */
  private readonly baseUrl: string;
  /* URL to search for movies by title */
  private readonly query: string;

  constructor(apiKey: string, baseUrl?: string) {
    // Clear apiKey and baseUrl
    this.key = apiKey.trim();
    baseUrl = baseUrl.trim()[baseUrl.length - 1] === '/' ? baseUrl.trim().slice(0, baseUrl.length - 2) : baseUrl.trim();
    this.baseUrl = baseUrl || 'https://api.themoviedb.org/3';
    this.upcoming = this.baseUrl + `/movie/upcoming?api_key=${this.key}&language=en-US&page=`;
    this.rated = this.baseUrl + `/movie/top_rated?api_key=${this.key}&language=en-US&page=`;
    this.popular = this.baseUrl + `/movie/popular?api_key=${this.key}&language=en-US&page=`;
    this.query = this.baseUrl + `/search/movie?api_key=${this.key}&language=en-US&query=`;
  }

  /* Get random page number and movie index */
  private static getRand(totalPages: number): { page: number; index: number } {
    const page = Math.floor(Math.random() * totalPages) + 1;
    const index = Math.floor(Math.random() * 18) + 1; // 20 movies per page

    return { page, index };
  }

  /* Get movie main data */
  private async getMovie(link: string): Promise<MovieI | null> {
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
        choice = result.data.results[Math.floor(Math.random() * 18) + 1];
      }

      return this.getMovieById(choice.id);
    } catch (_) {
      return null;
    }
  }

  /* Get movie details with trailers */
  getMovieById = async (movieId: number): Promise<MovieI | null> => {
    try {
      if (!movieId) {
        return null;
      }

      const movieDetails = await axios.get(
        this.baseUrl + `/movie/${movieId}?api_key=${this.key}&language=en-US&append_to_response=videos`
      );

      /* Filter video trailers */
      const videos: VideoI[] = movieDetails.data.videos?.results.filter(
        item =>
          'key' in item &&
          'name' in item &&
          'site' in item &&
          item.site &&
          (item.site.toUpperCase() === 'YOUTUBE' || item.site.toUpperCase() === 'VIMEO')
      );
      /* Select a random video trailer from the list */
      if (videos && videos.length) {
        const video = videos.length > 1 ? videos[Math.floor(Math.random() * videos.length) + 1] : videos[0];

        if ('site' in video && video.site) {
          // Save trailer data
          const link =
            video.site.toUpperCase() === 'YOUTUBE'
              ? `https://www.youtube.com/watch?v=${video.key}`
              : `https://vimeo.com/${video.key}`;

          movieDetails.data.trailer = { link, name: video.name.replace('[', '').replace(']', '') };
        }
      }
      // Delete other trailers
      delete movieDetails.data?.videos;
      // Movie poster
      movieDetails.data.poster_path = movieDetails.data.poster_path
        ? `https://image.tmdb.org/t/p/w300${movieDetails.data.poster_path}`
        : null;

      return movieDetails.data;
    } catch (_) {
      return null;
    }
  };

  /* Search for movies by title */
  search = async (query: string, includeAdult = false): Promise<MovieI[] | null> => {
    try {
      const result = await axios.get(this.query + query + `&include_adult=${includeAdult}`);
      // Movie not found
      if (!result.data.results.length) {
        return null;
      }
      // Filter movies
      return result.data.results.filter(item => 'id' in item && 'title' in item && 'overview' in item);
    } catch (_) {
      return null;
    }
  };

  /* Get a random upcoming movie */
  getUpcoming = async (): Promise<MovieI | null> => this.getMovie(this.upcoming);
  /* Get a random top rated movie */
  getTopRated = async (): Promise<MovieI | null> => this.getMovie(this.rated);
  /* Get a random popular movie */
  getPopular = async (): Promise<MovieI | null> => this.getMovie(this.popular);
}
