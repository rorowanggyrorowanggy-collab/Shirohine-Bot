const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const fs = require("fs")

let afkUsers = {}
try { afkUsers = JSON.parse(fs.readFileSync("./afk.json","utf8")||"{}") } catch { afkUsers = {} }
let spamMap = {}, isConnecting = false
const saveAFK = () => fs.writeFileSync("./afk.json", JSON.stringify(afkUsers,null,2))

const RULES_21 = `╔══════════════════════════╗
║ HALOO SELAMAT DATANG DI  ║
║   ANIME LOVERS CORE 🤍   ║
╚══════════════════════════╝
✨ MEMBER BARU TOLONG DIBACA DULU PERATURANNYAAA ✨
┏━━━『 📜 RULES/ATURAN GRUP 📜 』━━━┓
┃ Yang ga ikuti rules akan dikick ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
-1.jangan saling mengejek dan membully.
-2.dilarang mengirim 18+ dan stiker jmk kalau melakukan akan di kick.
-3.jangan ngomong kata kasar atau pun kotor.
-4.jangan promosiin grup lain,KECUALI grup yang udah disediakan 
-5.jangan bahas yang lain lain seperti b0k3p tauran dan lain lain
-6.jangan spam stiker
-7.INI PALING PENTING, jangan telpon telpon grup
-8.jangan ada yang rusuh
-9.member baru harus mengisi intro
-10.gausah ngemis ngemis jadi admin wok
-11.wajib 1 kali lihat foto atau pun video
-12.elaina punya admin tak boleh di ambil,kalo di ambil auto dikick🗿
-13.jangan ngejb wokk🗿
-14.jangan cabul 
-15.jangan ngejek ortu/agama/suku/negara
-16.jangan bertengkar 
-17.jangan nge hama
-18.jangan rasis
-19.jangan ngirim stiker jmk
-20.jika grup mulai sepi usahakan ramein lagi
-21.jangan bucin digrup/cari pacar

┏━━━『 ⏰ GRUP TUTUP/BUKA ⏰ 』━━━┓
┃ 🔒 TUTUP JAM:22.00            ┃
┃ 🔓 BUKA JAM:06.30 TERGANTUNG  ┃
┃ ADMINNYA BANGUN               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`

const INTRO_CARD = `｡ﾟ KARTU INTRO
Kepada : @member
⤷ 🌸 Nama Lengkap : 
⤷ 🔖 Nickname : 
⤷ 🎨 Hobi : 
⤷ 🎭 Askot : 
⤷ 🎂 Umur : 
⤷ ♀️/♂️ Gender : 
⤷ 💍 Waifu / Husbu : 
Arigatou dah join 🤍`

