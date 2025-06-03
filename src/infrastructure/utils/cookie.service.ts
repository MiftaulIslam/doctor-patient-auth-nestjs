import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class CookieService {
    setCookie(
        res: Response,
        name: string,
        value: string,
        options: {
            httpOnly?: boolean;
            secure?: boolean;
            maxAge?: number;
            sameSite?: 'strict' | 'lax' | 'none';
            path?: string;
        } = {},
    ): void {
        res.cookie(name, value, {
            httpOnly: options.httpOnly ?? true,
            secure: options.secure ?? process.env.NODE_ENV === 'production',
            maxAge: options.maxAge,
            sameSite: options.sameSite ?? 'strict',
            path: options.path ?? '/',
        });
    }

    clearCookie(res: Response, name: string, path: string = '/'): void {
        res.clearCookie(name, { path });
    }
}