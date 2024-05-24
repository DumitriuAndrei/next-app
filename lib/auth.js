import {Lucia} from "lucia";
import {BetterSqlite3Adapter} from "@lucia-auth/adapter-sqlite";
import db from "@/lib/db";
import {cookies} from "next/headers";

const adapter = new BetterSqlite3Adapter(db, {
    // table name of users
    user: 'users',
    // table where to store the sessions
    session: 'sessions'
})

const lucia = new Lucia(adapter, {
    sessionCookie: {
        expires: false,
        attributes: {
            secure: process.env.NODE_ENV === 'production'
        }
    }
});

export async function createAuthSession(userId) {
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
}

export async function verifyAuth() {
    const sessionCookie = cookies().get(lucia.sessionCookieName);

    if (!sessionCookie) {
        return {
            user: null,
            session: null
        }
    }

    const sessionId = sessionCookie.value;

    if (!sessionId) {
        return {
            user: null,
            session: null
        }
    }

    const result = await lucia.validateSession(sessionId);

    // wrapping the re-setting/refreshing of the cookie in a try catch block
    // in case it happens during rendering a page
    // can be found in lucia docs too
    try {
        // refreshing cookie
        if (result.session && result.session.fresh) {
            const sessionCookie = lucia.createSessionCookie(result.session.id);
            cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        }

        if (!result.session) {
            //create blank session cookie
            const sessionCookie = lucia.createBlankSessionCookie();
            // clearing cookie data
            cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        }
    } catch {/* don't care about the catch here */}

    return result;
}

export async function destroySession() {
    const { session } = await verifyAuth();

    console.log(session)
    if (!session) {
        return {
            error: 'Unauthorized'
        }
    }

    await lucia.invalidateSession(session.id)
    //create blank session cookie
    const sessionCookie = lucia.createBlankSessionCookie();
    // clearing cookie data
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
}