import { NextResponse } from 'next/server';

const ACCESS_TOKEN_COOKIE = 'access_token';

const PRIVATE_PREFIXES = [
    '/home',
    '/ayuda',
    '/nosotros',
    '/sig',
    '/rrhh',
];

export function proxy(request) {
    const { pathname } = request.nextUrl;

    const accessToken =
        request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    const authenticated = Boolean(accessToken);

    const isPrivate = PRIVATE_PREFIXES.some(
        (prefix) =>
            pathname === prefix ||
            pathname.startsWith(`${prefix}/`)
    );

    const isLoginRoot =
        pathname === '/login';

    /*
     * Ruta privada sin access token
     */
    if (isPrivate && !authenticated) {
        const url = request.nextUrl.clone();

        url.pathname = '/login';

        return NextResponse.redirect(url);
    }

    /*
     * Si existe access token y el usuario entra a /login,
     * lo enviamos al home.
     *
     * El cambio de contraseña se manejará posteriormente
     * desde la información real del usuario.
     */
    if (isLoginRoot && authenticated) {
        const url = request.nextUrl.clone();

        url.pathname = '/home';

        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/home/:path*',
        '/ayuda/:path*',
        '/nosotros/:path*',
        '/sig/:path*',
        '/rrhh/:path*',
        '/login',
    ],
};