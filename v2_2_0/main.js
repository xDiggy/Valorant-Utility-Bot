const Discord       = require("discord.js")
const axios         = require('axios').default;
const ValorantAPI   = require("unofficial-valorant-api")
const { Client, Intents }   = require('discord.js');
const { MessageEmbed }      = require('discord.js')

// ----------------------------------------GLOBALS----------------------------------------
// Links for each rank png
const rank_links = ['', // Unranked
                    '', // Unranked
                    '', // Unranked
                    'https://i.imgur.com/2CmEuP5.png', // Iron 1
                    'https://i.imgur.com/zfT0YQG.png', // Iron 2
                    'https://i.imgur.com/2AAPB25.png', // Iron 3
                    'https://i.imgur.com/usGtGJW.png', // Bronze 1
                    'https://i.imgur.com/MPBdCem.png', // Bronze 2
                    'https://i.imgur.com/0mbo3cI.png', // Bronze 3
                    'https://i.imgur.com/VAVFfbV.png', // Silver 1
                    'https://i.imgur.com/5v3VCsR.png', // Silver 2
                    'https://i.imgur.com/BOzBPrj.png', // Silver 3
                    'https://i.imgur.com/x7kVF65.png', // Gold 1
                    'https://i.imgur.com/9uyuXHZ.png', // Gold 2
                    'https://i.imgur.com/Xu03tnZ.png', // Gold 3
                    'https://i.imgur.com/j483jXc.png', // Platinum 1
                    'https://i.imgur.com/x7AQdZM.png', // Platinum 2
                    'https://i.imgur.com/xNzolxu.png', // Platinum 3
                    'https://i.imgur.com/jergZcy.png', // Diamond 1
                    'https://i.imgur.com/MRQ9bYh.png', // Diamond 2
                    'https://i.imgur.com/BEwTEam.png', // Diamond 3
                    'https://i.imgur.com/SGvuIMw.png', // Ascendant 1
                    'https://i.imgur.com/UYNyNoH.png', // Ascendant 2
                    'https://i.imgur.com/C09ksT9.png', // Ascendant 3
                    'https://i.imgur.com/nOT1dd0.png', // Immortal 1
                    'https://i.imgur.com/Ksyso2y.png', // Immortal 2
                    'https://i.imgur.com/Ll0UTWE.png', // Immortal 3
                    'https://i.imgur.com/KPlTgr0.png'] // Radiant
// Each rank's color
const rank_colors = [   '','','', // Unranked
                        '#6b6c6b','#6b6c6b','#6b6c6b', // Iron
                        '#9c6c14','#9c6c14','#9c6c14', // Bronze
                        '#ced4d1','#ced4d1','#ced4d1', // Silver
                        '#d29025','#d29025','#d29025', // Gold
                        '#3294ac','#3294ac','#3294ac', // Platinum
                        '#d791ec','#d791ec','#d791ec', // Diamond
                        '#5ec492', '#5ec492', '#5ec492', // Ascendant
                        '#c54c65','#c54c65','#c54c65', // Immortal
                        '#edd898']                     // Radiant

// All competitive seasons
const seasons = [   'e1a1','e1a2','e1a3',
                    'e2a1','e2a2','e2a3',
                    'e3a1','e3a2','e3a3',
                    'e4a1','e4a2','e4a3',
                    'e5a1']

//----------------------------------------BOT FUNCTIONS----------------------------------------
// Discord Bot Client
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Logging in the bot and
// setting user activity
bot.on("ready", () => {
    let timestamp = new Date();
    console.log(`${timestamp.getHours()}:${timestamp.getMinutes()}:${String(timestamp.getSeconds()).padStart(2, '0')} => Logged in as ${bot.user.tag}`)
    bot.user.setActivity("Use !info for commands!")
});

// Each message creation
bot.on("messageCreate", message => {
    var data = message
    message = message.content
    // If command key is called
    if(message.substring(0,1) === '!'){
        // Splitting message into array
        let args = message.substring(1).split(' ');
        // Setting respective command
        const command = args[0];
        // Removing command from array
        args = args.splice(1)
        // Calling command
        commandExec(command, args, data, message)
    }
});

// Bot login token
bot.login('YOUR.BOT.TOKEN.HERE')

//----------------------------------------MESSAGE TO COMMAND----------------------------------------
function commandExec (command, args, data){
    if (command === 'info'){
        info(data)
    } else if (command === 'status'){
        status(data)
    } else if (command === 'support'){
        support(data)
    } else if (command === 'donate'){
        donate(data)
    } else if (command === 'player'){
        player_stats(args, data)
    } else if (command === 'match'){
        match_stats(command, args, data)
    }
}

