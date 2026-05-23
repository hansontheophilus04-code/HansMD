const express = require("express")
const app = express()

const axios = require("axios")
const os = require("os")
const fs = require("fs")
const P = require("pino")
const qrcode = require("qrcode-terminal")

const {
default: makeWASocket,
useMultiFileAuthState,
fetchLatestBaileysVersion,
downloadContentFromMessage,
DisconnectReason,
delay
} = require("@whiskeysockets/baileys")

// ======================
// SETTINGS
// ======================

const PORT = process.env.PORT || 3000
const PREFIX = "."
const OWNER_NUMBER = "233204908710@s.whatsapp.net"

// ======================
// EXPRESS SERVER
// ======================

app.get("/", (req, res) => {
res.send("HansMD Advanced Bot Running ✅")
})

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`)
})

// ======================
// DATABASE
// ======================

let users = {}
let antiLinkGroups = {}
let autoReply = true

if (fs.existsSync("./users.json")) {
users = JSON.parse(fs.readFileSync("./users.json"))
}

if (fs.existsSync("./antilink.json")) {
antiLinkGroups = JSON.parse(
fs.readFileSync("./antilink.json")
)
}

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
// SAVE DATABASE
// ======================

function saveDB() {

fs.writeFileSync(
"./users.json",
JSON.stringify(users, null, 2)
)

fs.writeFileSync(
"./antilink.json",
JSON.stringify(antiLinkGroups, null, 2)
)

}

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
logger: P({ level: "silent" }),
printQRInTerminal: false,
auth: state,
browser: ["HansMD", "Chrome", "5.0.0"]
})

// ======================
// CONNECTION
// ======================

sock.ev.on("connection.update", async update => {

const {
connection,
lastDisconnect,
qr
} = update

if (qr) {

console.log("Scan QR Below 👇")

qrcode.generate(qr, {
small: true
})

}

if (connection === "open") {

console.log("HansMD Connected ✅")

}

if (connection === "close") {

const statusCode =
lastDisconnect?.error?.output?.statusCode

console.log("Disconnected:", statusCode)

if (
statusCode !== DisconnectReason.loggedOut
) {

console.log("Reconnecting...")
startBot()

}

}

})

// ======================
// SAVE CREDS
// ======================

sock.ev.on("creds.update", saveCreds)

// ======================
// WELCOME & GOODBYE
// ======================

sock.ev.on(
"group-participants.update",
async data => {

try {

for (let user of data.participants) {

if (data.action === "add") {

await sock.sendMessage(data.id, {
text:
`👋 Welcome @${user.split("@")[0]} to HansMD Group`,
mentions: [user]
})

}

if (data.action === "remove") {

await sock.sendMessage(data.id, {
text:
`😢 Goodbye @${user.split("@")[0]}`,
mentions: [user]
})

}

}

} catch (err) {
console.log(err)
}

})

// ======================
// MESSAGE LISTENER
// ======================

sock.ev.on("messages.upsert", async ({ messages }) => {

try {

const mek = messages[0]

if (!mek.message) return

const from = mek.key.remoteJid

const isGroup = from.endsWith("@g.us")

const sender =
mek.key.participant || from

const isOwner =
sender === OWNER_NUMBER

const msg = mek.message

const text =
msg.conversation ||
msg.extendedTextMessage?.text ||
msg.imageMessage?.caption ||
msg.videoMessage?.caption ||
""

if (!text) return

console.log("Message:", text)

// ======================
// AUTO STATUS VIEW
// ======================

if (from === "status@broadcast") {

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
// AUTO REACT
// ======================

await sock.sendMessage(from, {
react: {
text: "⚡",
key: mek.key
}
})

// ======================
// LEVEL SYSTEM
// ======================

if (!users[sender]) {

users[sender] = {
xp: 0,
level: 1
}

}

users[sender].xp += 5

if (
users[sender].xp >=
users[sender].level * 100
) {

users[sender].level += 1

await sock.sendMessage(from, {
text:
`🎉 Level Up!\nNew Level: ${users[sender].level}`
})

}

saveDB()

// ======================
// ANTILINK
// ======================

if (
isGroup &&
antiLinkGroups[from] &&
text.includes("https://chat.whatsapp.com/")
) {

await sock.sendMessage(from, {
delete: mek.key
})

await sock.sendMessage(from, {
text:
"🚫 Group links are forbidden."
})

return

}

// ======================
// COMMANDS
// ======================

if (text === `${PREFIX}ping`) {

await sock.sendMessage(from, {
text: "🏓 Pong!"
})

}

// ======================

else if (text === `${PREFIX}alive`) {

await sock.sendMessage(from, {
text:
"✅ HansMD Advanced Bot Online"
})

}

// ======================

else if (text === `${PREFIX}menu`) {

await sock.sendMessage(from, {
text: `
╔════════════╗
   HANSMD BOT
