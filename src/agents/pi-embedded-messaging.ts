import { getChannelPlugin, normalizeChannelId } from "../channels/plugins/index.js";

export type MessagingToolSend = {
  tool: string;
  provider: string;
  accountId?: string;
  to?: string;
  threadId?: string;
};

const CORE_MESSAGING_TOOLS = new Set(["sessions_send", "message"]);
const CORE_MESSAGE_TOOL_SEND_ACTIONS = new Set(["send", "thread-reply", "upload-file"]);

export function isCoreMessageToolSendAction(action: string): boolean {
  return CORE_MESSAGE_TOOL_SEND_ACTIONS.has(action.trim());
}

// Provider docking: any plugin with `actions` opts into messaging tool handling.
export function isMessagingTool(toolName: string): boolean {
  if (CORE_MESSAGING_TOOLS.has(toolName)) {
    return true;
  }
  const providerId = normalizeChannelId(toolName);
  return Boolean(providerId && getChannelPlugin(providerId)?.actions);
}

export function isMessagingToolSendAction(
  toolName: string,
  args: Record<string, unknown>,
): boolean {
  const action = typeof args.action === "string" ? args.action.trim() : "";
  if (toolName === "sessions_send") {
    return true;
  }
  if (toolName === "message") {
    return isCoreMessageToolSendAction(action);
  }
  const providerId = normalizeChannelId(toolName);
  if (!providerId) {
    return false;
  }
  const plugin = getChannelPlugin(providerId);
  if (!plugin?.actions?.extractToolSend) {
    return false;
  }
  return Boolean(plugin.actions.extractToolSend({ args })?.to);
}
