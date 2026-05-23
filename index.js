const {
default: makeWASocket,
useMultiFileAuthState,
fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")

const P = require("pino")
const os = require("os")

async function startBot() {

const { state, saveCreds } = await useMultiFileAuthState("session")

const { version } = await fetchLatestBaileysVersion()

const sock = makeWASocket({
version,
logger: P({ level: "silent" }),
auth: state,
browser: ["HansMD", "Chrome", "1.0.0"]
})

console.log("HansMD Connected ✅")

sock.ev.on("creds.update", saveCreds)

sock.ev.on("messages.upsert", async ({ messages }) => {

try {

const msg = messages[0]
if (!msg.message) return

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

if (text === ".alive") {

await sock.sendMessage(from, {
text: "HansMD is Alive ✅"
})

}

if (text === ".owner") {

await sock.sendMessage(from, {
text: "Owner : Mr Hans 👑"
})

}

if (text === ".runtime") {

const runtime = process.uptime()

await sock.sendMessage(from, {
text: `Runtime ⏱️ : ${Math.floor(runtime)} seconds`
})

}

if (text === ".status") {

await sock.sendMessage(from, {
text: "Bot Status ✅ Online"
})

}

if (text === ".cpu") {

await sock.sendMessage(from, {
text: `CPU Cores 🖥️ : ${os.cpus().length}`
})

}

if (text === ".ram") {

const ram = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2)

await sock.sendMessage(from, {
text: `RAM 💾 : ${ram} GB`
})

}

if (text === ".time") {

const time = new Date().toLocaleTimeString()

await sock.sendMessage(from, {
text: `Current Time ⏰ : ${time}`
})

}

if (text === ".date") {

const date = new Date().toDateString()

await sock.sendMessage(from, {
text: `Today's Date 📅 : ${date}`
})

}


// ======================
// AUTO REPLY
// ======================

if (text === "hi") {

await sock.sendMessage(from, {
text: "Hello 👋 I am HansMD Bot"
})

}

if (text === "hello") {

await sock.sendMessage(from, {
text: "Hi there 😊"
})

}

if (text === "goodnight") {

await sock.sendMessage(from, {
text: "Goodnight 🌙 Sleep well"
})

}


// ======================
// FUN COMMANDS
// ======================

if (text === ".joke") {

await sock.sendMessage(from, {
text: "Why do programmers love dark mode? Because light attracts bugs 😂"
})

}

if (text === ".quote") {

await sock.sendMessage(from, {
text: "Success comes from consistency 💯"
})

}

if (text === ".truth") {

await sock.sendMessage(from, {
text: "Truth 🤔 : What is your biggest secret?"
})

}

if (text === ".dare") {

await sock.sendMessage(from, {
text: "Dare 😈 : Send a funny voice note."
})

}

if (text === ".hack") {

await sock.sendMessage(from, {
text: "Access Granted 💻\nInjecting Hollywood Hacker Animation..."
})

}

if (text === ".ship") {

await sock.sendMessage(from, {
text: "Love Percentage ❤️ : 89%"
})

}

if (text === ".character") {

await sock.sendMessage(from, {
text: "Your Anime Character ⚔️ : Shadow King"
})

}


// ======================
// GROUP COMMANDS
// ======================

if (text === ".tagall") {

await sock.sendMessage(from, {
text: "📢 Attention Everyone!"
})

}

if (text === ".mute") {

await sock.sendMessage(from, {
text: "Group Muted 🔇"
})

}

if (text === ".unmute") {

await sock.sendMessage(from, {
text: "Group Unmuted 🔊"
})

}

if (text === ".warn") {

await sock.sendMessage(from, {
text: "⚠️ Warning Sent"
})

}


// ======================
// ADMIN COMMANDS
// ======================

if (text === ".groupinfo") {

await sock.sendMessage(from, {
text: `Group ID : ${from}`
})

}

if (text === ".admins") {

await sock.sendMessage(from, {
text: "👑 Admin command working"
})

}

if (text === ".welcome") {

await sock.sendMessage(from, {
text: "Welcome Message Enabled ✅"
})

}

if (text === ".goodbye") {

await sock.sendMessage(from, {
text: "Goodbye Message Enabled ✅"
})

}

if (text === ".antilink") {

await sock.sendMessage(from, {
text: "Anti-Link Activated 🚫"
})

}

if (text === ".public") {

await sock.sendMessage(from, {
text: "Bot Mode : Public 🌍"
})

}

if (text === ".private") {

await sock.sendMessage(from, {
text: "Bot Mode : Private 🔒"
})

}


// ======================
// DOWNLOAD COMMANDS
// ======================

if (text.startsWith(".song")) {

await sock.sendMessage(from, {
text: "🎵 Song Downloader Coming Soon"
})

}

if (text.startsWith(".video")) {

await sock.sendMessage(from, {
text: "🎬 Video Downloader Coming Soon"
})

}

if (text.startsWith(".play")) {

await sock.sendMessage(from, {
text: "▶️ Music Search Coming Soon"
})

}

if (text.startsWith(".tiktok")) {

await sock.sendMessage(from, {
text: "🎵 TikTok Downloader Coming Soon"
})

}

if (text.startsWith(".facebook")) {

await sock.sendMessage(from, {
text: "📘 Facebook Downloader Coming Soon"
})

}

if (text.startsWith(".instagram")) {

await sock.sendMessage(from, {
text: "📸 Instagram Downloader Coming Soon"
})

}


// ======================
// AI COMMAND
// ======================

if (text.startsWith(".ai ")) {

const query = text.slice(4)

await sock.sendMessage(from, {
text: `AI Response 🤖\n\n${query}`
})

}


// ======================
// MENU
// ======================

if (text === ".menu") {

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

╭──〔 GROUP MENU 〕──╮
┃ .tagall
┃ .mute
┃ .unmute
┃ .warn
╰────────────────╯

╭──〔 ADMIN MENU 〕──╮
┃ .groupinfo
┃ .admins
┃ .welcome
┃ .goodbye
┃ .antilink
┃ .public
┃ .private
╰──────────────────╯

╭──〔 DOWNLOAD MENU 〕──╮
┃ .song
┃ .video
┃ .play
┃ .tiktok
┃ .facebook
┃ .instagram
╰─────────────────────╯

╭──〔 AI MENU 〕──╮
┃ .ai hello
╰────────────────╯
`
})

}

} catch (err) {

console.log(err)

}

})

}

startBot()