╚════════════╝

👑 OWNER
┃ .owner
┃ .restart
┃ .shutdown

⚡ MAIN
┃ .ping
┃ .alive
┃ .runtime
┃ .time
┃ .date
┃ .menu

🤖 AI
┃ .ai question

👥 GROUP
┃ .tagall
┃ .hidetag
┃ .kick
┃ .promote
┃ .demote
┃ .antilink on
┃ .antilink off

🎮 FUN
┃ .joke
┃ .quote
┃ .truth
┃ .dare
┃ .ship

📥 MEDIA
┃ .vv
┃ .sticker

⚙️ SYSTEM
┃ .cpu
┃ .ram
┃ .device
┃ .level

🔥 ADVANCED
┃ .spam
┃ .hack
┃ .broadcast
┃ .autoreply on/off
`
})

}

// ======================
// OWNER
// ======================

else if (text === `${PREFIX}owner`) {

await sock.sendMessage(from, {
text: "👑 Owner : Mr Hans"
})

}

// ======================
// RUNTIME
// ======================

else if (text === `${PREFIX}runtime`) {

const runtime = process.uptime()

await sock.sendMessage(from, {
text:
`⏱ Runtime: ${Math.floor(runtime)} seconds`
})

}

// ======================
// CPU
// ======================

else if (text === `${PREFIX}cpu`) {

await sock.sendMessage(from, {
text:
`🖥 CPU Cores: ${os.cpus().length}`
})

}

// ======================
// RAM
// ======================

else if (text === `${PREFIX}ram`) {

const ram =
(os.totalmem() / 1024 / 1024 / 1024)
.toFixed(2)

await sock.sendMessage(from, {
text: `💾 RAM: ${ram} GB`
})

}

// ======================
// DEVICE
// ======================

else if (text === `${PREFIX}device`) {

await sock.sendMessage(from, {
text:
`📱 Platform: ${os.platform()}
🧠 Hostname: ${os.hostname()}
⚙️ Arch: ${os.arch()}`
})

}

// ======================
// TIME
// ======================

else if (text === `${PREFIX}time`) {

await sock.sendMessage(from, {
text:
`⏰ ${new Date().toLocaleTimeString()}`
})

}

// ======================
// DATE
// ======================

else if (text === `${PREFIX}date`) {

await sock.sendMessage(from, {
text:
`📅 ${new Date().toDateString()}`
})

}

// ======================
// LEVEL
// ======================

else if (text === `${PREFIX}level`) {

await sock.sendMessage(from, {
text:
`⭐ XP: ${users[sender].xp}
🏆 Level: ${users[sender].level}`
})

}

// ======================
// TAGALL
// ======================

else if (text === `${PREFIX}tagall`) {

if (!isGroup)
return sock.sendMessage(from, {
text: "Group only."
})

const metadata =
await sock.groupMetadata(from)

const participants =
metadata.participants

let teks =
"📢 TAGGING MEMBERS\n\n"

for (let mem of participants) {

teks +=
`@${mem.id.split("@")[0]}\n`

}

await sock.sendMessage(from, {
text: teks,
mentions:
participants.map(a => a.id)
})

}

// ======================
// HIDETAG
// ======================

else if (text.startsWith(`${PREFIX}hidetag`)) {

if (!isGroup)
return sock.sendMessage(from, {
text: "Group only."
})

const metadata =
await sock.groupMetadata(from)

const participants =
metadata.participants

const message =
text.replace(`${PREFIX}hidetag`, "")

await sock.sendMessage(from, {
text: message,
mentions:
participants.map(a => a.id)
})

}

// ======================
// ANTILINK
// ======================

else if (
text === `${PREFIX}antilink on`
) {

antiLinkGroups[from] = true

saveDB()

await sock.sendMessage(from, {
text: "✅ AntiLink Enabled"
})

}

else if (
text === `${PREFIX}antilink off`
) {

delete antiLinkGroups[from]

saveDB()

await sock.sendMessage(from, {
text: "❌ AntiLink Disabled"
})

}

// ======================
// AI
// ======================

else if (
text.startsWith(`${PREFIX}ai `)
) {

const query = text.slice(4)

try {

const res = await axios.get(
`https://api.popcat.xyz/chatbot?msg=${encodeURIComponent(query)}&owner=Hans&botname=HansMD`
)

await sock.sendMessage(from, {
text:
`🤖 AI RESPONSE\n\n${res.data.response}`
})

} catch {

await sock.sendMessage(from, {
text: "AI failed."
})

}

}

// ======================
// VIEW ONCE
// ======================

