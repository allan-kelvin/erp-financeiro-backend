Estratégias de Autenticação: Implementaremos estratégias JWT (JSON Web Tokens) e, possivelmente, uma estratégia local (usuário/senha).

Login e Registro: Adicionaremos endpoints para que os usuários possam registrar novas contas e fazer login, recebendo um token JWT.

Guards de Autenticação: Usaremos os Guards do NestJS para proteger as rotas dos seus controllers (Cartões, Despesas, Contas a Pagar) e garantir que apenas usuários autenticados possam acessá-las.

Validação de Senha: Utilizaremos o bcrypt (que já está configurado no UsersService) para comparar as senhas fornecidas no login com as senhas hashadas armazenadas.