async function startBot(){
    if(isConnecting) return
    isConnecting=true
    const { state, saveCreds } = await useMultiFileAuthState("auth_shirohine")
    const sock = makeWASocket({ 
        auth: state, 
        printQRInTerminal: false,
        browser: ["Ubuntu","Chrome","20.0.04"] 
    })
    sock.ev.on("creds.update", saveCreds)

    // ================= PAIRING CODE UDAH KETANAM NOMOR LO =================
    if(!sock.authState.creds.registered){
        const nomorBot = "6285181835387" // NOMOR LO +62851-8183-5387 UDAH TANAM
        setTimeout(async () => {
            try{
                let code = await sock.requestPairingCode(nomorBot)
                console.log(`\n========================================`)
                console.log(`PAIRING CODE UNTUK 0851-8183-5387: ${code}`)
                console.log(`Buka WA 0851-8183-5387 > Linked Devices > Link with phone number`)
                console.log(`Masukan kode: ${code}`)
                console.log(`========================================\n`)
            }catch(e){ console.log("Gagal pairing:", e.message) }
        }, 3000)
    }

    sock.ev.on("connection.update", ({connection, lastDisconnect})=>{
        if(connection==="open"){ console.log("SHIROHINE V9 PAIRING AKTIF ✅ NOMOR 0851-8183-5387"); isConnecting=false }
        if(connection==="close"){ isConnecting=false; if(lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut) setTimeout(startBot,3000) }
    })

    sock.ev.on("group-participants.update", async (anu)=>{
        for(let num of anu.participants){
            try{
                if(anu.action==="add"){
                    await sock.sendMessage(anu.id, { text: `https://shiroine.com/t/7\nWelcome @${num.split("@")[0]} to the group 🌟Anime lovers core🤍\n\n_Powered by Shiroine Bot_`, mentions:[num] })
                    await new Promise(r=>setTimeout(r,1500))
                    await sock.sendMessage(anu.id, { text: RULES_21 })
                    await sock.sendMessage(anu.id, { text: INTRO_CARD.replace("@member",`@${num.split("@")[0]}`), mentions:[num] })
                }
                if(anu.action==="remove"){
                    await sock.sendMessage(anu.id, { text: `https://shiroine.com/t/14\n👋 Selamat jalan, semoga bahagia selalu!\n\n_Powered by Shiroine Bot_`, mentions:[num] })
                }
            }catch{}
        }
    })

    sock.ev.on("messages.upsert", async ({messages})=>{
        let msg=messages[0]; if(!msg.message||msg.key.fromMe) return
        let from=msg.key.remoteJid; if(!from.endsWith("@g.us")) return
        let sender=msg.key.participant||from
        let body=(msg.message.conversation||msg.message.extendedTextMessage?.text||msg.message.caption||"").toLowerCase()
        let isSticker=!!msg.message.stickerMessage
        let meta=null; try{meta=await sock.groupMetadata(from)}catch{}
        let isBotAdmin=meta?.participants.find(p=>p.id===sock.user.id)?.admin

        const jmkList = ["jmk","b0k3p","bokep","hentai","porn","xxx","18+","cabul","colmek"]
        if(jmkList.some(k=>body.includes(k))){
            if(isBotAdmin) await sock.sendMessage(from,{delete:msg.key}).catch(()=>{})
            return sock.sendMessage(from, { text: `⚠️ @${sender.split("@")[0]} JANGAN KIRIM JMK/18+!\nMelanggar Rules No 2 & 19\nKalau masih lanjut auto kick! 🗿`, mentions:[sender] })
        }

        if(isSticker && isBotAdmin){
            if(!spamMap[from]) spamMap[from]={}; if(!spamMap[from][sender]) spamMap[from][sender]=[]
            spamMap[from][sender].push(Date.now())
            spamMap[from][sender]=spamMap[from][sender].filter(t=>Date.now()-t<10000)
            if(spamMap[from][sender].length>4){
                await sock.sendMessage(from,{delete:msg.key}).catch(()=>{})
                return sock.sendMessage(from,{text:`🚫 @${sender.split("@")[0]} JANGAN SPAM STIKER JMK! Rules No 6 & 19`,mentions:[sender]})
            }
        }

        const toxic=["anjing","bangsat","kontol","memek","tolol","rasis"]
        if(toxic.some(k=>body.includes(k))){
            return sock.sendMessage(from,{text:`🤍 Jaga bahasa @${sender.split("@")[0]}! No bully/toxic/rasis Rules No 1,3,15,18`,mentions:[sender]})
        }

        let key=`${from}_${sender}`
        if(body.startsWith(".afk")){ afkUsers[key]={name:msg.pushName,reason:body.slice(4).trim()||"AFK",time:Date.now()}; saveAFK(); return sock.sendMessage(from,{text:`『XEO』${msg.pushName} AFK: ${afkUsers[key].reason}`}) }
        if(afkUsers[key] && !body.startsWith(".afk")){ let d=Math.floor((Date.now()-afkUsers[key].time)/1000); await sock.sendMessage(from,{text:`『XEO』${msg.pushName} kembali dari AFK ${d}s`}); delete afkUsers[key]; saveAFK() }
    })
}
startBot()
