import {Client, GatewayIntentBits, Partials} from "discord.js";
import dotenv from "dotenv";

dotenv.config();


const client = new Client({
    intents:[GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials:[
        Partials.Channel
    ]
});

client.once("clientReady", () => {
    console.log(`Conectado como ${client.user.tag}`);
});

let contador = 0;
let ultimoUsuarioId = null;

client.on("messageCreate",(message) => {
    if (message.author.bot) return;

    const numero = Number(message.content);

    if (isNaN(numero)) return;


    const usuarioId = message.author.id;

    if(usuarioId === ultimoUsuarioId){
        contador = 0;
        ultimoUsuarioId = null;
        message.channel.send("No podes decir dos números seguidos, le toca a otra persona");
        return;
    }

    ultimoUsuarioId = usuarioId;


    contador++;
   

    if (contador === numero){
        message.react("✅");
    }else{
        contador = 0;
        message.channel.send("Incorrecto, se reinicia el conteo");
    }

}
);

client.login(process.env.TOKEN);
