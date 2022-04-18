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
  Enmap = require("enmap").default,
  db = new Enmap({ name: "db" }),
  { Pagination } = require("discordjs-button-embed-pagination"),
  unb = (() => {
    const { Client } = require("unb-api");
    return new Client(procenv.UNBTOKEN);
  })(),
  hatch = require("./utils/hatch.js"),
  crypto = require("crypto");

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
  /**
   * @type {{
   *  user: Discord.User,
   *  eggs: Number[],
   *  creatures: {
   *     name: string,
   *     stats: {
   *        vit: Number,
   *        str: Number
   *     },
   *     image: string,
   *     attachments: Any[]
   *    }[]
   *  }[]
   * }
   */
  let lb = (() => {
      if (!db.has(`lb_${interaction.guildId}`))
        db.set(`lb_${interaction.guildId}`, [
          { user: interaction.user, eggs: [], creatures: [] },
        ]);
      return db.get(`lb_${interaction.guildId}`);
    })(),
    embed = new Discord.MessageEmbed(),
    /**
     * @type {{
     *  user: Discord.User,
     *  eggs: Number[],
     *  creatures: {
     *     name: string,
     *     stats: {
     *        vit: Number,
     *        str: Number
     *     },
     *     image: string,
     *     attachments: Any[]
     *    }[]
     *  }
     * }
     */
    user = lb.find((u) => u.user.id == interaction.user.id);

  if (!user) {
    user = { user: interaction.user, eggs: [], creatures: [] };
    lb.push(user);
    db.set(`lb_${interaction.guildId}`, lb);
  }

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
        embed
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
          embed
            .setTitle("🥚 Easter Leaderboard")
            .setDescription(
              `There are currently ${lb.length} users in the leaderboard.`
            )
            .setFooter({
              text: `Page ${Math.floor(i / 10) + 1}/${Math.ceil(lb.length / 10)}
Viewing users ${i + 1}-${i + 10} of ${lb.length}`,
            });

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
      /** @type { Number } */
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
      if (!user) {
        interaction.reply({
          content: "You have not collected any eggs yet.",
          ephemeral: true,
        });
        return;
      }

      if (!interaction.options.getSubcommand(false)) return;

      switch (interaction.options.getSubcommand(false).name) {
        case "info":
          embed
            .setTitle("🥚 Eggs")
            .setDescription(`You have collected ${user.eggs.length} eggs.`)
            .addField(
              `Streak`,
              `Longest streak: ${
                user.eggs.reduce(
                  // Group the timestamps that are within 5 minutes of each other
                  (acc, cur) => {
                    if (acc.length === 0) {
                      acc.push(cur);
                      return acc;
                    }
                    if (acc[acc.length - 1] + 300000 > cur) {
                      acc.push(cur);
                      return acc;
                    }
                    return acc;
                  },
                  []
                ).length
              } eggs.`
            )
            .setFooter({
              text: `You're ranked ${lb.indexOf(user) + 1}/${
                lb.length
              } in the leaderboard`,
            });
          interaction.reply({
            embeds: [embed],
          });
          break;

        case "hatch":
          if (user.eggs.length < 16) {
            interaction.reply({
              content:
                "You need to collect at least 16 eggs to hatch a creature.",
              ephemeral: true,
            });
            return;
          }

          let newCreature;

          try {
            newCreature = await hatch(user.user.tag);
          } catch (e) {
            interaction.reply({
              content:
                "An error occurred while trying to hatch a creature.\nPlease try again later.",
              ephemeral: true,
            });
            return;
          }

          let newUserEggs = user.eggs.slice(0, -16),
            newUserCreatures = user.creatures.concat(newCreature);

          db.set(`lb_${interaction.guildId}`, [
            ...lb.map((u) => {
              if (u.user.id == user.user.id) {
                return {
                  user: u.user,
                  eggs: newUserEggs,
                  creatures: newUserCreatures,
                };
              } else {
                return u;
              }
            }),
          ]);

          embed
            .setTitle("🐣 New Creature")
            .setDescription(
              `You hatched a new creature: **${newCreature.name}**!
"${newCreature.description}"`
            )
            .addField(
              "Stats",
              `HP: ${newCreature.stats.vit}
Strength: ${newCreature.stats.str}`
            )
            .setThumbnail(newCreature.image)
            .setFooter({
              text: `You're ranked ${lb.indexOf(user) + 1}/${
                lb.length
              } in the leaderboard`,
            });

          interaction.reply({
            content: `You hatched a new creature!`,
            ephemeral: true,
            embeds: [embed],
          });
          break;

        case "exchange":
          let eggAmount = interaction.options.data
            .find((s) => s.name == "eggs")
            .options.find((s) => s.name == "exchange")
            .options.find((s) => s.name == "amount").value;

          if (eggAmount > user.eggs.length) {
            interaction.reply({
              content: `You don't have that many eggs. You only have ${user.eggs.length} eggs.`,
              ephemeral: true,
            });
            return;
          }

          unb.editUserBalance(
            interaction.guild.id,
            user.user.id,
            2 * eggAmount
          );

          let nUEggs = user.eggs.slice(0, -eggAmount);

          db.set(`lb_${interaction.guildId}`, [
            ...lb.map((u) => {
              if (u.user.id == user.user.id) {
                return {
                  user: u.user,
                  eggs: nUEggs,
                  creatures: u.creatures,
                };
              } else {
                return u;
              }
            }),
          ]);
          break;

        case "give":
          let toGive = interaction.options.data
            .find((s) => s.name == "eggs")
            .options.find((s) => s.name == "give")
            .options.find((s) => s.name == "amount").value;

          /** @type { Discord.User } */
          let receiver = interaction.options.data
            .find((s) => s.name == "eggs")
            .options.find((s) => s.name == "give")
            .options.find((s) => s.name == "user").user;

          // Check if the user exists in the database
          if (!lb.find((u) => u.user.id == receiver.id)) {
            // Create a new user
            db.set(`lb_${interaction.guildId}`, [
              ...lb,
              {
                user: receiver,
                eggs: [],
                creatures: [],
              },
            ]);
          }

          // Check if the user has enough eggs
          if (toGive > user.eggs.length) {
            interaction.reply({
              content: `You don't have that many eggs. You only have ${user.eggs.length} eggs.`,
              ephemeral: true,
            });
            return;
          }

          // Give the eggs
          let gUEggs = user.eggs.slice(0, -toGive),
            rUEggs = receiver.eggs.concat(user.eggs.slice(-toGive));

          db.set(`lb_${interaction.guildId}`, [
            ...lb.map((u) => {
              if (u.user.id == user.user.id) {
                return {
                  user: u.user,
                  eggs: gUEggs,
                  creatures: u.creatures,
                };
              } else if (u.user.id == receiver.id) {
                return {
                  user: u.user,
                  eggs: rUEggs,
                  creatures: u.creatures,
                };
              } else {
                return u;
              }
            }),
          ]);

          interaction.reply({
            content: `You gave ${toGive} eggs to ${receiver.username}.\nYou now have ${gUEggs.length} eggs.`,
            ephemeral: true,
          });
          break;

        case "steal":
          let toSteal = interaction.options.data
            .find((s) => s.name == "eggs")
            .options.find((s) => s.name == "steal")
            .options.find((s) => s.name == "amount").value;

          /** @type { Discord.User } */
          let stealFrom = interaction.options.data
              .find((s) => s.name == "eggs")
              .options.find((s) => s.name == "steal")
              .options.find((s) => s.name == "user").user,
            stealFromData = lb.find((u) => u.user.id == stealFrom.id);

          // Check if the user exists in the database
          if (!lb.find((u) => u.user.id == stealFrom.id)) {
            // Create a new user
            db.set(`lb_${interaction.guildId}`, [
              ...lb,
              {
                user: stealFrom,
                eggs: [],
                creatures: [],
              },
            ]);

            interaction.reply({
              content: `${stealFrom.username} doesn't have any eggs.`,
              ephemeral: true,
            });
            return;
          }

          // Check if the user has enough eggs
          if (toSteal > stealFromData.eggs.length) {
            interaction.reply({
              content: `${stealFrom.username} doesn't have that many eggs. They only have ${stealFromData.eggs.length} eggs.`,
              ephemeral: true,
            });
            return;
          }

          // Get random boolean to see who gets the eggs
          let random = crypto.randomInt(0, 1) == 1;

          // Give the eggs to the user or the other user
          let sUEggs = random
              ? user.eggs.concat(stealFromData.eggs.slice(-toSteal))
              : stealFromData.eggs.slice(-toSteal),
            rsUEggs = random
              ? stealFromData.eggs.slice(0, -toSteal)
              : user.eggs.concat(stealFromData.eggs.slice(-toSteal));

          db.set(`lb_${interaction.guildId}`, [
            ...lb.map((u) => {
              if (u.user.id == user.user.id) {
                return {
                  user: u.user,
                  eggs: sUEggs,
                  creatures: u.creatures,
                };
              } else if (u.user.id == stealFrom.id) {
                return {
                  user: u.user,
                  eggs: rsUEggs,
                  creatures: u.creatures,
                };
              } else {
                return u;
              }
            }),
          ]);

          interaction.reply({
            content: `You ${
              random ? "successfully" : "unsuccessfully"
            } stole ${toSteal} eggs from ${stealFrom.username}.\nYou now have ${
              sUEggs.length
            } eggs.`,
            ephemeral: true,
          });
          break;
      }
      break;

    case "creatures":
      embed
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
          for (let i = 0; i < user.creatures.length; i += 10) {
            embed
              .setTitle("🐣 Creatures")
              .setDescription(
                `You have hatched **${user.creatures.length}** creatures.`
              )
              .setFooter({
                text: `Page ${Math.floor(i / 10) + 1}/${Math.ceil(
                  user2.creatures.length / 10
                )}
Viewing creatures ${i + 1}-${i + 10} of ${user.creatures.length}`,
              });

            for (let j = i; j < i + 10; j++) {
              if (j >= user.creatures.length) break;
              embed.addField(
                `${j + 1}. ${user.creatures[j].name}`,
                `${user.creatures[j].level} level`
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
