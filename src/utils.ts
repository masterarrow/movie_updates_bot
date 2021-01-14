import Markup from 'telegraf/markup.js';
import { MovieI } from './api';

export const welcomeMsg =
  'Welcome to <b>Movie Releases Bot</b>\n\n' + 'Please choose the desirable category to get a movie';

export const errorResponse = "Sorry, now we can't find a good movie for you 😞\nPlease try again later 😊";

/* Main menu buttons */
export enum keys {
  UPCOMING = 'Upcoming Movie',
  TOP_RATED = 'Top Rated Movie',
  POPULAR = 'Popular Movie'
}

/* Get main menu buttons */
export const getMainMenu = (): any =>
  Markup.keyboard([[keys.UPCOMING, keys.TOP_RATED], [keys.POPULAR]])
    .resize()
    .extra();

/* Get available commands */
export const getCommandsMenu = (): any =>
  Markup.keyboard([['/start', '/help', '/quit']])
    .resize()
    .extra();

/* Response in markdown format */
export function markdownResponse(data: MovieI): string {
  const genres = 'genres' in data ? data.genres.splice(0, 3).map(item => item.name) : [];
  const languages = 'spoken_languages' in data ? data.spoken_languages.slice(0, 3).map(item => item.english_name) : [];
  const companies = 'production_companies' in data ? data.production_companies.slice(0, 3).map(item => item.name) : [];
  const countries = 'production_countries' in data ? data.production_countries.slice(0, 3).map(item => item.name) : [];

  let result = data.poster_path ? `🎬  [${data.title}](${data.poster_path})\n\n` : `🎬  ${data.title}\n\n`;

  if (data.runtime && data.runtime !== 0) result += `🕐 _${data.runtime} min_\t\t\t\t`;

  if (data?.release_date) result += `📅 ${data.release_date}\n\n`;

  if (data?.tagline) result += `_${data.tagline}_\n\n`;
  if (genres.length) result += `✅ *${genres.join(', ')}*\n\n`;
  if (languages.length) result += `🔈 ${languages.join(', ')}\n\n`;
  if (companies.length) result += `🎞 _${companies.join(', ')}_\n\n`;
  if (countries.length) result += `🏳️ *${countries.join(', ')}*\n\n`;

  result += `${data.overview}\n\n`;

  return result;
}
