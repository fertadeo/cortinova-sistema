import { NextResponse } from "next/server";

export default function middleware(request: any) {
    
    const user = 'true'
    // const user = 'true'

    if (!user) { 
        return NextResponse.redirect(
            new URL('/', request.url)
        )
    }


    return NextResponse.next();

}

export const config = {
    matcher: ['/home'],
}