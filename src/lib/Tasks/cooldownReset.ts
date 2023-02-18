import { BotClient } from "../../structures/botClient";

const resetCooldown = async (client: BotClient) => {
  const cooldowns = client.cooldowns;

  cooldowns.forEach((cooldown) => {
    if (cooldown.timestamp <= Date.now()) {
      cooldowns.delete(`${cooldown.user}-${cooldown.command}`);
    }
  });
};

export const registerCooldownTask = async (client: BotClient) => {
  //auto clear cooldowns from memory if the inhibitor is not used
  return setInterval(() => {
    resetCooldown(client);
  }, 60000); //every minute
};
