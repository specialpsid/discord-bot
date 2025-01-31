require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');

// Inisialisasi bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

// Prefix perintah
const prefix = '!'; // Ganti prefix menjadi !

// Role yang diizinkan menggunakan perintah tertentu
const allowedRoles = ['1244182688601079828', '1254552326245449879']; // ID Role Admin

// Fungsi untuk mengatur status bot (hanya satu aktivitas)
function setActivity(activityName) {
    if (!client.user) {
        console.error('❌ Gagal mengatur status: Bot belum siap.');
        return;
    }

    client.user.setPresence({
        activities: [{ name: activityName, type: ActivityType.Playing }], // ActivityType.Playing
        status: 'dnd',
    });

    console.log(`✅ Status bot diperbarui: ${activityName}`);
}

// Fungsi untuk menampilkan perintah !help dengan pesan khusus
function showHelp(message) {
    const helpEmbed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('Daftar list Command Bot')
        .setDescription('Daftar perintah saat ini belum tersedia/coming soon.')
        .setTimestamp()
        .setFooter({ text: 'Terima kasih telah menggunakan bot ini!' });

    message.channel.send({ embeds: [helpEmbed] });
}

// Fungsi untuk menampilkan perintah !helpadm dengan perintah khusus
function showHelpAdmin(message) {
    const helpEmbed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('Daftar list Admin Command Bot')
        .setDescription('Berikut adalah perintah yang hanya bisa digunakan oleh admin:')
        .addFields(
            { name: '!activity [aktivitas]', value: 'Mengubah status aktivitas bot (hanya admin yang bisa menggunakan perintah ini).' }
        )
        .setTimestamp()
        .setFooter({ text: 'Terima kasih telah menggunakan bot ini!' });

    message.channel.send({ embeds: [helpEmbed] });
}

// Event ketika bot sudah online
client.once('ready', () => {
    console.log(`✅ Bot ${client.user.tag} sudah online!`);
    setActivity('Special Private Server'); // Status awal bot
});

// Event untuk welcome message
client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.get('1249040938660007937');
    if (!channel) return;

    const welcomeMessage = `Halo ${member.user}, selamat datang di **${member.guild.name}**! 🎉`;
    await channel.send(welcomeMessage);
});

// Event untuk menangani perintah
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    // Cek apakah pengirim pesan memiliki role yang diizinkan untuk menggunakan perintah tertentu
    const member = message.guild.members.cache.get(message.author.id);
    const hasRole = member.roles.cache.some(role => allowedRoles.includes(role.id));

    // Perintah !activity (Hanya admin yang bisa)
    if (command === 'activity') {
        if (!hasRole) {
            await message.channel.send('❌ Kamu tidak memiliki izin untuk menggunakan perintah `!activity`.');
            return;
        }

        const activity = args.join(' ');
        if (activity) {
            setActivity(activity);
            await message.channel.send(`✅ Aktivitas bot diperbarui menjadi: **${activity}**`);
        } else {
            await message.channel.send('❌ Gunakan format: `!activity [nama aktivitas]`');
        }
    }

    // Perintah !helpadm (Hanya admin yang bisa)
    else if (command === 'helpadm') {
        if (!hasRole) {
            await message.channel.send('❌ Kamu tidak memiliki izin untuk menggunakan perintah `!helpadm`.');
            return;
        }

        showHelpAdmin(message);
    }
    
    // Perintah !help (Menampilkan informasi dasar)
    else if (command === 'help') {
        showHelp(message);
    }

    // Pastikan tidak ada perintah yang tidak dikenal
    return;
});

// Login bot
client.login(process.env.TOKEN);
