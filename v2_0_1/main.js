const Discord = require("discord.js")
const axios = require('axios').default;
const ValorantAPI = require("unofficial-valorant-api")
const { Client, Intents } = require('discord.js');

const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

bot.on("ready", () => {
    console.log(`Logged in as ${bot.user.tag}!`)
    bot.user.setActivity('Use !info for commands!');
})

bot.on("messageCreate", msg => {
    data = msg
    msg = msg.content
    if (msg.substring(0, 1) == '!') {
        var args = msg.substring(1).split(' ');
        var cmd = args[0];
        var t1 = ''
        var t2 = ''
        args = args.splice(1);
        newSwitch(cmd, args, data.channelID, msg, data)
    }
});

async function fetchMMR(version, region, name, tag, chID, data) {
    const mmr = await ValorantAPI.getMMR(version, region, name, tag)
    if(mmr.status == 404){
        data.channel.send("Invalid player. Try again")
        return;
    }
    if(mmr.status == 400){
        data.channel.send("Unable to view player data.")
        return;
    }
    if(mmr.status == 429){
        data.channel.send("Error please try again.")
        return;
    }
    var part_1 = mmr.data.currenttierpatched
    var part_2 = mmr.data.ranking_in_tier
    var part_3 = mmr.data.elo
    var final_msg = part_1 + ' - ' + part_2 + 'rr - ' + part_3 + ' total elo'
    console.log("Successfully checked  player: " + name + "#" + tag)
    data.channel.send(final_msg)
}

async function fetchTeamMMR(version, region, name, tag, chID, data) {
    const mmr = await ValorantAPI.getMMR(version, region, name, tag)
    if(mmr.status != 200){
        var msg = name + '#' + tag
        msg += ': Unavailable'
        return msg;
    }
    var part_1 = mmr.data.currenttierpatched
    var part_2 = mmr.data.ranking_in_tier
    var part_3 = mmr.data.elo
    var final_msg = name + '#' + tag + ': ' + part_1 + ' - ' + part_2 + 'rr - ' + part_3 + ' total elo'
    return final_msg;
    
}

function newSwitch(cmd, args, channelID, message, data){
    var t1 = ''
    var t2 = ''
    switch (cmd){
        case 'player':
            var IGN = args[0].split('#')
            fetchMMR("v1", args[1], IGN[0], IGN[1], channelID, data)
            break;
        case 'match':
            var msgs = ''
            var gID = args[0]
            axios.get(`https://dtmwra1jsgyb0.cloudfront.net/matches/${gID}?extend%5Btop.team%5D%5Bplayers%5D%5Buser%5D=true&extend%5Btop.team%5D%5BpersistentTeam%5D=true&extend%5Bbottom.team%5D%5Bplayers%5D%5Buser%5D=true&extend%5Bbottom.team%5D%5BpersistentTeam%5D=true&extend%5Bstats%5D=true`)
            .then((response)=>{
                var p_list = response.data[0].top.team.players
                var count1 = 0
                var count1_lim = 0
                for (let player of p_list){
                    var ign = player.inGameName
                    if (ign.includes('#')){
                        count1_lim += 1
                    }
                }
                for(let player of p_list){
                    var ign = player.inGameName
                    if(ign.includes('#')){
                        var IGN = ign.split('#')
                        fetchTeamMMR('v1', args[1], IGN[0], IGN[1], channelID, data)
                        .then(function(result) {
                            count1 += 1
                            t1 += result + '\n'
                            if(count1 == count1_lim){
                                msgs += '__***Team 1:***__\n'
                                msgs += t1
                            }
                            return
                        })
                    }
                }
                p_list = response.data[0].bottom.team.players
                var count2 = 0
                var count2_lim = 0
                for(let player of p_list){
                    if (player.inGameName.includes('#')){
                        count2_lim += 1
                    }
                }
                for(let player of p_list){
                    var ign = player.inGameName
                    if(ign.includes('#')){
                        var IGN = ign.split('#')
                        fetchTeamMMR('v1', args[1], IGN[0], IGN[1], channelID, data)
                        .then(function(result) {
                            count2 += 1
                            t2 += result + '\n'
                            if(count2 == count2_lim){
                                msgs += '\n__***Team 2:***__\n'
                                msgs += t2
                                if(msgs.includes('Team 1') && msgs.includes('Team 2')){
                                    data.channel.send(msgs)
                                    console.log("Successfully checked matchID: " + gID)
                                } else {
                                    newSwitch(cmd, args, channelID, message, data)
                                }
                                return
                            }
                        })
                    }
                }
            })
            break;
        case 'support':
            data.channel.send('Discord: Diggy#2522\nTwitter: @xdiiggy')
            console.log('Command => Support')
            break;
        case 'donate':
            data.channel.send('Want to help keep the server running and updated?\nAny help is greatly appreciated, donations can go here:\n<https://paypal.me/AntonioM4172>')
            console.log('Command => Donate')
            break;
        case 'info':
            var msgs = 'All commands must follow a \' ! \'\n\n'
            msgs += '`player [NAME]#[TAG] [REIGON]`\n'
            msgs += '`\t[REIGON] options: ap, br, eu, kr, latam, na`\n\n'
            msgs += '\tWill return the current players current rank, current RR\n'
            msgs += '\tand their total ELO.\n\n'
            msgs += '`match [MATCH ID] [REIGON]`\n'
            msgs += '\t`[REIGON] options: ap, br, eu, kr, latam, na`\n\n'
            msgs += '\t`[MATCHID]: This will be a string of numbers that you are`\n'
            msgs += '\table to find in the url of the matchup page. It is the very last\n'
            msgs += '\tsection of the url, everything following the last /. Copy this ID\n'
            msgs += '\tand paste into this field.\n'
            msgs += '\t\n'
            msgs +=  '\t`THIS COMMAND ONLY FOR BATTLEFY TOURNAMENTS`\n\n'
            msgs +=  '\tWill return each players rank, RR, and total ELO. (Refer to `player`)\n'
            msgs +=  '\tand be sorted by team\n\n'
            msgs +=  '`support`\n\n'
            msgs +=  '\tWill give you my creators discord and twitter.\n'
            msgs +=  '\tYou may contact with any questions or concerns about the bot\n'
            msgs +=  '`donate`\n\n'
            msgs +=  '\tWant to help keep the server running and updated?\n'
            msgs +=  '\tMake a small donation to my creators paypal\n\n'
            msgs +=  '`status`\n\n'
            msgs += '\tWill tell you if the bot is running.\n'
            msgs += '\tNOTE: Will not respond if the bot is down, lol.\n'
            data.channel.send(msgs)
            console.log('Command => Info')
            break;
        case 'status':
            data.channel.send("Valorant Rank Check Bot => `Running`")
            console.log('Command => `Status`')
            break;
        default:
            return;
    }
    return
}

bot.login('YOUR.BOT.TOKEN.HERE')
