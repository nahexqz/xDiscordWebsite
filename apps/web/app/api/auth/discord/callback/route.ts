import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signJWT, setSessionCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/login?error=access_denied", request.url));
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI!,
      }),
    });

    if (!tokenRes.ok) {
      throw new Error("Failed to exchange token");
    }

    const tokenData = await tokenRes.json();
    const { access_token, token_type } = tokenData;

    // Fetch Discord user info
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `${token_type} ${access_token}` },
    });

    if (!userRes.ok) {
      throw new Error("Failed to fetch Discord user");
    }

    const discordUser = await userRes.json();

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { discordId: discordUser.id },
      update: {
        username: discordUser.username,
        discriminator: discordUser.discriminator || "0",
        email: discordUser.email,
        avatar: discordUser.avatar,
        banner: discordUser.banner,
        lastSeen: new Date(),
      },
      create: {
        discordId: discordUser.id,
        username: discordUser.username,
        discriminator: discordUser.discriminator || "0",
        email: discordUser.email,
        avatar: discordUser.avatar,
        banner: discordUser.banner,
        isAdmin: (process.env.ADMIN_DISCORD_IDS || "").split(",").includes(discordUser.id),
      },
      include: { wallet: true },
    });

    // Create wallet if not exists
    if (!user.wallet) {
      await prisma.wallet.create({ data: { userId: user.id } });
    }

    // Create session
    const sessionToken = await signJWT({ userId: user.id, discordId: user.discordId });
    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
      },
    });

    // Set cookie and redirect
    const response = NextResponse.redirect(new URL("/", request.url));
    setSessionCookie(response, sessionToken);

    return response;
  } catch (err) {
    console.error("Discord OAuth callback error:", err);
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }
}
