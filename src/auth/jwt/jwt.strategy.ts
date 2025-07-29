import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";


export interface JwtPayload {
    email: string;
    sub: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private usersService: UsersService,
        private configService: ConfigService, // Injeta o ConfigService
    ) {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
            throw new InternalServerErrorException('JWT_SECRET não está configurado nas variáveis de ambiente.');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrai o token do header Authorization: Bearer <token>
            ignoreExpiration: false, // O token deve expirar
            secretOrKey: jwtSecret, // Usa a chave secreta validada
        });
    }

    /**
     * Valida o payload do JWT.
     * @param payload O payload decodificado do JWT.
     * @returns O usuário validado (sem a senha).
     * @throws UnauthorizedException Se o usuário não for encontrado.
     */
    async validate(payload: JwtPayload) {
        const user = await this.usersService.findOne(payload.sub); // Busca o usuário pelo ID (sub)
        if (!user) {
            throw new UnauthorizedException('Usuário não autorizado.');
        }
        return user; // Retorna o usuário. Ele será anexado ao objeto request (e.g., req.user)
    }
}