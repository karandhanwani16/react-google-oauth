import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
    private googleClient: OAuth2Client;


    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) {

        this.googleClient = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
    }

    async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && user.password && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: User) {
        try {

            if(user.googleId){
                return {
                    success: false,
                    type: "login",
                    message: 'You have already logged in with Google. Please use Google to login.',
                    user: null,
                    accessToken: null,
                };
            }

            const payload = { sub: user.id, email: user.email };
            const accessToken = this.jwtService.sign(payload);

            return {
                success: true,
                type: "login",
                message: 'Login successful',
                user: this.sanitizeUser(user),
                accessToken,
            };
        } catch (error) {
            return {
                success: false,
                type: "login",
                user: null,
                accessToken: null,
                message: 'An error occurred during login',
            };
        }
    }

    async register(name: string, email: string, password: string, phone?: string) {
        try {
            const existingUser = await this.prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return { success: false, message: 'Email already in use' };
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const indianTime = this.getIndianTime();

            const user = await this.prisma.$transaction(async (prisma) => {
                const newUser = await prisma.user.create({
                    data: {
                        email,
                        password: hashedPassword,
                        name,
                        createdAt: indianTime,
                        updatedAt: indianTime,
                        phone
                    },
                });
                return newUser;
            });

            return {
                success: true,
                user: this.sanitizeUser(user),
                message: 'Signup successful',
                timestamp: indianTime.toISOString()
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: 'Registration failed. Please try again later.',
                timestamp: this.getIndianTime().toISOString()
            };
        }
    }

    private sanitizeUser(user: User) {
        const { password, ...sanitizedUser } = user;
        return sanitizedUser;
    }

    // Google OAuth
    async handleGoogleAuth(code: string) {
        try {

            // Step 1: Exchange code for tokens
            const { tokens } = await this.googleClient.getToken(code);

            if (!tokens || !tokens.id_token) {
                throw new Error('Token exchange failed. Tokens are missing.');
            }

            this.googleClient.setCredentials(tokens);

            // Step 2: Verify the ID token
            const ticket = await this.googleClient.verifyIdToken({
                idToken: tokens.id_token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });


            const googleProfile = ticket.getPayload();
            if (!googleProfile) {
                throw new Error('Failed to retrieve Google profile.');
            }


            // Step 3: Check if user exists in the database
            let user = await this.prisma.user.findUnique({
                where: { email: googleProfile.email },
            });

            // Step 4: If user doesn't exist, create a new user
            if (!user) {
                user = await this.prisma.user.create({
                    data: {
                        email: googleProfile.email,
                        name: googleProfile.name,
                        createdAt: this.getIndianTime(),
                        updatedAt: this.getIndianTime(),
                        googleId: googleProfile.sub,
                    },
                });
            } else if (!user.googleId) {
                // Update existing user with Google ID if not present
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: { googleId: googleProfile.sub },
                });
            }

            const payload = { sub: user.id, email: user.email };
            const accessToken = this.jwtService.sign(payload);

            return {
                success: true,
                type: "login",
                message: 'Login successful',
                user: this.sanitizeUser(user),
                accessToken,
            };

        } catch (error) {
            console.error(error);
            return {
                success: false,
                type: "login",
                message: 'An error occurred during Google authentication. Please try again.',
                user: null,
                accessToken: null
            };
        }
    }

    private getIndianTime(): Date {
        return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    }

}
