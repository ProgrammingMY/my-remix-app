import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { decodeIdToken, type OAuth2Tokens } from "arctic";
import { drizzle } from "drizzle-orm/d1";
import { createGoogleClient, googleSessionStorage } from "~/utils/google.server";
import * as schema from "~/db/schema.server";
import { eq } from "drizzle-orm";
import { startUserSession } from "~/utils/user.server";

interface googleClaimsProps {
    sub: string;
    name: string;
    picture: string;
    email: string;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
    const { env } = context.cloudflare;

    const google = createGoogleClient(env);

    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const state = requestUrl.searchParams.get("state");

    const session = await googleSessionStorage.getSession(request.headers.get("Cookie"));

    const storedState = session.get("google_oauth_state") ?? null;
    const codeVerifier = session.get("google_code_verifier") ?? null;

    if (code === null || state === null || storedState === null || codeVerifier === null) {
        return null;
    }

    if (state !== storedState) {
        return null;
    }

    let tokens: OAuth2Tokens;

    try {
        tokens = await google.validateAuthorizationCode(code, codeVerifier)

    } catch (error) {
        // invalid code or client credentials'
        console.log("[GOGGLE CALLBACK] Error: ", error);
        return null;
    }

    const claims = decodeIdToken(tokens.idToken()) as googleClaimsProps;
    const googleEmail = claims.email;
    const googleUserId = claims.sub;
    const username = claims.name;
    const imageUrl = claims.picture;

    const headers = new Headers();

    // check if user exists
    const db = drizzle(env.DB_drizzle, { schema });
    const existingUser = await db.query.connection.findFirst({
        where: eq(schema.connection.providerId, googleUserId)
    });

    if (existingUser) {
        await startUserSession({ userId: existingUser.userId, db, headers });
        return redirect("/user", {
            headers,
        })
    };
    // get student role
    const studentRole = await db.query.role.findFirst({
        where: eq(schema.role.name, "student"),
        columns: {
            id: true,
        },
    });

    // create user
    const user = await db.insert(schema.user).values({
        email: googleEmail,
        name: username,
        imageUrl,
        roleId: studentRole?.id,
        emailVerified: true,
    }).returning({ id: schema.user.id }).onConflictDoUpdate({
        target: schema.user.email,
        set: {
            name: username,
            imageUrl
        }
    });
    await db.insert(schema.connection).values({
        providerId: googleUserId,
        userId: user[0].id,
    }).onConflictDoNothing();

    await startUserSession({ userId: user[0].id, db, headers });

    return redirect("/user", {
        headers,
    });

}