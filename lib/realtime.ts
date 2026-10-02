import Pusher from "pusher";
export const CHANNEL = "private-strk-display";
export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});
export const emit = (event: string, data: object = {}) =>
  pusher.trigger(CHANNEL, event, data).catch((e) => console.error("pusher", e));
