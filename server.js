const Discord = require("discord.js");
const client = new Discord.Client();
const db = require("quick.db");
const defprefix = require("./bilgi.json").prefix;

client.on("message", async m => {
    function embed (mesaj) {
        m.channel.send(new Discord.MessageEmbed().setColor("#36393F").setDescription(mesaj).setFooter(m.author.tag + " tarafından istendi.").setTimestamp());
    }
    if(!db.get(`${m.guild.id}.para`)) {
        db.set(`${m.guild.id}.para`, []);
    }
    if(!db.get(`${m.guild.id}.ekonomi`)) {
        db.set(`${m.guild.id}.ekonomi`, {parabirimi:require("./bilgi.json").parabirimi});
    }
    if(!db.get(`${m.guild.id}.para`).some(i=> i.id === m.author.id)) {
        db.push(`${m.guild.id}.para`,{id:m.author.id,para:0});
    }
    let prefix = db.get(`prefix.${m.guild.id}`) || defprefix;
    if(m.author.bot || m.channel.type === "dm" || !m.content.startsWith(prefix)) return;
    let arg = m.content.replace(prefix, "").split(" ");
    let args = arg.slice(1);
    let kmt = arg[0];
    
    if (kmt === "eval") {
        if(m.author.id !== "460154149040947211") return;
        try {
            const code = args.join(" ");
            let evaled = eval(code);
            if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
            m.channel.send(new Discord.MessageEmbed().setColor("#36393F").setDescription("```js\n" + evaled || "null" + "```").setFooter(m.author.tag + " tarafından istendi.").setTimestamp(), {split:true});
        } catch (err) {
            embed(`\`Hata\`\n \`\`\`xl\n${err || "null"}\n\`\`\``);
        }
    }
    if(kmt == "para") {
        let para = db.get(`${m.guild.id}.para`);
        if(!db.get(`${m.guild.id}.para`)) {
            db.set(`${m.guild.id}.para`, []);
        }
        if(db.get(`${m.guild.id}.para`).some(i=> i.id === client.user.id)) {
            let a = para.filter(i=> i.id !== client.user.id);
            a.push({id:client.user.id,para:0});
            db.set(`${m.guild.id}.para`, a);
        } else {
            db.push(`${m.guild.id}.para`, {id:client.user.id,para:0});
        }
        para = db.get(`${m.guild.id}.para`);
        if(args[0] == "admin") {
            if(!m.member.hasPermission("ADMINISTRATOR")) return embed("Yetkin yok.");
            if(args[1] === "ekle") {
                if(!m.mentions.users.first()) return embed("Birini etiketlemelisin.");
                if(!args[3] || isNaN(args[3])) return embed("Bir sayı girmelisin.");
                if(Math.floor(args[3]*2/2) < 1) return embed("Bir veya birden büyük bir sayı girmelisin.");
                let eski = para.filter(i=> (i.id !== m.mentions.users.first().id) && (i.id !== m.mentions.users.first().id));
                eski.push({id:m.mentions.users.first().id,para:(para.filter(i=> i.id === m.mentions.users.first().id)[0].para+Math.floor(args[3]*2/2))});
                db.set(`${m.guild.id}.para`, eski);
                embed("<@" + m.mentions.users.first().id + "> adlı üyeye " + args[3] + " " + (db.get(`${m.guild.id}.ekonomi.parabirimi`) || require("./bilgi.json").parabirimi) + " eklendi.");
            } else if(args[1] === "kes") {
                if(!m.mentions.users.first()) return embed("Birini etiketlemelisin.");
                if(!args[3] || isNaN(args[3]) || args[3] < 1) return embed("Bir sayı girmelisin.");
                if(para.filter(i=> i.id === m.mentions.users.first().id)[0].para < args[3]) return embed("Bu üyenin parası yetersiz.");
                let eski = para.filter(i=> (i.id !== m.mentions.users.first().id) && (i.id !== m.mentions.users.first().id));
                eski.push({id:m.mentions.users.first().id,para:(para.filter(i=> i.id === m.mentions.users.first().id)[0].para-Math.floor(args[3]*2/2))});
                db.set(`${m.guild.id}.para`, eski);
                embed("<@" + m.mentions.users.first().id + "> adlı üyeden " + args[3] + " " + (db.get(`${m.guild.id}.ekonomi.parabirimi`) || require("./bilgi.json").parabirimi) + " kesildi.");
            } else if(args[1] === "ayarla") {
                if(!m.mentions.users.first()) return embed("Birini etiketlemelisin.");
                if(!args[3] || isNaN(args[3]) || args[3] < 1) return embed("Bir sayı girmelisin.");
                let eski = para.filter(i=> (i.id !== m.mentions.users.first().id) && (i.id !== m.mentions.users.first().id));
                eski.push({id:m.mentions.users.first().id,para:Math.floor(args[3]*2/2)});
                db.set(`${m.guild.id}.para`, eski);
                embed("<@" + m.mentions.users.first().id + "> adlı üyenin parası " + args[3] + " " + (db.get(`${m.guild.id}.ekonomi.parabirimi`) || require("./bilgi.json").parabirimi) + " olarak ayarlandı.");
            } else if(args[1] === "parabirimi") {
                if(!args[2]) return embed("Para birimini girmelisin.");
                db.set(`${m.guild.id}.ekonomi.parabirimi`, args.slice(2).join(" "));
                embed("Para birimi `" + args.slice(2).join(" ") + "` olarak ayarlandı.");
            } else return embed("Doğru kullanım: "+prefix+"para admin <args: ekle, kes, ayarla, parabirimi>");
        } else if(args[0] === "ver") {
            if(!m.mentions.users.first()) return embed("Birini etiketlemelisin.");
            if(m.mentions.users.first().id === m.author.id) return embed("Kendine para veremezsin.");
            if(!args[2] || isNaN(args[2]) || args[2] < 1) return embed("Bir sayı girmelisin.");
            if(Math.floor(args[2]*2/2) > para.filter(i=> i.id === m.author.id)[0].para) return embed("Paran yetersiz.");
            let eski = para.filter(i=> (i.id !== m.author.id) && (i.id !== m.mentions.users.first().id));
            eski.push({id:m.author.id,para:(para.filter(i=> i.id === m.author.id)[0].para-Math.floor(args[2]*2/2))});
            eski.push({id:m.mentions.users.first().id,para:((para.some(i=> i.id === m.mentions.users.first().id) ? para.filter(i=> i.id === m.mentions.users.first().id)[0].para : 0)+Math.floor(args[2]*2/2))});
            db.set(`${m.guild.id}.para`, eski);
            embed("<@" + m.mentions.users.first().id + "> adlı üyeye " + args[2] + " " + (db.get(`${m.guild.id}.ekonomi.parabirimi`) || require("./bilgi.json").parabirimi) + " verildi.");
        } else if(args[0] === "liderler" || args[0] === "liderlik" || args[0] === "lidertablosu") {
            let liderlist = [];
            liderlist=para.sort(function(a,b){if(a.para>b.para){return -1} else {return 1}})
            let msj = "Sunucudaki para liderleri:\n";
            let a = 1;
            liderlist.forEach(i=> {
                msj += a+") <@" + i.id + "> - " + i.para + " " + (db.get(`${m.guild.id}.ekonomi.parabirimi`) || require("./bilgi.json").parabirimi) + "\n";
                a++;
            })
            if(msj.length > 2000) {
                embed("Mesaj çok uzun olduğundan ilk 2000 harf atılıyor.");
                embed(msj.split("").slice(0,1999).join(""));
            } else {
                embed(msj);
            }
        } else if(args[0] && args[0].startsWith("<@!") && m.mentions.users.first()) {
            embed("<@!" + m.mentions.users.first() + "> adlı üyenin parası: " + (para.some(i=> i.id === m.mentions.users.first().id) ? para.filter(i=> i.id === m.mentions.users.first().id)[0].para : 0) + " " + (db.get(`${m.guild.id}.ekonomi.parabirimi`) || require("./bilgi.json").parabirimi));
        } else return embed("Doğru kullanım: <args: " + (m.member.hasPermission("ADMINISTRATOR") ? ["admin", "ver", "liderler", "<üye: user>"] : ["ver", "liderler", "<üye: user>"]).join(", ") + ">");
    }
});

client.login(require("./bilgi.json").token);