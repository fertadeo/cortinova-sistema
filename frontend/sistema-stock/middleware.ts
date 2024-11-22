import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  // Obtener el token de las cookies
  const token = request.cookies.get("token");

  // Si no hay token, redirigir al login
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // console.log("El token en middleware es:", token)

  // Continua al siguiente middleware o al request original
  return NextResponse.next();
}

export const config = {
  matcher: ["/home", "/clientes", "/control-stock"],
};