//----------------------------------------COMMANDS----------------------------------------
function info (data){

    // Creating Embed
    const information = new MessageEmbed()
        .setColor('#edd898')
        .setTitle('Command Guide:')
        .addFields(
            {name: '!player `[NAME]#[TAG]`',
            value: 'This will return the players current rank, and their peak rank.' +
                        ' As well as a link to tracker.gg showing their full stats.'},
            {name: '!match `[MATCH_ID]`', value: 'WORK IN PROGRESS', inline: true },
            {name: 'Additional Information:', value: '-This command does take a little bit of time to execute, so please be patient.' + 
                                                        '\n-This command only works with MATCH_ID\'s from BattleFy.' +
                                                        '\n--You can find the MATCH_ID on the last portion of the URL of the match up page.' +
                                                        '\n--EXAMPLE: 625b11ddf531a605f52d1164', inline: true},
            {name: '!info', value: 'Will bring up this command guilde'},
            {name: '!status', value: 'Tells you both RIOT\'s API status, and this bots status.' + 
                                    '\nNOTE: Will not return anything if the bot is down, lol'},
            {name: '!support', value: 'Gives you an invite to a discord server, discord tag, and twitter ' + 
                                        'where you can reach out for any support / suggestions.'},
            {name: '!donate', value: 'Will give you information on where to donate, should you want to help support.'}
        )

        // Sending Embed
        data.channel.send({embeds: [information]})
        let timestamp = new Date()
        console.log(`${timestamp.getHours()}:${timestamp.getMinutes()}:${String(timestamp.getSeconds()).padStart(2, '0')} => Command => info`)
}

async function status (data){
    // API call to check RIOT API
    const available = await ValorantAPI.getStatus('na');

    // Bad Status
    if (available.status !== 200){
        const riot_embed = new MessageEmbed()
            .setColor('#ff0000')
            .addField('RIOT API', ' is down')
            // Sending Embed
        data.channel.send({embeds: [riot_embed]})
        let timestamp = new Date()
        console.log(`${timestamp.getHours()}:${timestamp.getMinutes()}:${String(timestamp.getSeconds()).padStart(2, '0')} => Command => status => RIOT API Error`)

    // Good Status
    } else {
        const riot_embed = new MessageEmbed()
            .setColor('#00ff00')
            .addField('RIOT API', 'is running')

        // Sending Embed
        data.channel.send({embeds: [riot_embed]})
        let timestamp = new Date()
        console.log(`${timestamp.getHours()}:${timestamp.getMinutes()}:${String(timestamp.getSeconds()).padStart(2, '0')} => Command => status => RIOT API is running`)
    }

    // Bot Status
    const bot_embed = new MessageEmbed()
    .setColor('#00ff00')
    .addField('Valorant Rank Check Bot', 'is running')

    // Sending Embed
    data.channel.send({embeds: [bot_embed]})
    let timestamp = new Date()
    console.log(`${timestamp.getHours()}:${timestamp.getMinutes()}:${String(timestamp.getSeconds()).padStart(2, '0')} => Command => status => Valorant Rank Check Bot is running`)
}

function support (data){
    const support = new MessageEmbed()
        .setTitle('Support links:')
        .setColor('#edd898')
        .addFields(
            {name: 'Discord Server', value: "https://discord.gg/rMFax7mgUu"},
            {name: 'Dsicord Account', value: 'Diggy#2522'},
            {name: 'Twitter', value: 'https://twitter.com/xdiiggy'}
        )
    data.channel.send({embeds: [support]})
    let timestamp = new Date()
    console.log(`${timestamp.getHours()}:${timestamp.getMinutes()}:${String(timestamp.getSeconds()).padStart(2, '0')} => Command => Support`)
}

function donate (data){
    const donate = new MessageEmbed()
        .setTitle('Donate')
        .setColor('#edd898')
        .addField('Want to help keep the bot running and updated?', 
                        'Any help is greatly appreciated, *and never required*, and can be sent here\n' +
                        '<https://paypal.me/AntonioM4172>')
    data.channel.send({embeds: [donate]})
}

