import * as dotenv from 'dotenv';
import { Markup, Telegraf } from 'telegraf';
import { TelegrafContext } from 'telegraf/typings/context';
import { markdownResponse, getCommandsMenu, getMainMenu, welcomeMsg, errorResponse, keys } from './utils';
import { API, MovieI } from './api';

dotenv.config();

// https://telegraf.js.org/#/?id=bot

const bot = new Telegraf(process.env.BOT_TOKEN);
const api = new API(process.env.TMDB_KEY);

// To store a list of found movies
let movies: MovieI[];

/* Display response in markdown format */
async function response(ctx: TelegrafContext, movie: MovieI | null, defaultKeyboard = false): Promise<void> {
  try {
    if (!movie) {
      await ctx.reply(errorResponse);
    }
    // Add button to follow a trailer link
    let keyboard;
    if (movie.trailer) {
      keyboard = Markup.inlineKeyboard([Markup.urlButton('Show trailer', movie.trailer?.link)]).extra();
    }

    if (defaultKeyboard) {
      // Show default keyboard after sending a message with movie
      ctx
        .replyWithMarkdown(markdownResponse(movie), keyboard)
        .then(async () => await ctx.replyWithHTML('Movie by your request 🎬', getMainMenu()));
    } else {
      await ctx.replyWithMarkdown(markdownResponse(movie), keyboard);
    }
  } catch (_) {}
}

/* Help command */
bot.help(ctx => ctx.reply('Send /start command or / to get a menu or /quit to leave'));
/* Response for a sticker */
bot.on('sticker', ctx => ctx.reply('👍'));

/* Commands: '/start' and '/'  */
bot.start(ctx => ctx.replyWithHTML(welcomeMsg, getMainMenu()));
bot.hears('/', ctx => ctx.replyWithHTML(welcomeMsg, getMainMenu()));

/* Main menu buttons */
bot.hears(keys.UPCOMING, async ctx => response(ctx, await api.getUpcoming()));
bot.hears(keys.TOP_RATED, async ctx => response(ctx, await api.getTopRated()));
bot.hears(keys.POPULAR, async ctx => response(ctx, await api.getPopular()));

/* Display response in markdown format */
async function search(ctx: TelegrafContext): Promise<void> {
  try {
    if (ctx.message.text) {
      const query = ctx.message.text.trim();
      movies = await api.search(query);
      // Buttons with movie's names
      const buttons = Markup.keyboard(movies.map(item => `${item.title} (${item.release_date})`))
        .resize()
        .extra();

      await ctx.replyWithHTML('Please choose one of the movies to see the details:', buttons);
    }
  } catch (_) {}
}

bot.on('text', async ctx => {
  if (movies) {
    // Display information about movie selected in the search results
    const movie = movies.find(item => item.title === ctx.message.text.split('(')[0].trim());
    if (movie) {
      return response(ctx, movie, true);
    }
  }
  if (ctx.message.text && ctx.message.text.match(/[\w\s]/g)) {
    /* Search for the movie by its title */
    return search(ctx);
  }
  /* Response on any input except registered */
  await ctx.replyWithHTML(
    'Unknown command. Please type `movie title` to find a certain movie or choose one of the next commands:',
    getCommandsMenu()
  );
});

// Leave the chat
bot.command('quit', ctx => ctx.leaveChat());

if (process.env.SERVER) {
  // Set telegram web hook
  bot.telegram.setWebhook(process.env.SERVER);

  // Http web hook
  bot.startWebhook('/', null, 5000);
} else {
  bot.launch().then(() => console.info('Bot started...'));
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop());
process.once('SIGTERM', () => bot.stop());
