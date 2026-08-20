import { Client, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel]
});

// Estado del conteo, por canal (así podés tener el juego en varios canales a la vez)
const estadoConteo = new Map();
// cada entrada: { ultimoNumero: 0, ultimoUsuarioId: null }

function getEstado(channelId) {
    if (!estadoConteo.has(channelId)) {
        estadoConteo.set(channelId, { ultimoNumero: 0, ultimoUsuarioId: null });
    }
    return estadoConteo.get(channelId);
}

client.once("clientReady", () => {
    console.log(`Conectado como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const contenido = message.content.trim();

    // Solo procesamos si el mensaje es puramente un número
    if (!/^\d+$/.test(contenido)) return;

    const numeroEnviado = parseInt(contenido, 10);
    const estado = getEstado(message.channelId);
    const numeroEsperado = estado.ultimoNumero + 1;

    // Regla: el mismo usuario no puede decir dos números seguidos
    if (message.author.id === estado.ultimoUsuarioId) {
        await message.reply("ups, no podés decir dos números seguidos, le toca a otra persona 🙅");
        return;
    }

    // Regla: tiene que ser el número correcto en la secuencia
    if (numeroEnviado !== numeroEsperado) {
        await message.reply(`ups, no tocaba ese número, iba el ${numeroEsperado} 😅`);
        // reiniciamos el conteo al fallar (ajustá esto si querés otra lógica)
        estado.ultimoNumero = 0;
        estado.ultimoUsuarioId = null;
        return;
    }

    // Si está todo bien: reacciona con like, no escribe nada
    await message.react("✅");
    estado.ultimoNumero = numeroEnviado;
    estado.ultimoUsuarioId = message.author.id;
});

client.login(process.env.TOKEN);