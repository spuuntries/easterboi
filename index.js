require("dotenv").config();

const procenv = process.env,
  Discord = require("discord.js"),
  client = new Discord.Client({
    intents: [
      "GUILDS",
      "GUILD_MEMBERS",
      "GUILD_MESSAGES",
      "GUILD_MESSAGE_REACTIONS",
    ],
  }),
  Enmap = require("enmap"),
  db = new Enmap({ name: "db" });

function login() {
  client.login(procenv.TOKEN).catch(() => {
    console.log("Failed to login, retrying in 5 seconds");
    setTimeout(login, 5000);
  });
}

login();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
})

client.on("messageCreate", async (message) => {
  if (message.author.bot || message.content.trim().startsWith(procenv.PREFIX)) return;
  let args = message.content.split(/ +/g),
		    command = args.shift().toLowerCase();

  if (command == "deploy") {
	 await message.guild.commands.set([...Array.from((await message.guild.commands.fetch()).values()), 


