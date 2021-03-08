module.exports = {
    name: 'lose',
    description: 'for losers',
    execute(message, args, author){
        const Discord = require('discord.js');
        const mongo_funcs = require('../mongo_funcs')

        // content checks (checks wether or not the pinged user is valid)
        if (!message.mentions.users.size){
          console.log(`${author.username} called lose w/o opponent`)
          return message.channel.send('You need to specify your opponent!')
        }

        if (message.mentions.users.first().id == author.id) {
          console.log(`${author.username} tried to battle themself`)
          return message.channel.send("You can't battle yourself!")
        }

        if (message.mentions.users.first().id == message.client.user.id) {
          console.log(`${author.username} tried to battle the bot`)
          return message.channel.send("you can't battle me! I'm a bot!")
        }

        // find opponent
        let opponent = message.mentions.users.first()

        //create filter and awaitMessages
        let filter = m => m.author.id === opponent.id
        message.channel.send(`${opponent}, did you win? Type 'yes' or 'no' in chat.`).then(() => {
        message.channel.awaitMessages(filter, {
          max: 1,
          time: 60000,
          errors: ['time']
        })
        .then(async message => {
          message = message.first()

          // if game is confirmed:
          if (message.content.toLowerCase() == 'yes' || message.content.toLowerCase() == 'y') {
            // get info from mongo
            authorRating = await mongo_funcs.getRating(author.id)
            opponentRating = await mongo_funcs.getRating(opponent.id)

            authorGP = await mongo_funcs.getGP(author.id)
            opponentGP = await mongo_funcs.getGP(opponent.id)

            authorKval = 32
            opponentKval = 32

            if (authorGP <= 8) {
              authorKval = 16
            }
            if (opponentGP <= 8) {
              opponentKval = 16
            }

            authorWinProb = 1 / (1 + 10 ** ((opponentRating - authorRating) / 400))
            // console.log(`probability of author winning: ${authorWinProb}`)

            opponentWinProb = 1 - authorWinProb
            // console.log(`probability of opponent winning: ${opponentWinProb}`)

            authorNewRating = Math.round(authorRating + authorKval * (0 - authorWinProb))
            // console.log(`new rating author: ${authorNewRating}`)

            opponentNewRating = Math.round(opponentRating + opponentKval * (1 - opponentWinProb))
            // console.log(`new rating author: ${authorNewRating}`) 

            authorDiff = (authorNewRating - authorRating)
            if (authorDiff > 0) {
              authorDiff = `+${authorDiff}`
            }

            opponentDiff = (opponentNewRating - opponentRating)
            if (opponentDiff > 0) {
              opponentDiff = `+${opponentDiff}`
            }

            await mongo_funcs.setRating(author.id, authorNewRating)
            await mongo_funcs.setRating(opponent.id, opponentNewRating)

            authorNewGP = authorGP + 1
            opponentNewGP = opponentGP + 1

            await mongo_funcs.setGP(author.id, authorNewGP)
            await mongo_funcs.setGP(opponent.id, opponentNewGP)
            
            // create embed
            let confirmEmbed = new Discord.MessageEmbed()
            .setColor(0xff007b)
            .setTitle(`${author.username} vs ${opponent.username}`)
            .setDescription(`${opponent.username} won!`)
            .addFields(
              {name: `${author.username}'s elo:`, value: `${authorNewRating} (${authorDiff}), previously ${authorRating}`, inline: true},
              {name: `${opponent.username}'s new elo:`, value: `${opponentNewRating} (${opponentDiff}), previously ${opponentRating}`, inline: true}
            )
            .setFooter(`If you think this is incorrect or feel like something is wrong, feel free to ping a mod!`)
            .setTimestamp()
            message.channel.send(confirmEmbed)

            console.log(`${author.username} claimed loss against ${opponent.username}, they confirmed`)
          }

          // if game is declined:
          else if (message.content.toLowerCase() == 'no' || message.content.toLowerCase() == 'n') {
            message.channel.send(`Command declined, no changes made.`)
            console.log(`${author.username} claimed loss against ${opponent.username}, they declined`)
          } 
          
          // if response is invalid:
          else {
            message.channel.send(`Command declined, invalid response. Type 'yes' or 'no'`)
            console.log(`${author.username} claimed loss against ${opponent.username}, they sent invalid response`)
          }
        })
        .catch(collected => {
          message.channel.send(`Command canceled, time ran out. ${author}, try again! If it hasn't been 1 minute, an error might've occured. Ping @itscountvertigo, please. Thanks!`);
        });
    })
    }
}
