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
  db = new Enmap({ name: "db" }),
  { Pagination } = require("discordjs-button-embed-pagination"),
  unb = (() => {
    const { Client } = require("unb-api");
    return new Client(procenv.UNBTOKEN);
  })();

function login() {
  client.login(procenv.TOKEN).catch(() => {
    console.log("Failed to login, retrying in 5 seconds");
    setTimeout(login, 5000);
  });
}

login();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || message.content.trim().startsWith(procenv.PREFIX))
    return;
  let args = message.content.split(/ +/g),
    command = args.shift().toLowerCase();

  if (command == "deploy") {
    let existingCommands = await message.guild.commands.fetch();
    if (existingCommands.find((c) => c.name == "easter"))
      await message.guild.commands.edit(
        existingCommands.find((c) => c.name == "easter").id,
        {
          name: "easter",
          description: "Easter event command",
          type: "CHAT_INPUT",
          options: [
            {
              name: "lb",
              description: "Leaderboard for the event",
              type: "SUB_COMMAND",
            },
            {
              name: "cooldown",
              description: "Time until the next eggs can be collected",
              type: "SUB_COMMAND",
            },
            {
              name: "eggs",
              description: "Eggs subcommand",
              type: "SUB_COMMAND_GROUP",
              options: [
                {
                  name: "hatch",
                  description: "Exchange 16 eggs to hatch a creature",
                  type: "SUB_COMMAND",
                },
                {
                  name: "exchange",
                  description: "Exchange eggs for cookies",
                  type: "SUB_COMMAND",
                  options: [
                    {
                      name: "amount",
                      description: "Amount of eggs to exchange",
                      type: "NUMBER",
                    },
                  ],
                },
                {
                  name: "give",
                  description: "Give eggs to another user",
                  type: "SUB_COMMAND",
                  options: [
                    {
                      name: "amount",
                      description: "Amount of eggs to give",
                      type: "NUMBER",
                    },
                    {
                      name: "user",
                      description: "User to give eggs to",
                      type: "USER",
                    },
                  ],
                },
                {
                  name: "steal",
                  description:
                    "Roll a dice to steal an egg from another user, if it fails your egg will be given to them instead.",
                  type: "SUB_COMMAND",
                  options: [
                    {
                      name: "user",
                      description: "User to steal eggs from",
                      type: "USER",
                    },
                  ],
                },
              ],
            },
            {
              name: "creatures",
              description: "Creature subcommands",
              type: "SUB_COMMAND_GROUP",
              options: [
                {
                  name: "list",
                  description: "List your creatures",
                  type: "SUB_COMMAND",
                  options: [
                    {
                      name: "user",
                      description: "User to list creatures for",
                      type: "USER",
                      required: false,
                    },
                  ],
                },
                {
                  name: "info",
                  description: "Get info about a creature",
                  type: "SUB_COMMAND",
                  options: [
                    {
                      name: "creature",
                      description: "Name of the creature",
                      type: "STRING",
                      required: true,
                    },
                  ],
                },
                {
                  name: "exchange",
                  description: "Exchange creature for cookies",
                  type: "SUB_COMMAND",
                  options: [
                    {
                      name: "creature",
                      description: "Name of the creature",
                      type: "STRING",
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
        }
      );
    else
      await message.guild.commands.create({
        name: "easter",
        description: "Easter event command",
        type: "CHAT_INPUT",
        options: [
          {
            name: "lb",
            description: "Leaderboard for the event",
            type: "SUB_COMMAND",
          },
          {
            name: "cooldown",
            description: "Time until the next eggs can be collected",
            type: "SUB_COMMAND",
          },
          {
            name: "eggs",
            description: "Eggs subcommand",
            type: "SUB_COMMAND_GROUP",
            options: [
              {
                name: "info",
                description: "Number of eggs you have",
                type: "SUB_COMMAND",
              },
              {
                name: "hatch",
                description: "Exchange 16 eggs to hatch a creature",
                type: "SUB_COMMAND",
              },
              {
                name: "exchange",
                description: "Exchange eggs for cookies",
                type: "SUB_COMMAND",
                options: [
                  {
                    name: "amount",
                    description: "Amount of eggs to exchange",
                    type: "NUMBER",
                  },
                ],
              },
              {
                name: "give",
                description: "Give eggs to another user",
                type: "SUB_COMMAND",
                options: [
                  {
                    name: "amount",
                    description: "Amount of eggs to give",
                    type: "NUMBER",
                  },
                  {
                    name: "user",
                    description: "User to give eggs to",
                    type: "USER",
                  },
                ],
              },
              {
                name: "steal",
                description:
                  "Roll a dice to steal an egg from another user, if it fails your egg will be given to them instead.",
                type: "SUB_COMMAND",
                options: [
                  {
                    name: "user",
                    description: "User to steal eggs from",
                    type: "USER",
                  },
                ],
              },
            ],
          },
          {
            name: "creatures",
            description: "Creature subcommands",
            type: "SUB_COMMAND_GROUP",
            options: [
              {
                name: "list",
                description: "List your creatures",
                type: "SUB_COMMAND",
                options: [
                  {
                    name: "user",
                    description: "User to list creatures for",
                    type: "USER",
                    required: false,
                  },
                ],
              },
              {
                name: "info",
                description: "Get info about a creature",
                type: "SUB_COMMAND",
                options: [
                  {
                    name: "creature",
                    description: "Name of the creature",
                    type: "STRING",
                    required: true,
                  },
                ],
              },
              {
                name: "exchange",
                description: "Exchange creature for cookies",
                type: "SUB_COMMAND",
                options: [
                  {
                    name: "creature",
                    description: "Name of the creature",
                    type: "STRING",
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      });

    message.reply({
      content: "Command deployed for this server!",
      allowedMentions: {
        repliedUser: false,
      },
    });
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand() || !interaction.guildId) return;
  let guild = await client.guilds.fetch(interaction.guildId);
  if (interaction.command.name != "easter") return;
  let lb = (() => {
    if (!db.has(`lb_${interaction.guildId}`))
      db.set(`lb_${interaction.guildId}`, [
        { user: interaction.user, eggs: [], creatures: [] },
      ]);
    return db.get(`lb_${interaction.guildId}`);
  })();

  switch (interaction.option.name) {
    case "lb":
      // Sort by eggs collected
      lb.sort((a, b) => {
        return b.eggs.length - a.eggs.length;
      });
      // Sort by creatures hatched
      lb.sort((a, b) => {
        return b.creatures.length - a.creatures.length;
      });

      if (lb.length <= 10) {
        let embed = new Discord.MessageEmbed()
          .setTitle("🥚 Easter Leaderboard")
          .setDescription(
            `There are currently ${lb.length} users in the leaderboard.`
          );

        for (let i = 0; i < lb.length; i++) {
          embed.addField(
            `${i + 1}. ${lb[i].user.username}`,
            `${lb[i].eggs.length} eggs collected\n${lb[i].creatures.length} creatures hatched`
          );
        }
        interaction.reply({
          embed: embed,
        });
      } else {
        // Iterate the list in chunks of 10 and create a new embed for each
        // chunk
        let chunks = [];
        for (let i = 0; i < lb.length; i += 10) {
          let embed = new Discord.MessageEmbed()
            .setTitle("🥚 Easter Leaderboard")
            .setDescription(
              `There are currently ${lb.length} users in the leaderboard.`
            )
            .setFooter(
              `Page ${Math.floor(i / 10) + 1}/${Math.ceil(lb.length / 10)}
Viewing users ${i + 1}-${i + 10} of ${lb.length}`
            );

          for (let j = i; j < i + 10; j++) {
            if (j >= lb.length) break;
            embed.addField(
              `${j + 1}. ${lb[j].user.username}`,
              `${lb[j].eggs.length} eggs collected\n${lb[j].creatures.length} creatures hatched`
            );
          }
          chunks.push(embed);
        }

        // Send the chunks as a paginated embed
        new Pagination(interaction.channel, chunks, "page").paginate();
      }
      break;
    case "cooldown":
      let cooldown = db.get(`cooldown_${interaction.guildId}`);
      if (!cooldown) {
        db.set(`cooldown_${interaction.guildId}`, 0);
        cooldown = db.get(`cooldown_${interaction.guildId}`);
      }
      let time = new Date(cooldown);
      let now = new Date();
      let diff = time - now;
      let days = Math.floor(diff / (1000 * 60 * 60 * 24));
      let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((diff % (1000 * 60)) / 1000);
      let timeString = "";
      if (days > 0) timeString += `${days} days, `;
      if (hours > 0) timeString += `${hours} hours, `;
      if (minutes > 0) timeString += `${minutes} minutes, `;
      if (seconds > 0) timeString += `${seconds} seconds`;
      interaction.reply({
        content: `${
          cooldown
            ? `It is currently ${timeString} until the next egg can be collected.`
            : `Eggs are available to be collected right now.`
        }`,
        ephemeral: true,
      });
      break;
    case "eggs":
      let user = lb.find((u) => u.user.id == interaction.user.id);
      if (!user) {
        interaction.reply({
          content: "You have not collected any eggs yet.",
          ephemeral: true,
        });
        return;
      }

      if (!interaction.options.getSubcommand(false)) return;

      switch (interaction.options.getSubcommand(false).name) {
        case "list":
          let embed = new Discord.MessageEmbed()
            .setTitle("🥚 Eggs")
            .setDescription(`You have collected ${user.eggs.length} eggs.`)
            .setFooter(
              `You're ranked ${lb.indexOf(user) + 1}/${
                lb.length
              } in the leaderboard`
            );
          break;
      }
      break;

    case "creatures":
      let creatures = db.get(`lb_${interaction.guildId}`);
      if (!creatures) {
        db.set(`lb_${interaction.guildId}`, [
          {
            user: interaction.user,
            eggs: [],
            creatures: [],
          },
        ]);
        creatures = db.get(`lb_${interaction.guildId}`);
      }

      user = creatures.find((u) => u.user.id == interaction.user.id);
      if (!user) {
        user = {
          user: interaction.user,
          eggs: [],
          creatures: [],
        };
      }

      let embed2 = new Discord.MessageEmbed()
        .setTitle("🐣 Creatures")
        .setDescription(
          `You have hatched **${
            user.creatures.length ? user.creatures.length : "no"
          }** creatures.`
        );

      if (user.creatures.length > 0) {
        if (user.creatures.length <= 10) {
          let list = "";
          for (let i = 0; i < user2.creatures.length; i++) {
            list += `${i + 1}. ${user2.creatures[i].name}\n`;
          }
          embed2.addField("Creatures", list);
          interaction.reply({
            embeds: [embed2],
            allowedMentions: {
              repliedUser: false,
            },
          });
        } else {
          let chunks = [];
          for (let i = 0; i < user2.creatures.length; i += 10) {
            let embed = new Discord.MessageEmbed()
              .setTitle("🐣 Creatures")
              .setDescription(
                `You have hatched **${user2.creatures.length}** creatures.`
              ).setFooter(`Page ${Math.floor(i / 10) + 1}/${Math.ceil(
              user2.creatures.length / 10
            )}
Viewing creatures ${i + 1}-${i + 10} of ${user2.creatures.length}`);

            for (let j = i; j < i + 10; j++) {
              if (j >= user2.creatures.length) break;
              embed.addField(
                `${j + 1}. ${user2.creatures[j].name}`,
                `${user2.creatures[j].level} level`
              );
            }
            chunks.push(embed);
          }

          // Send the chunks as a paginated embed
          new Pagination(interaction.channel, chunks, "page").paginate();
        }
      } else {
        interaction.reply({
          embeds: [embed2],
          allowedMentions: {
            repliedUser: false,
          },
        });
      }
      break;
  }
});