async function player_stats (args, data){

    // 0: name
    // 1: tag
    const IGN = args[0].split('#');

    // Initial command error checking
    if(!player_error_check(args, data, IGN)){
        return
    }

    // Valorant API call
    const account = await ValorantAPI.getAccount(IGN[0], IGN[1])

    //  Bad status check
    if(account.status !== 200){
        bad_status(data)
        return
    }

    // Setting the players region
    const pRegion = account.data.region;

    // Creating link to Tracker.gg
    const link = 'https://tracker.gg/valorant/profile/riot/' + IGN[0] + '%23' + IGN[1] + '/overview';

    // Current season API call
    const player = await get_rank_data(pRegion, IGN[0], IGN[1], data, true)

    // Rank variables for embed
    const cRankInt = player[0];
    const cRankPatched = player[1];
    const pRankPatched = player[3];

    //-------------------------------------
    // Supposed to be for peak rank icon
    // but the embed does not use emojis
    //
    // var temp = pRankPatched.split(' ')
    // var icon = temp[0] + temp[1] + ''
    //-------------------------------------

    // Creating and sending embedded message 
    // console.log(cRankInt)
    // console.log(cRankPatched)
    // console.log(pRankPatched)
    console.log(player)
    const playerEmbed = new MessageEmbed()
        .setColor(rank_colors[get_rank_int(cRankPatched)])
        .setTitle(IGN[0] + "#" + IGN[1])
        .setDescription('Click to view full stats')
        .setURL(link)
        .setThumbnail(rank_links[get_rank_int(cRankPatched)])
        .addFields(
            { name: 'Current Rank :', value: cRankPatched },
            { name: 'Peak Rank : ', value: pRankPatched},
            { name: '\u200B', value: '\u200B' },    // SPACER
            { name: 'Called by:', value: data.author.username }
        )
    
    data.channel.send({ embeds: [playerEmbed] });
    let timestamp = new Date()
    console.log(`${timestamp.getHours()}:${timestamp.getMinutes()}:${String(timestamp.getSeconds()).padStart(2, '0')} => Command => player => ` + IGN[0] + '#' + IGN[1])
}

async function match_stats (command, args, data){

    // Creating embeds for each team
    const T1_embed = []
    const T2_embed = []

    // Setting Game ID variable
    const gameID = args[0];

    // Axios call in order to get the match data
    const match_data = await axios.get(`https://dtmwra1jsgyb0.cloudfront.net/matches/${gameID}?extend%5Btop.team%5D%5Bplayers%5D%5Buser%5D=true&extend%5Btop.team%5D%5BpersistentTeam%5D=true&extend%5Bbottom.team%5D%5Bplayers%5D%5Buser%5D=true&extend%5Bbottom.team%5D%5BpersistentTeam%5D=true&extend%5Bstats%5D=true`);

    // Getting the players from each team
    let T1_data = match_data.data[0].top.team.players;
    let T2_data = match_data.data[0].bottom.team.players;

    // Reassigning both variables into arrays with [NAME, TAG]
    // for each valid player
    T1_data = get_players(T1_data)
    T2_data = get_players(T2_data)

    // Creating array of embeds for each player in each team
    await create_embed(T1_data, T1_embed, '#ff0000', 'Team 1')
    await create_embed(T2_data, T2_embed, '#0000ff', 'Team 2')

    // Sending all embeds
    data.channel.send({embeds: T1_embed})
    data.channel.send({embeds: T2_embed})
    //
}

//----------------------------------------ERROR CHECKING----------------------------------------

// Simple error checking for invalid player name/tag input
function player_error_check (args, data, IGN) {
    // Not enough arguments OR [TAG] portion is empty
    if (IGN.length < 2 || IGN[1] === ''){
        const error_embed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle('Command Error')
        .addFields(
            { name: 'Error Type: Not enough argumnents', value: 'Make sure you have `NAME`#`TAG`.' +
            '\nYou may want to refer to !info for more help.'}
            )
            
            data.channel.send({embeds: [error_embed]})
        let timestamp = new Date()
        console.log(`${timestamp.getHours()}:${timestamp.getMinutes()}:${String(timestamp.getSeconds()).padStart(2, '0')} => ERROR: player_stats => Not enough arguments`)
        return false
    }

    // Enough Arguments
    return true;
}
    
//----------------------------------------HELPER FUNCTIONS----------------------------------------

// Returning the players rank data in form of array
// 0: Current Rank Int
// 1: Current Rank Text
// 2: Peak Rank Int
// 3: Peak Rank Text
async function get_rank_data (region, name, tag, send_error){

    // Return Array
    const player_data = [];

    // API call
    const player = await ValorantAPI.getMMR('v2', region, name, tag)

    // Bad status check
    //
    // If send_error == true we are in a player call
    // and we can return and send error message.
    // If in match call we just return 'Unknowns'
    // so that the message will be sent, and not
    // halted by 1 bad player.
    if(send_error){
        if(player.status !== 200){
            bad_status(data)
            return
        }
    } else {
        if(player.status !== 200){
            return [3, 'Unknown', 3, 'Unknown']
        }
    }

    // Storing all previous acts
    const act_ranks = player.data.by_season;

    // Setting current rank data    
    player_data[0] = player.data.current_data.currenttier
    player_data[1] = player.data.current_data.currenttierpatched

    // Storing peak rank
    let peakInt = 0;
    let peakPatched = 'Unranked';

    // Looping through each act
    //
    // Checking if the first entry in the act_rank_wins array
    // is bigger than the existing stored peak rank, if so
    // we store that acts rank
    //  ** The first entry in the act is the highest ranked win
    //  ** within that act. After going through each act we can
    //  ** find the higest rank and compare that with the existing
    //  ** higest rank
    //
    // If the act is empty (Player did not play this act), we throw
    // an error and then just continue with the loop
    //
    for (let act in act_ranks){
        try{
            const rankInt = get_rank_int(act_ranks[act].act_rank_wins[0].patched_tier);
            if(rankInt >= peakInt) {
                peakInt = rankInt
                peakPatched = act_ranks[act].act_rank_wins[0].patched_tier
            }
        } catch (error){}
    }

    // Storing peak rank data
    player_data[2] = peakInt
    player_data[3] = peakPatched
    
    // return
    return player_data
}

