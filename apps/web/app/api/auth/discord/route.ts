import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
  const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI!;

  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify email guilds",
  });

  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?${params}`;
  return NextResponse.redirect(discordAuthUrl);
}