else if (text === `${PREFIX}vv`) {

const quoted =
mek.message.extendedTextMessage
?.contextInfo?.quotedMessage

if (!quoted)
return sock.sendMessage(from, {
text:
"Reply to a view once media."
})

let viewOnce =
quoted.viewOnceMessage?.message ||
quoted.viewOnceMessageV2?.message

if (!viewOnce)
return sock.sendMessage(from, {
text: "Not view once."
})

// IMAGE

if (viewOnce.imageMessage) {

const stream =
await downloadContentFromMessage(
viewOnce.imageMessage,
"image"
)

let buffer = Buffer.from([])

for await (const chunk of stream) {
buffer =
Buffer.concat([buffer, chunk])
}

await sock.sendMessage(from, {
image: buffer,
caption:
"👀 Recovered View Once Image"
})

}

// VIDEO

else if (viewOnce.videoMessage) {

const stream =
await downloadContentFromMessage(
viewOnce.videoMessage,
"video"
)

let buffer = Buffer.from([])

for await (const chunk of stream) {
buffer =
Buffer.concat([buffer, chunk])
}

await sock.sendMessage(from, {
video: buffer,
caption:
"👀 Recovered View Once Video"
})

}

}

// ======================
// SPAM
// ======================

else if (
text.startsWith(`${PREFIX}spam `)
) {

if (!isOwner)
return sock.sendMessage(from, {
text: "Owner only."
})

const args =
text.replace(`${PREFIX}spam `, "")
.split("|")

const amount = parseInt(args[0])
const spamText = args[1]

if (!amount || !spamText)
return sock.sendMessage(from, {
text:
"Example:\n.spam 5|hello"
})

for (let i = 0; i < amount; i++) {

await sock.sendMessage(from, {
text: spamText
})

await delay(500)

}

}

// ======================
// BROADCAST
// ======================

else if (
text.startsWith(`${PREFIX}broadcast `)
) {

if (!isOwner)
return sock.sendMessage(from, {
text: "Owner only."
})

const bcText =
text.replace(`${PREFIX}broadcast `, "")

const chats =
Object.keys(sock.chats)

for (let id of chats) {

await sock.sendMessage(id, {
text:
`📢 BROADCAST\n\n${bcText}`
})

}

}

// ======================
// AUTOREPLY
// ======================

else if (
text === `${PREFIX}autoreply on`
) {

autoReply = true

await sock.sendMessage(from, {
text: "✅ AutoReply Enabled"
})

}

else if (
text === `${PREFIX}autoreply off`
) {

autoReply = false

await sock.sendMessage(from, {
text: "❌ AutoReply Disabled"
})

}

// ======================
// AUTO REPLIES
// ======================

else if (
autoReply &&
text.toLowerCase() === "hi"
) {

await sock.sendMessage(from, {
text: "👋 Hello from HansMD"
})

}

else if (
autoReply &&
text.toLowerCase() === "hello"
) {

await sock.sendMessage(from, {
text: "😊 Hi there"
})

}

// ======================
// FUN
// ======================

else if (text === `${PREFIX}joke`) {

await sock.sendMessage(from, {
text:
"😂 Why do Java developers wear glasses? Because they don't C#."
})

}

else if (text === `${PREFIX}quote`) {

await sock.sendMessage(from, {
text:
"💯 Discipline creates success."
})

}

else if (text === `${PREFIX}truth`) {

await sock.sendMessage(from, {
text:
"🤔 What is your darkest secret?"
})

}

else if (text === `${PREFIX}dare`) {

await sock.sendMessage(from, {
text:
"😈 Dance for 30 seconds."
})

}

else if (text === `${PREFIX}ship`) {

const percent =
Math.floor(Math.random() * 100)

await sock.sendMessage(from, {
text:
`❤️ Love Percentage: ${percent}%`
})

}

else if (text === `${PREFIX}hack`) {

await sock.sendMessage(from, {
text:
`💻 HACKING STARTED...

█10%
██20%
███30%
████40%
█████50%
██████60%
███████70%
████████80%
█████████90%
██████████100%

ACCESS GRANTED ✅`
})

}

// ======================
// RESTART
// ======================

else if (text === `${PREFIX}restart`) {

if (!isOwner)
return sock.sendMessage(from, {
text: "Owner only."
})

await sock.sendMessage(from, {
text: "♻ Restarting..."
})

process.exit()

}

// ======================
// SHUTDOWN
// ======================

else if (text === `${PREFIX}shutdown`) {

if (!isOwner)
return sock.sendMessage(from, {
text: "Owner only."
})

await sock.sendMessage(from, {
text: "🛑 Shutting down..."
})

process.exit(1)

}

} catch (err) {

console.log("ERROR:")
console.log(err)

}

})s

}

startBot()