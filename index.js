const express = require("express");
const axios = require("axios");
const fs = require("fs");
const app = express();

app.use(express.json());

// Tokens privados en Railway (NO en el código)
const TOKEN = process.env.PUBLIC_TOKEN;
const WEBHOOK_MAIN = process.env.WEBHOOK_MAIN;
const WEBHOOK_ATTACK = process.env.WEBHOOK_ATTACK;

function logToFile(req, status) {
    const log = `
============================
📅 Fecha: ${new Date().toISOString()}
🌐 IP: ${req.ip}
🔎 Status: ${status}
🧾 User-Agent: ${req.headers["user-agent"]}
📦 Body: ${JSON.stringify(req.body, null, 2)}
============================\n`;

    fs.appendFileSync("./logs.txt", log);
}

/* Endpoint para datos válidos (Roblox) */
app.post("/webhook", async (req, res) => {
    logToFile(req, "REQUEST /webhook");

    const auth = req.headers.authorization;

    if (!auth || auth !== TOKEN) {
        logToFile(req, "BLOQUEADO - TOKEN INVALIDO");

        await axios.post(WEBHOOK_ATTACK, {
            content: "**🚨 Intento Bloqueado — Token Inválido**",
            embeds: [
                {
                    title: "Intento no autorizado",
                    color: 16711680,
                    fields: [
                        { name: "IP", value: req.ip },
                        { name: "User-Agent", value: req.headers["user-agent"] },
                        { name: "Body", value: "```json\n" + JSON.stringify(req.body, null, 2) + "\n```" }
                    ]
                }
            ]
        });

        return res.status(403).json({ error: "Forbidden" });
    }

    if (!req.body || !req.body.playerName) {
        logToFile(req, "BLOQUEADO - BODY INVALIDO");
        return res.status(400).json({ error: "Invalid body" });
    }

    await axios.post(WEBHOOK_MAIN, {
        content: `Nuevo reporte recibido desde Roblox`,
        embeds: [
            {
                title: "📌 Reporte",
                color: 65280,
                fields: [
                    { name: "Jugador", value: req.body.playerName },
                    { name: "Data", value: "```json\n" + JSON.stringify(req.body, null, 2) + "\n```" }
                ]
            }
        ]
    });

    logToFile(req, "ENVIADO A WEBHOOK_MAIN");
    return res.json({ ok: true });
});

/* Endpoint para logs de ataque manual */
app.post("/attack-log", async (req, res) => {
    logToFile(req, "REQUEST /attack-log");

    await axios.post(WEBHOOK_ATTACK, {
        content: "**🚨 Reporte de ataque manual**",
        embeds: [
            {
                title: "Intento externo detectado",
                color: 16753920,
                fields: [
                    { name: "IP", value: req.ip },
                    { name: "User-Agent", value: req.headers["user-agent"] },
                    { name: "Body", value: "```json\n" + JSON.stringify(req.body, null, 2) + "\n```" }
                ]
            }
        ]
    });

    return res.json({ ok: true });
});

app.listen(process.env.PORT || 3000, () =>
    console.log("Servidor corriendo en Railway")
);
