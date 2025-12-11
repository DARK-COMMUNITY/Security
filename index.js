const express = require("express");
const axios = require("axios");
const fs = require("fs");
const app = express();

app.use(express.json());

// Variables
const TOKEN = process.env.PUBLIC_TOKEN;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const MAIN_CHANNEL_ID = process.env.MAIN_CHANNEL_ID;

// Rango de IPs de Roblox
const allowedRoblox = [
    /^128\.116\./,
    /^20\./,
    /^40\./,
    /^52\./
];

function isRobloxIP(ip) {
    return allowedRoblox.some(r => r.test(ip));
}

async function botSend(content, embed) {
    await axios.post(
        `https://discord.com/api/v10/channels/${MAIN_CHANNEL_ID}/messages`,
        {
            content: content,
            embeds: embed ? [embed] : []
        },
        {
            headers: {
                "Authorization": `Bot ${BOT_TOKEN}`,
                "Content-Type": "application/json"
            }
        }
    );
}

app.post("/webhook", async (req, res) => {
    const ip = req.ip.replace("::ffff:", "");
    const ua = req.headers["user-agent"] || "";
    const auth = req.headers.authorization;

    // VALIDACIONES
    if (!auth || auth !== TOKEN)
        return res.status(403).json({ error: "Invalid token" });

    if (!isRobloxIP(ip))
        return res.status(403).json({ error: "Not Roblox server" });

    if (!ua.includes("Roblox"))
        return res.status(403).json({ error: "Invalid UA" });

    // ====================
    // CLASIFICACIÓN
    // ====================
    const data = req.body;
    const foundAnimals = data.foundAnimals || [];

    const specialAnimals = [
        "Dragon Cannelloni",
        "Strawberry Elephant",
        "Spooky and Pumpky",
        "La Secret Combinasion",
        "Burguro And Fryuro",
        "Mieteteira Bicicleteira",
        "Spaghetti Tualetti",
        "La Spooky Grande",
        "Tictac Sahur",
        "Garama and Madundung",
        "Chipso and Queso",
        "Los Spaghettis",
        "Fragrama and Chocrama",
        "Meowl",
        "Eviledon",
        "Los Puggies", 
        "La Casa Boo",
        "La Taco Combinasion"
    ];

    let specialFound = false;
    for (const item of foundAnimals) {
        for (const sp of specialAnimals) {
            if (item.toLowerCase().includes(sp.toLowerCase())) {
                specialFound = true;
                break;
            }
        }
        if (specialFound) break;
    }

    // =====================
    // ENVÍO AL CANAL (BOT)
    // =====================
    const embed = {
        title: specialFound
            ? "⭐ CATCHES ESPECIALES ENCONTRADOS"
            : "🎯 Nuevo Exploiter Encontrado",
        color: specialFound ? 16766720 : 10038562,
        fields: [
            {
                name: "👤 Jugador",
                value: `Nombre: ${data.playerName}\nDisplay: ${data.displayName}\nUserId: ${data.userId}`
            },
            {
                name: "🎮 Link",
                value: data.link
            },
            {
                name: specialFound ? "⭐ Especiales" : "🏆 Items normales",
                value: "```diff\n" + foundAnimals.map(a => "+ " + a).join("\n") + "```"
            }
        ]
    };

    await botSend(
        specialFound ? "@everyone **SPECIAL CATCH FOUND!**" : "@everyone **NEW PRIVATE SERVER HIT!**",
        embed
    );

    return res.json({ ok: true });
});

// ATAQUES
app.post("/attack-log", async (req, res) => {
    await botSend(
        "⚠️ **INTENTO EXTERNO DETECTADO EN /attack-log**",
        {
            title: "Ataque detectado",
            color: 16753920,
            fields: [
                { name: "IP", value: req.ip },
                { name: "User-Agent", value: req.headers["user-agent"] || "" }
            ]
        }
    );

    res.json({ ok: true });
});

app.listen(process.env.PORT || 3000);
