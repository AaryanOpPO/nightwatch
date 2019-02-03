import { Message } from 'discord.js'
import { UserController } from '../../../controllers'
import { Plugin } from '..'

enum SpamReason {
  CAPS = 'Too many caps',
  REPETITION = 'Too many duplicate words',
  MENTIONS = 'Too many mentions',
  SHORTWORDS = 'Message contains mostly short words',
  LONGWORDS = 'Message is mostly a long word'
}

export const onMessage = async (message: Message) => {
  if (message.author.bot || message.channel.type !== 'text') {
    return
  }

  const userController = new UserController()

  if (Plugin.premiumOnly && !userController.userHasPremium(message.guild.ownerID, Plugin.client)) {
    return
  }

  if (hasTooManyMentions(message)) {
    await message.delete({
      reason: `Spam (${SpamReason.MENTIONS})`
    })
    return
  }

  if (message.content.length >= 20 && isMostlyLongWords(message)) {
    await message.delete({
      reason: `Spam (${SpamReason.LONGWORDS})`
    })
    return
  }

  if (message.content.length >= 12 && isMostlyShortWords(message)) {
    await message.delete({
      reason: `Spam (${SpamReason.SHORTWORDS})`
    })
    return
  }

  if (message.content.length >= 8 && isMostlyDuplicates(message)) {
    await message.delete({
      reason: `Spam (${SpamReason.REPETITION})`
    })
    return
  }

  if (message.content.length >= 6 && isMostlyUpperCase(message)) {
    await message.delete({
      reason: `Spam (${SpamReason.CAPS})`
    })
    return
  }
}

function hasTooManyMentions(msg: Message) {
  let mentionCount = 0

  mentionCount += msg.mentions.channels.size
  mentionCount += msg.mentions.members.size
  mentionCount += msg.mentions.roles.size

  if (msg.mentions.everyone) {
    mentionCount++
  }

  return mentionCount >= 4
}

function isMostlyDuplicates(msg: Message) {
  let duplicateCount = 0
  const words = msg.content.split(' ').sort()
  words.forEach((w, i) => {
    if (!w || !words[i + 1]) {
      return
    }

    if (words[i + 1].toLowerCase().includes(w.toLowerCase()) || w.toLowerCase().includes(words[i + 1].toLowerCase())) {
      duplicateCount++
    }
  })

  return duplicateCount / words.length > 0.5
}

function isMostlyLongWords(msg: Message) {
  let longWordCount = 0
  const words = msg.content.split(' ')
  words.forEach((w) => {
    if (!w) {
      return
    }

    if (w.length > 16 && !/[0-9]{18}/.test(w)) {
      longWordCount++
    }
  })

  return longWordCount / words.length > 0.5
}

function isMostlyShortWords(msg: Message) {
  let shortWordCount = 0
  const words = msg.content.split(' ')
  words.forEach((w) => {
    if (!w) {
      return
    }

    if (w.length < 3) {
      shortWordCount++
    }
  })

  return shortWordCount / words.length > 0.5
}

function isMostlyUpperCase(msg: Message) {
  let upperCaseCount = 0
  for (let i = 0; i < msg.content.length; i++) {
    const element = msg.content[i]
    if (element.toUpperCase() === element && /[a-zA-Z]/.test(element)) {
      upperCaseCount++
    }
  }

  return upperCaseCount / msg.content.length > 0.5
}