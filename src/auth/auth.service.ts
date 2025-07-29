import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './jwt/jwt.strategy';

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
    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email); // Busca o usuário pelo email (com a senha hashada)

        if (user && await bcrypt.compare(password, user.senha)) {
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
        const user = await this.validateUser(loginUserDto.email, loginUserDto.password);

        // Payload do JWT com o ID e email do usuário
        const payload: JwtPayload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload), // Gera o token JWT
        };
    }

    async register(createUserDto: CreateUserDto) {
        // Verifique se o email já existe
        const existingUser = await this.usersService.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new UnauthorizedException('Este email já está em uso.');
        }
        // Crie o usuário usando o UsersService
        const newUser = await this.usersService.create(createUserDto);
        // Opcional: fazer login automático após o registro
        const payload = { email: newUser.email, sub: newUser.id };
        return {
            user: newUser,
            access_token: this.jwtService.sign(payload),
        };
    }
}
