import * as dotenv from 'dotenv';
import { Telegraf } from 'telegraf';
import { TelegrafContext } from "telegraf/typings/context";
import { markdownResponse, getCommandsMenu, getMainMenu, welcomeMsg, errorResponse, keys } from './utils';
import { API, MovieI } from './api';

dotenv.config();

// https://telegraf.js.org/#/?id=bot

const bot = new Telegraf(process.env.BOT_TOKEN);
const api = new API(process.env.TMDB_KEY);

async function response(ctx: TelegrafContext, movie: MovieI | boolean): Promise<void> {
  if (!movie) {
    await ctx.reply(errorResponse);
  }
  await ctx.replyWithMarkdown(markdownResponse(movie as MovieI));
}

bot.help((ctx) => ctx.reply('Send /start command or / to get a menu or /quit to leave'));
bot.on('sticker', (ctx) => ctx.reply('👍'));

bot.start(ctx => ctx.replyWithHTML(welcomeMsg, getMainMenu()));
bot.hears('/',ctx => ctx.replyWithHTML(welcomeMsg, getMainMenu()));

bot.hears(keys.UPCOMING, async ctx => response(ctx, await api.getUpcoming()));
bot.hears(keys.TOP_RATED, async ctx => response(ctx, await api.getTopRated()));
bot.hears(keys.POPULAR, async ctx => response(ctx, await api.getPopular()));

bot.on('text', async ctx => {
  await ctx.replyWithHTML(
    `Unknown command please choose one of the next`+
    `<i>${ctx.message.text}</i>`,
    getCommandsMenu()
  );
});

// Leave the chat
bot.command('quit', (ctx) => ctx.leaveChat());

if (process.env.SERVER) {
  // Set telegram web hook
  bot.telegram.setWebhook(process.env.SERVER);

  // Http web hook
  bot.startWebhook('/secret-path', null, 5000)
} else {
  bot.launch().then(() => console.info('Bot started...'));
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop());
process.once('SIGTERM', () => bot.stop());