function get_rank_int (rank) {
    if (rank === "Radiant") { return 27 }
    if (rank === "Immortal 3") { return 26 }
    if (rank === "Immortal 2") { return 25 }
    if (rank === "Immortal 1") { return 24 }
    if (rank === "Ascendant 3") { return 23 }
    if (rank === "Ascendant 2") { return 22 }
    if (rank === "Ascendant 1") { return 21 }
    if (rank === "Diamond 3") { return 20 }
    if (rank === "Diamond 2") { return 19 }
    if (rank === "Diamond 1") { return 18 }
    if (rank === "Platinum 3") { return 17 }
    if (rank === "Platinum 2") { return 16 }
    if (rank === "Platinum 1") { return 15 }
    if (rank === "Gold 3") { return 14 }
    if (rank === "Gold 2") { return 13 }
    if (rank === "Gold 1") { return 12 }
    if (rank === "Silver 3") { return 11 }
    if (rank === "Silver 2") { return 10 }
    if (rank === "Silver 1") { return 9 }
    if (rank === "Bronze 3") { return 8 }
    if (rank === "Bronze 2") { return 7 }
    if (rank === "Bronze 1") { return 6 }
    if (rank === "Iron 3") { return 5 }
    if (rank === "Iron 2") { return 4 }
    if (rank === "Iron 1") { return 3 }
}

// Sends an Error Message to the discord indicating
// a bad status
function bad_status (data){
    const error_embed = new MessageEmbed()
        .setColor('#ff0000')
        .addField('Bad return status from API', 'Please try again or wait a minute')
    data.channel.send({embeds: [error_embed]})
    let timestamp = new Date()
    console.log(`${timestamp.getHours()}:${timestamp.getMinutes()}:${String(timestamp.getSeconds()).padStart(2, '0')} => ERROR   => Bad API status`)
}

function get_players(data){

    // Array with data to return
    const return_array = []

    // Looping through the inputted data
    for(let player of data){

        // Retrieving players name
        // 0: name
        // 1: tag
        let IGN = player.inGameName;

        // If they inputted their name correctly,
        // there should be 1 '#', and we can push
        // the split string the array.
        // if not, skip/continue
        if(IGN.includes('#')){
            IGN = IGN.split('#')
            return_array.push(IGN)
        }
    }

    // return final array
    return return_array
}

async function create_embed(data, embeds, color, team){
    
    // Pushing the first embed to the embeds array
    // *Team Name Embed*
    embeds.push(new MessageEmbed().setColor(color).setTitle(team))

    // Looping through each player in the inputted data
    for(let player of data){

        // Creating initial embed setting team color
        // and player name
        const player_embed = new MessageEmbed()
                                    .setColor(color)
                                    .setTitle((player[0] + '#' + player[1]))

        // API call to get player account information
        const initial = await ValorantAPI.getAccount(player[0], player[1])
        // Getting players region
        const pRegion = initial.data.region

        // Calling helper function to get current
        // and peak rank data
        const pData = await get_rank_data(pRegion, player[0], player[1], false)

        // Trying the creat the embed with the pData,
        // but there may be an empty string in some field
        // which throws an error when trying to put that
        // into an embed field
        try {
            player_embed.setTitle(player[0] + '#' + player[1])
            player_embed.addFields(
                {name: 'Current Rank: ', value: pData[1], inline: true},
                {name: 'Peak Rank: ', value: pData[3], inline: true }
                )
            } catch (error){
                player_embed.setTitle(player[0] + '#' + player[1])
                player_embed.addFields(
                    {name: 'Current Rank: ', value: 'Unknown', inline: true},
                    {name: 'Peak Rank: ', value: 'Unknown', inline: true }
                    )
                continue
        }

        // Pushing completed embed to array
        embeds.push(player_embed)
    }
}