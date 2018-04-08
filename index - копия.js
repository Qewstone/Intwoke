const Discord = require('discord.js');
const util = require("util");
const request = require("request");
const config = require('./config.json');
const querystring = require('querystring');
const rgbcolor = require('rgbcolor');
const getImageColors = require('get-image-colors');
const client = new Discord.Client({ autofetch: [
        'MESSAGE_CREATE',
        'MESSAGE_UPDATE',
        'MESSAGE_REACTION_ADD',
        'MESSAGE_REACTION_REMOVE',
    ] });

const size = config.colors;
const rainbow = new Array(size);

function generateHex() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

for (var i=0; i<size; i++) {
  var red   = sin_to_hex(i, 0 * Math.PI * 2/3); // 0   deg
  var blue  = sin_to_hex(i, 1 * Math.PI * 2/3); // 120 deg
  var green = sin_to_hex(i, 2 * Math.PI * 2/3); // 240 deg

  rainbow[i] = '#'+ red + green + blue;
}

function sin_to_hex(i, phase) {
  var sin = Math.sin(Math.PI / size * 2 * i + phase);
  var int = Math.floor(sin * 127) + 128;
  var hex = int.toString(16);

  return hex.length === 1 ? '0'+hex : hex;
}

let place = 0;
const servers = config.servers;

function changeColor() {
  for (let index = 0; index < servers.length; ++index) {		
    client.guilds.get(servers[index]).roles.find('name', config.roleName).setColor(rainbow[place])
		.catch(console.error);
		
    if(config.logging){
      console.log(`[ColorChanger] Changed color to ${rainbow[place]} in server: ${servers[index]}`);
    }
    if(place == (size - 1)){
      place = 0;
    }else{
      place++;
    }
  }
}

function add_command(aliases, onlyInBotChat, message, command, args, access_type, access_params, command_function, pattern = null, description = null) {

  if (onlyInBotChat) {
      if (!botFullRights.includes(message.channel.id)) return;
  }

  if (typeof aliases !== 'object')
      return console.error('Error: command aliases aren\'n array');

  let embed;

  let error = false;
  if (!creators.includes(message.author.id))
  if (access_type === 'rules') {
      let rights_arr = [];
      let err = false;
      access_params.forEach(function (item) {
          if (!message.member.hasPermission(item, false, true, true)) {
              err = true;
              rights_arr.push(item);
          }
      });
      if (err === true) {
          let a = '';
          let required = 'которые требуются';
          let rigths = rights_arr.join('`, `');
          if (access_params.length === 1) {
              a = 'а';
              required = 'которое требуется';
          }
          embed = embed_error(`${message.author} (\`${message.author.tag}\`), извините, но у Вас нет прав${a} \`${rigths}\`, ${required} для выполнения данной команды\n\nЕсли Вы считаете, что это не так - обратитесь к <@421030089732653057>`);
          error = true;
      }
  } else if (access_type === 'roles') {
      if (!message.member.roles.some(r=>access_params.includes(r.id))) {
          let a = 'ни одной из ролей';
          let roles = '';
          let required = 'которые требуются';
          access_params.forEach(function (item) {
              roles = roles + message.guild.roles.get(item);
          });
          if (access_params.length === 1) {
              a = 'роли';
              required = 'которая требуется';
          }
          embed = embed_error(`${message.author} (\`${message.author.tag}\`), извините, но у Вас нет ${a} ${roles}, ${required} для выполнения данной команды\n\nЕсли Вы считаете, что это не так - обратитесь к <@421030089732653057>`);
          error = true;
      }
  } else if (access_type === 'creat') {
      embed = embed_error(`${message.author} (\`${message.author.tag}\`), извините, но Вы должны быть создателем бота для выполнения данной команды\n\nЕсли Вы считаете, что это не так - обратитесь к <@421030089732653057>`);
      error = true;
  }

  if (!error && pattern !== 'hid') {
      let cmd = '';
      if (pattern !== null)
          cmd = cmd + `\`${aliases[0]} ${pattern}\``;
      else
          cmd = cmd + `\`${aliases[0]}\``;

      if (description !== null)
          cmd = cmd + ` — ${description}`;
      help_commands.push(cmd);
  }

  if (!aliases.includes(command)) return;
  if (error) return message.channel.send({embed});

  if (!message.member.roles.some(r=>[rule.admin, rule.admin, rule.owner].includes(r.id)))
  if (!commandCooldown.has(message.author.id)) {
      commandCooldown.add(message.author.id);
      setTimeout(() => {
          commandCooldown.delete(message.author.id);
      }, 1);
  } else {
      return message.channel.send('Хэй-хэй, '+message.author+', остынь! Тебе нужно немного подождать, чтоб еще раз обратится ко мне :D');
  }
  command_function();
}

