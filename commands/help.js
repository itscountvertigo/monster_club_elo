module.exports = {
    name: 'help',
    description: 'show cool commands',
    execute: async function (message) {
        const Discord = require('discord.js')

        const helpEmbed = new Discord.MessageEmbed()
        .setColor(0xff007b)
        .setTitle(`About the bot`)
        .setDescription(`This bot was made by @itscountvertigo. If anything is wrong with the bot, ping me! The prefix for this bot is '!'.`)
        .addFields(
            {name: `!win [@opponent] [gamemode] / !lose [@opponent] [gamemode]`, value: `These commands are used to input a game. The bot will ask the opponent's confirmation and update your ratings accordingly.`},
            {name: `!leaderboard [gamemode]`, value: `This shows a leaderboard of the current highest rated players.`},
            {name: `!rating [@target (optional)] [gamemode]`, value: `Shows you your rating. If you ping a user (eg. '!rating @itscountvertigo), it'll show that user's rating.`},
            {name: `!help / !commands / !about`, value: `Shows you this message.`},
            {name: '!turtles', value: `shows some love to turtles. You can use this as a ping command, to check if the bot's up :)`},
            {name: `Moderator commands`, value: `These don't include moderator commands. Most users can't use them. If you do have appropriate role and you can't figure something out, mention / dm me!`}
        )
        .setFooter(`If you think this is incorrect or feel like something is wrong, feel free to ping a mod!`)
        .setTimestamp()
        message.channel.send(helpEmbed)
    }
}