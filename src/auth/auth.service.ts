import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './jwt/jwt.strategy';

/**
 * Serviço de autenticação.
 */
@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService, // Injeta o serviço JWT
    ) { }

    /**
     * Valida as credenciais do usuário para login.
     * @param email Email do usuário.
     * @param senha Senha do usuário.
     * @returns O usuário validado (sem a senha hashada).
     * @throws UnauthorizedException Se as credenciais forem inválidas.
     */
    async validateUser(email: string, senha: string): Promise<any> {
        const user = await this.usersService.findByEmail(email); // Busca o usuário pelo email (com a senha hashada)

        if (user && await bcrypt.compare(senha, user.senha)) {
            // Se a senha estiver correta, retorna o usuário sem a senha hashada
            const { senha, ...result } = user;
            return result;
        }
        throw new UnauthorizedException('Credenciais inválidas.');
    }

    /**
     * Realiza o login do usuário e gera um token JWT.
     * @param user O objeto de usuário retornado por `validateUser`.
     * @returns Um objeto contendo o token de acesso.
     */
    async login(loginUserDto: LoginUserDto) {
        const user = await this.validateUser(loginUserDto.email, loginUserDto.senha);

        // Payload do JWT com o ID e email do usuário
        const payload: JwtPayload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload), // Gera o token JWT
        };
    }
}
