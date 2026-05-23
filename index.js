const {
default: makeWASocket,
useMultiFileAuthState,
fetchLatestBaileysVersion,
DisconnectReason
} = require("@whiskeysockets/baileys")

const P = require("pino")
const os = require("os")
const qrcode = require("qrcode-terminal")

async function startBot() {

const { state, saveCreds } = await useMultiFileAuthState("./session")

const { version } = await fetchLatestBaileysVersion()

const sock = makeWASocket({
version,
logger: P({ level: "silent" }),
auth: state,
browser: ["HansMD", "Chrome", "1.0.0"]
})


// QR CODE

sock.ev.on("connection.update", async (update) => {

const { connection, lastDisconnect, qr } = update

if (qr) {
console.log("Scan this QR code:\n")
qrcode.generate(qr, { small: true })
}

if (connection === "open") {
console.log("HansMD Connected ✅")
}

if (connection === "close") {

const shouldReconnect =
lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

console.log("Connection closed.")

if (shouldReconnect) {
startBot()
}

}

})


// SAVE SESSION

sock.ev.on("creds.update", saveCreds)


// MESSAGES

sock.ev.on("messages.upsert", async ({ messages }) => {

try {

const msg = messages[0]

if (!msg.message) return
if (msg.key.fromMe) return

const from = msg.key.remoteJid

const text =
msg.message.conversation ||
msg.message.extendedTextMessage?.text ||
""

console.log("Message:", text)


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

const ram = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2)

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

╭──〔 FUN MENU 〕──╮
┃ .joke
┃ .quote
┃ .truth
┃ .dare
┃ .hack
┃ .ship
┃ .character
╰────────────────╯

╭──〔 AI MENU 〕──╮
┃ .ai hello
╰────────────────╯
`
})

}

} catch (err) {

console.log("Error:", err)

}

})

}

startBot()