client.on("ready", function() {
  console.log("Ready");
});

client.on('ready', () => {
  console.log('Bot loaded');
  client.user.setPresence({ game: { name: `на доброго ззигера`, type: 3 } }).catch();
  client.channels.get('417374192418160652');
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}!`);
  if(config.speed < 500){console.log("The minimum speed is 60.000, if this gets abused your bot might get IP-banned"); process.exit(1);}
  setInterval(changeColor, config.speed);
});

client.on("message", async message => {
  if (message.channel.id === '421260737281785856') {
      if(!message.author.bot) return;
      if(message.author.discriminator !== '0000') return;
      if(message.content.indexOf(process.env.PREFIX) !== 0) return;
      const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/g);
      const command = args.shift().toLowerCase();

      if (command === 'update_games') {
          if (!args[0]) return;
          let user = message.guild.members.get(args[0]);
          if (!user) return;
          request('https://'+process.env.SITE_DOMAIN+'/get_game_roles.php?secret='+encodeURIComponent(process.env.SECRET_KEY)+'&user='+user.user.id, function (error, response, body) {
          let array = JSON.parse(body);
          console.log(array);
          array.forEach(function (item) {
              if (item[1] === '1') {
                  if (!user.roles.has(item[0]))
                      user.addRole(item[0]).catch(console.error);
              } else {
                  if (user.roles.has(item[0]))
                      user.removeRole(item[0]).catch(console.error);
              }
          })
          });
      }

      return;
  }
  if (message.channel.id === '421287649995784193') {
      console.log('caught '+message.id);
      return multipleReact(message, [emojis.za, emojis.neznayu, emojis.protiv]).catch();
  }
  if (['dm', 'group', 'category', 'voice'].includes(message.channel.type)) return;
  if (!['417266233562365952', '416813030232424462'].includes(message.guild.id)) {
      message.guild.leave().catch();
      return;
  }
  if (!siteOff)
  if (!talkedRecently.has(message.author.id)) {
      if (message.author.bot) return;
      request('https://'+process.env.SITE_DOMAIN+'/add.php?secret='+encodeURIComponent(process.env.SECRET_KEY)+'&user='+message.author.id, function (error, response, body) {
          if (!error && response.statusCode === 200) {
              let lvls = JSON.parse(body);
              if (parseInt(lvls[0]) !== parseInt(lvls[1])) {
                  let msg = `Ура, ${message.author} получил ${lvls[1]} уровень! Поздравьте его`;
                  if (newLevelNotificationChannels.includes(message.channel.id)) {
                      message.channel.send(msg);
                  } else {
                      client.channels.get('417266234032390155').send(msg);
                  }
                  level_roles.forEach(function (item) {
                      if (lvls[1] >= item[0]) {
                          if (!message.member.roles.has(item[1])) {
                              message.member.addRole(item[1]).catch(console.error);
                              message.author.send(`Вы получили роль \`${message.guild.roles.get(item[1]).name}\``);
                          }
                      } else {
                          if (message.member.roles.has(item[1])) {
                              message.member.removeRole(item[1]).catch(console.error);
                          }
                      }
                  });
              }
          }
      });
      talkedRecently.add(message.author.id);
      setTimeout(() => {
          talkedRecently.delete(message.author.id);
      }, 1);
  }

if(message.author.bot) return;
  if(message.content.indexOf(process.env.PREFIX) !== 0) return;

const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  help_commands = [''];

add_command(['скажи', 'say', 's'], false, message, command, args, 'roles', [rule.game_owner], function () {
  const sayMessage = args.join(" ");
  message.delete().catch(O_o=>{});
  const embed = embed_error(`${message.author}, неизвестная ошибка отправки сообщения в чат`);
  let msg = message.channel.send(sayMessage).catch(()=>{message.reply({embed});});
}, '[текст]', 'написать сообщение от имени бота');

client.login("NDI5ODM3Mjk3OTAzNDY4NTQ0.DaHcwA.PdypKo02YvLGoFrz1deD4VZTKOk");
});