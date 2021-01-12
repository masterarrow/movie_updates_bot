import * as dotenv from 'dotenv';
import { Telegraf } from 'telegraf';
import { TelegrafContext } from 'telegraf/typings/context';
import {
  markdownResponse,
  getCommandsMenu,
  getMainMenu,
  welcomeMsg,
  errorResponse,
  keys
} from './utils';
import { API, MovieI } from './api';

dotenv.config();

// https://telegraf.js.org/#/?id=bot

const bot = new Telegraf(process.env.BOT_TOKEN);
const api = new API(process.env.TMDB_KEY);

/* Display response in markdown format */
async function response(ctx: TelegrafContext, movie: MovieI | boolean): Promise<void> {
  try {
    if (!movie) {
      await ctx.reply(errorResponse);
    }
    await ctx.replyWithMarkdown(markdownResponse(movie as MovieI));
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
    if (ctx.message.text.includes('/search')) {
      const query = ctx.message.text.replace('/search', '');
      const data = await api.search(query);
      return response(ctx, data);
    }
  } catch (_) {}
}

bot.on('text', async ctx => {
  if (ctx.message.text.includes('/search')) {
    /* Search for the movie by its title */
    return search(ctx);
  }
  /* Response on any input except registered */
  await ctx.replyWithHTML(
    'Unknown command. Please type `/search "movie title"` to find a certain movie or choose one of the next commands',
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
