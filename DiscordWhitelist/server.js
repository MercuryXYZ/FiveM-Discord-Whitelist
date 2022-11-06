// -_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
//   __  __                                               _                      _          
//  |  \/  |   ___   _ __    ___   _   _   _ __   _   _  | |       ___    __ _  | | __  ___ 
//  | |\/| |  / _ \ | '__|  / __| | | | | | '__| | | | | | |      / _ \  / _` | | |/ / / __|
//  | |  | | |  __/ | |    | (__  | |_| | | |    | |_| | | |___  |  __/ | (_| | |   <  \__ \
//  |_|  |_|  \___| |_|     \___|  \__,_| |_|     \__, | |_____|  \___|  \__,_| |_|\_\ |___/
//                                                |___/                                     
// -_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-

/// Config Area ///

var guild = "983065423400550411"; // Your Server Guild ID 
//                 READ IT!!!!!                 \\
// If you don't know how to find out the ID then read this. First, go to User Settings > Advanced > Developer Mode and enable it.
// Second, right click on your discord server on top and click Copy ID.

var botToken = ""; // Your Bot Token.

var whitelistRoles = [ // Roles by ID that are whitelisted.
    ""
]

var blacklistRoles = [ // Roles by Id that are blacklisted.
    ""
]

var notWhitelistedMessage = "You are not Allowlisted join on our Discord: https://discord.gg/3N494m7HCw"
var noGuildMessage = "Join on Discord: https://discord.gg/3N494m7HCw"
var blacklistMessage = "You are banned from the server."
var debugMode = true

/// Code ///
const axios = require('axios').default;
axios.defaults.baseURL = 'https://discord.com/api/v8';
axios.defaults.headers = {
    'Content-Type': 'application/json',
    Authorization: `Bot ${botToken}`
};
function getUserDiscord(source) {
    if(typeof source === 'string') return source;
    if(!GetPlayerName(source)) return false;
    for(let index = 0; index <= GetNumPlayerIdentifiers(source); index ++) {
        if (GetPlayerIdentifier(source, index).indexOf('discord:') !== -1) return GetPlayerIdentifier(source, index).replace('discord:', '');
    }
    return false;
}
on('playerConnecting', (name, setKickReason, deferrals) => {
    let src = global.source;
    deferrals.defer();
    var userId = getUserDiscord(src);

    setTimeout(() => {
        deferrals.update(`Hello ${name}. Your Discord ID is being checked with our whitelist.`)
        setTimeout(async function() {
            if(userId) {
                axios(`/guilds/${guild}/members/${userId}`).then((resDis) => {
                    if(!resDis.data) {
                        if(debugMode) console.log(`'${name}' with ID '${userId}' cannot be found in the assigned guild and was not granted access.`);
                        return deferrals.done(noGuildMessage);
                    }
                    const hasRole = typeof whitelistRoles === 'string' ? resDis.data.roles.includes(whitelistRoles) : resDis.data.roles.some((cRole, i) => resDis.data.roles.includes(whitelistRoles[i]));
                    const hasBlackRole = typeof blacklistRoles === 'string' ? resDis.data.roles.includes(blacklistRoles) : resDis.data.roles.some((cRole, i) => resDis.data.roles.includes(blacklistRoles[i]));
                    if(hasBlackRole) {
                        if(debugMode) console.log(`'${name}' with ID '${userId}' is blacklisted to join this server.`);
                        return deferrals.done(blacklistMessage);
                    }
                    if(hasRole) {
                        if(debugMode) console.log(`'${name}' with ID '${userId}' was granted access and passed the whitelist.`);
                        return deferrals.done();
                    } else {
                        if(debugMode) console.log(`'${name}' with ID '${userId}' is not whitelisted to join this server.`);
                        return deferrals.done(notWhitelistedMessage);
                    }
                }).catch((err) => {
                    if(debugMode) console.log(`^1There was an issue with the Discord API request. Is the guild ID & bot token correct?^7`);
                });
            } else {
                if(debugMode) console.log(`'${name}' was not granted access as a Discord identifier could not be found.`);
                return deferrals.done(`Discord was not detected. Please make sure Discord is running and installed. See the below link for a debugging process - https://docs.faxes.zone/c/fivem/debugging-discord`);
            }
        }, 0)
    }, 0)
})
