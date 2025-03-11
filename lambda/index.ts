import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { setVapidDetails, sendNotification, PushSubscription } from "web-push";

const app = new Hono();

// VAPIDキーの設定
setVapidDetails(
  "mailto:shake1574@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

app.get("/", (c) => c.text("Hello Hono!"));

// 通知送信エンドポイント
app.post("/send-notification", async (c) => {
  const { message, subscription } = await c.req.json<{
    message: string;
    subscription: PushSubscription;
  }>();

  if (!subscription) {
    return c.json({ success: false, error: "購読不可" }, 400);
  }

  try {
    await sendNotification(
      subscription,
      JSON.stringify({
        title: "hono-lambda-form-通知",
        body: message,
      })
    );
    return c.json({ success: true });
  } catch (error) {
    console.error("プッシュ通知の送信エラー:", error);
    return c.json({ success: false, error: "通知の送信に失敗" }, 500);
  }
});

export const handler = handle(app);
