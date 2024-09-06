import { getToken } from "next-auth/jwt";
import { NextResponse, NextRequest } from "next/server";



export async function middleware (req: NextRequest) {
    const session = await getToken({req, secret: process.env.NEXTAUTH_SECRET})

    // console.log(`El token de la session es:`, session)


    return NextResponse.next()
}
