const Discord = require('discord.js');
const client = new Discord.Client();
const { token, bot_id, channel, cameraIP1, cameraIP2, command1, command2, quotes } = require('./config.json');
const moment = require("moment");
const fileSystemi = require("fs");
const executeOrder = require("child_process");
const axios = require('axios');

const totalAmountOfQuotes = quotes.length;


console.log(totalAmountOfQuotes);


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    const message = msg.content.toLowerCase();
    const mentionID = msg.mentions.users

    if (mentionID.has(bot_id) && message.indexOf(command1) > -1) {
        postaaPicture(channel, cameraIP1, 1);
        postaaPicture(channel, cameraIP2, 2);
        console.log("Postaa picture");
    } else if (msg.channel.type === 'dm' && !msg.author.bot && message.indexOf(command2) > -1) {
        const quote = quotes[Math.floor(Math.random() * totalAmountOfQuotes)];
        msg.reply(quote);
    }

});

client.login(token);


async function postaaPicture(channelID, cameraIp, camera) {
    const channel = client.channels.cache.get(channelID);
    const filename = `${moment().format('YYYYMMDD')}`;

    downloadImage(cameraIp, `${filename}-${camera}`).then(function () {
        const quote = quotes[Math.floor(Math.random() * totalAmountOfQuotes)];
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Radio Sputnika presents')
            .attachFiles([`${filename}-${camera}.jpg`])
            .setImage(`attachment://${filename}-${camera}.jpg`)
            .setTimestamp()
            .setFooter(quote);
        channel.send(exampleEmbed).then(function () {
            fileSystemi.unlink(`${filename}-${camera}.jpg`, function (err) {
                if (err) throw err;
                console.log("Filu deleted");
            });
        });
    });

}


async function downloadImage(cameraIp, camera) {
    const url = `http://${cameraIp}/image/jpeg.cgi`
    const path = `${camera}.jpg`
    const writer = fileSystemi.createWriteStream(path)

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}
