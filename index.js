const express = require("express")
const app = express()

const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
res.send("HansMD Bot is Running ✅")
})

app.listen(PORT, () => {
console.log("Server running on port " + PORT)
})


// ======================
// ERROR HANDLERS
// ======================

process.on("uncaughtException", err => {
console.log("UNCAUGHT EXCEPTION:")
console.log(err)
})

process.on("unhandledRejection", err => {
console.log("UNHANDLED REJECTION:")
console.log(err)
})


// ======================
// IMPORTS
// ======================

const {
default: makeWASocket,
useMultiFileAuthState,
fetchLatestBaileysVersion,
downloadContentFromMessage,
DisconnectReason
} = require("@whiskeysockets/baileys")

const P = require("pino")
const os = require("os")
const qrcode = require("qrcode-terminal")

const OWNER_NUMBER = "233204908710@s.whatsapp.net"


// ======================
// START BOT
// ======================

async function startBot() {

const { state, saveCreds } =
await useMultiFileAuthState("./session")

const { version } =
await fetchLatestBaileysVersion()

const sock = makeWASocket({
version,
printQRInTerminal: true,
logger: P({ level: "silent" }),
auth: state,
browser: ["HansMD", "Chrome", "1.0.0"]
})


// ======================
// CONNECTION UPDATE
// ======================

sock.ev.on("connection.update", async (update) => {

const { connection, lastDisconnect, qr } = update

if (qr) {

console.log("Scan The QR Code Below 👇")

qrcode.generate(qr, {
small: true
})

}

if (connection === "open") {

console.log("HansMD Connected ✅")

}

if (connection === "close") {

console.log("Connection Closed ❌")

const statusCode =
lastDisconnect?.error?.output?.statusCode

console.log("Status Code:", statusCode)

const shouldReconnect =
statusCode !== DisconnectReason.loggedOut

if (shouldReconnect) {

console.log("Reconnecting...")
startBot()

} else {

console.log("Logged out from WhatsApp.")

}

}

})


// ======================
// SAVE SESSION
// ======================

sock.ev.on("creds.update", saveCreds)


// ======================
// MESSAGE LISTENER
// ======================

sock.ev.on("messages.upsert", async ({ messages }) => {

console.log(JSON.stringify(messages, null, 2))

try {

const mek = messages[0]

if (!mek.message) return

// REMOVE THIS LINE FOR TESTING
// if (mek.key.fromMe) return

const from = mek.key.remoteJid

const msg = mek.message

const text =
msg.conversation ||
msg.extendedTextMessage?.text ||
msg.imageMessage?.caption ||
msg.videoMessage?.caption ||
""

console.log("Message:", text)


// ======================
// AUTO STATUS VIEW
// ======================

if (from === "status@broadcast") {

console.log("Viewed Status ✅")

await sock.readMessages([mek.key])

await sock.sendMessage(
"status@broadcast",
{
react: {
text: "❤️",
key: mek.key
}
}
)

return
}


// ======================
// MAIN COMMANDS
// ======================

if (text === ".ping") {

await sock.sendMessage(from, {
text: "Pong 🏓"
})

}

else if (text === ".alive") {

await sock.sendMessage(from, {
text: "HansMD is Alive ✅"
})

}

else if (text === ".owner") {

await sock.sendMessage(from, {
text: "Owner : Mr Hans 👑"
})

}

else if (text === ".runtime") {

const runtime = process.uptime()

await sock.sendMessage(from, {
text: `Runtime ⏱️ : ${Math.floor(runtime)} seconds`
})

}

else if (text === ".status") {

await sock.sendMessage(from, {
text: "Bot Status ✅ Online"
})

}

else if (text === ".cpu") {

await sock.sendMessage(from, {
text: `CPU Cores 🖥️ : ${os.cpus().length}`
})

}

else if (text === ".ram") {

const ram =
(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)

await sock.sendMessage(from, {
text: `RAM 💾 : ${ram} GB`
})

}

else if (text === ".time") {

const time = new Date().toLocaleTimeString()

await sock.sendMessage(from, {
text: `Current Time ⏰ : ${time}`
})

}

else if (text === ".date") {

const date = new Date().toDateString()

await sock.sendMessage(from, {
text: `Today's Date 📅 : ${date}`
})

}


// ======================
// AUTO REPLIES
// ======================

else if (text.toLowerCase() === "hi") {

await sock.sendMessage(from, {
text: "Hello 👋 I am HansMD Bot"
})

}

else if (text.toLowerCase() === "hello") {

await sock.sendMessage(from, {
text: "Hi there 😊"
})

}

else if (text.toLowerCase() === "goodnight") {

await sock.sendMessage(from, {
text: "Goodnight 🌙 Sleep well"
})

}


// ======================
// FUN COMMANDS
// ======================

else if (text === ".joke") {

await sock.sendMessage(from, {
text: "Why do programmers love dark mode? Because light attracts bugs 😂"
})

}

else if (text === ".quote") {

await sock.sendMessage(from, {
text: "Success comes from consistency 💯"
})

}

else if (text === ".truth") {

await sock.sendMessage(from, {
text: "Truth 🤔 : What is your biggest secret?"
})

}

else if (text === ".dare") {

await sock.sendMessage(from, {
text: "Dare 😈 : Send a funny voice note."
})

}

else if (text === ".hack") {

await sock.sendMessage(from, {
text: "Access Granted 💻\nInjecting Hollywood Hacker Animation..."
})

}

else if (text === ".ship") {

await sock.sendMessage(from, {
text: "Love Percentage ❤️ : 89%"
})

}

else if (text === ".character") {

await sock.sendMessage(from, {
text: "Your Anime Character ⚔️ : Shadow King"
})

}


// ======================
// VIEW ONCE RECOVERY
// ======================

else if (text === ".vv") {

const quoted =
mek.message.extendedTextMessage?.contextInfo?.quotedMessage

if (!quoted) {

return await sock.sendMessage(from, {
text: "Reply to a View Once image/video using .vv"
})

}

let msg =
quoted.viewOnceMessage?.message ||
quoted.viewOnceMessageV2?.message

if (!msg) {

return await sock.sendMessage(from, {
text: "That is not a View Once message."
})

}


// IMAGE

if (msg.imageMessage) {

const stream = await downloadContentFromMessage(
msg.imageMessage,
"image"
)

let buffer = Buffer.from([])

for await (const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}

await sock.sendMessage(from, {
image: buffer,
caption: "👀 View Once Image Recovered"
})

}


// VIDEO

else if (msg.videoMessage) {

const stream = await downloadContentFromMessage(
msg.videoMessage,
"video"
)

let buffer = Buffer.from([])

for await (const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}

await sock.sendMessage(from, {
video: buffer,
caption: "👀 View Once Video Recovered"
})

}

}


// ======================
// AI COMMAND
// ======================

else if (text.startsWith(".ai ")) {

const query = text.slice(4)

await sock.sendMessage(from, {
text: `AI Response 🤖\n\n${query}`
})

}


// ======================
// MENU
// ======================

else if (text === ".menu") {

await sock.sendMessage(from, {
text: `
╔══════════════╗
      HANSMD BOT
╚══════════════╝

👑 Owner : Mr Hans
⚡ Prefix : .

╭──〔 MAIN MENU 〕──╮
┃ .menu
┃ .ping
┃ .alive
┃ .owner
┃ .runtime
┃ .status
┃ .cpu
┃ .ram
┃ .time
┃ .date
╰────────────────╯

╭──〔 AUTO REPLY 〕──╮
┃ hi
┃ hello
┃ goodnight
╰──────────────────╯

╭──〔 FUN MENU 〕──╮
┃ .joke
┃ .quote
┃ .truth
┃ .dare
┃ .hack
┃ .ship
┃ .character
╰────────────────╯

╭──〔 EXTRA MENU 〕──╮
┃ .vv
┃ .ai hello
╰──────────────────╯
`
})

}

} catch (err) {

console.log("ERROR:")
console.log(err)

}

})

}

startBot()