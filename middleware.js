import {NextResponse} from "next/server";

//do stuff with requests
export function middleware(req) {
    return NextResponse.next();
}

export const config = {
    matcher: '/news'
}