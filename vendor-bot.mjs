import { Telegraf, Scenes, session, Markup } from 'telegraf';

// ==========================================
// BOT & ADMIN CONFIGURATION
// ==========================================
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOTFATHER_TOKEN_HERE';
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || 'YOUR_NUMERIC_ADMIN_CHAT_ID';

if (!BOT_TOKEN || BOT_TOKEN.includes('YOUR_BOTFATHER_TOKEN')) {
  console.error('❌ Error: Please provide a valid TELEGRAM_BOT_TOKEN in .env!');
  process.exit(1);
}

// Solana Public Key Regex Validator (Base58, 32-44 characters)
const SOLANA_PUBKEY_REGEX = /^[1-9A-HJ-NP-za-km-z]{32,44}$/;

// ==========================================
// ONBOARDING WIZARD SCENE
// ==========================================
const onboardingWizard = new Scenes.WizardScene(
  'vendor-onboarding-wizard',

  // Step 1: Project / Brand Name
  async (ctx) => {
    await ctx.reply(
      '👋 **Welcome to the AutonPay Merchant Onboarding Portal!**\n\n' +
      'Our protocol manually reviews and vets each merchant to ensure compliance and ecosystem security.\n\n' +
      '📌 **Step 1/4:** Please enter your **Project / Brand Name**:',
      { parse_mode: 'Markdown' }
    );
    ctx.wizard.state.data = {};
    return ctx.wizard.next();
  },

  // Step 2: Product / Service Category
  async (ctx) => {
    if (!ctx.message?.text) return ctx.reply('Please provide a valid text input.');
    ctx.wizard.state.data.projectName = ctx.message.text.trim();

    await ctx.reply(
      `✅ Project Name: *${ctx.wizard.state.data.projectName}*\n\n` +
      '📌 **Step 2/4:** What category of assets will you be publishing?\n' +
      'Select an option below or type your custom category:',
      {
        parse_mode: 'Markdown',
        ...Markup.keyboard([
          ['💻 AI / Compute API', '🔑 Software License'],
          ['⚡ GPU Infrastructure', '📊 Custom Dataset']
        ]).oneTime().resize()
      }
    );
    return ctx.wizard.next();
  },

  // Step 3: Solana Vendor Public Key
  async (ctx) => {
    if (!ctx.message?.text) return ctx.reply('Please provide a valid text input.');
    ctx.wizard.state.data.category = ctx.message.text.trim();

    await ctx.reply(
      '📌 **Step 3/4:** Enter your **Solana Public Key (Merchant Wallet)**:\n\n' +
      '*(This address will receive deterministic 90% atomic settlement payouts and will be added to the protocol whitelist)*',
      {
        parse_mode: 'Markdown',
        ...Markup.removeKeyboard()
      }
    );
    return ctx.wizard.next();
  },

  // Step 4: Documentation / Website Link
  async (ctx) => {
    const wallet = ctx.message?.text?.trim();

    // Validate Solana address format
    if (!wallet || !SOLANA_PUBKEY_REGEX.test(wallet)) {
      return ctx.reply('⚠️ Invalid Solana address! Please provide a valid Base58 Public Key (32–44 characters):');
    }

    ctx.wizard.state.data.wallet = wallet;

    await ctx.reply(
      '📌 **Step 4/4:** Provide a link to your **Website, GitHub, or API Documentation** for compliance verification:',
      { parse_mode: 'Markdown' }
    );
    return ctx.wizard.next();
  },

  // Step 5: Summary, Confirmation Button & Forward to Admin
  async (ctx) => {
    if (!ctx.message?.text) return ctx.reply('Please provide a valid text input.');
    ctx.wizard.state.data.link = ctx.message.text.trim();

    const d = ctx.wizard.state.data;
    const applicantUser = ctx.from.username ? `@${ctx.from.username}` : `ID: ${ctx.from.id}`;

    // 1. Applicant Confirmation Message dengan tombol langsung ke @provizto
    await ctx.reply(
      '🎉 **Application Submitted Successfully!**\n\n' +
      'The AutonPay core team will review your software product and credentials for compliance.\n' +
      'Once approved, your wallet address will be whitelisted on-chain.\n\n' +
      'Need expedited onboarding or have questions? Contact our admin directly below:',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.url('💬 Chat with Admin (@provizto)', 'https://t.me/provizto')]
        ])
      }
    );

    // 2. Dispatch Application to Admin Chat
    const adminMessage =
      '🚨 **NEW MERCHANT ONBOARDING APPLICATION** 🚨\n\n' +
      `👤 **Applicant:** ${applicantUser} (${ctx.from.first_name || 'N/A'})\n` +
      `🏷️ **Project:** ${d.projectName}\n` +
      `📦 **Category:** ${d.category}\n` +
      `🔗 **Docs / Link:** ${d.link}\n` +
      `👛 **Solana Public Key:**\n\`${d.wallet}\`\n\n` +
      '━━━━━━━━━━━━━━━━━━━━━\n' +
      'Status: *Pending Compliance Review & Whitelist*';

    try {
      await ctx.telegram.sendMessage(
        ADMIN_CHAT_ID,
        adminMessage,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.url('🔍 View on Solscan', `https://solscan.io/account/${d.wallet}`)],
            [Markup.button.url('💬 Contact Applicant', `https://t.me/${ctx.from.username || ''}`)]
          ])
        }
      );
      console.log(`[BOT] Application from ${applicantUser} forwarded to Admin successfully.`);
    } catch (err) {
      console.error('[BOT ERROR] Failed to dispatch application to Admin:', err.message);
    }

    return ctx.scene.leave();
  }
);

// ==========================================
// BOT INITIALIZATION & EVENT LOGGERS
// ==========================================
const stage = new Scenes.Stage([onboardingWizard]);
const bot = new Telegraf(BOT_TOKEN);

// Global error boundary
bot.catch((err, ctx) => {
  console.error(`[TELEGRAF ERROR] Uncaught error during update ${ctx.updateType}:`, err);
});

// Incoming activity logger
bot.use((ctx, next) => {
  console.log(`📩 [INCOMING] Event from @${ctx.from?.username || ctx.from?.id} (Type: ${ctx.updateType})`);
  return next();
});

bot.use(session());
bot.use(stage.middleware());

// /start Command Handler
bot.command('start', async (ctx) => {
  console.log('⚡ [COMMAND] Processing /start request...');
  await ctx.reply(
    `Hello ${ctx.from.first_name || 'Partner'}! Welcome to the AutonPay Merchant Gateway.\n\n` +
    'Click the button below to submit your vendor verification request:',
    Markup.inlineKeyboard([
      [Markup.button.callback('📝 Apply for Merchant Access', 'start_onboarding')]
    ])
  );
});

// Action & shortcut handlers
bot.action('start_onboarding', (ctx) => {
  console.log('⚡ [ACTION] Launching onboarding wizard...');
  return ctx.scene.enter('vendor-onboarding-wizard');
});

bot.command('apply', (ctx) => {
  return ctx.scene.enter('vendor-onboarding-wizard');
});

// Launch Bot with pending updates flushed
bot.launch({
  dropPendingUpdates: true
}).then(() => {
  console.log('🤖 AutonPay Merchant Onboarding Bot is active and listening!');
}).catch((err) => {
  console.error('❌ Failed to launch Telegram Bot:', err);
});

// Graceful shutdown handling
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));