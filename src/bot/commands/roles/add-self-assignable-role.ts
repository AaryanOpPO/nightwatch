import { Message, Role } from 'discord.js'
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando'
import { GuildService } from '../../services'
import { GuildSelfAssignableRole } from '../../../db'

export default class AddSelfAssignableRoleCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'asar',
      group: 'roles',
      memberName: 'asar',
      description: 'Add a self assignable role that users can assign to themselves.',
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'role',
          prompt: 'What role should I add as a self assignable role?\n',
          type: 'role|string'
        }
      ]
    })
  }

  public async run (msg: CommandoMessage, args: any): Promise<Message | Message[]> {
    const role: Role = args.role instanceof Role ? args.role : msg.guild.roles.find(x => x.name.toLowerCase() === args.role.toLowerCase().trim())

    if (!role) {
      return msg.reply(`Could not find a role named ${args.role}`)
    }

    const guildService = new GuildService()

    const guild = await guildService.find(msg.guild.id)

    if (!guild) {
      return msg.reply('Command failed. Guild not found in my database.')
    }

    const selfAssignableRole = new GuildSelfAssignableRole()
    selfAssignableRole.roleId = role.id
    selfAssignableRole.guild = guild

    await guildService.createSelfAssignableRole(msg.guild.id, selfAssignableRole)

    return msg.channel.send(`Successfully added **${role.name}** as a self assignable role!`)
  }
}