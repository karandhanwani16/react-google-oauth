// src/auth/auth.controller.ts
import { Controller, Request, Post, UseGuards, Body, Get, Req, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './local-auth/local-auth.guard'
import { AuthGuard } from '@nestjs/passport'

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) {
        if (!req.user) {
            return { success: false, message: 'Authentication failed' };
        }
        return this.authService.login(req.user);
    }

    @Post('signup')
    async signup(@Body() body: { name: string; email: string; password: string; phone?: string }) {
        return this.authService.register(body.name, body.email, body.password, body.phone);
    }

    // Google Login/Signup

    @Post('google')
    async googleLogin(@Body('code') code: string) {
        return this.authService.handleGoogleAuth(code);
    }
}