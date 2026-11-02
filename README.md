# D'ELAS — Agenda compartilhada

Agenda interna de testes para Camila, Elaine e Iramar registrarem e consultarem os atendimentos em uma única agenda.

## Recursos
- Acesso individual por usuário e senha.
- Senhas armazenadas no servidor somente como hash PBKDF2-HMAC-SHA256 com salt individual e 12.000 iterações; não são incluídas no código público.
- Sessões temporárias no servidor (até 6 horas).
- Registro de quem criou ou alterou cada agendamento.
- Cadastro e consulta de clientes, WhatsApp, serviço, data, horários e observações.
- Bloqueio de horários sobrepostos no servidor.
- Situação inicial: Pendente de confirmação; opções Confirmado, Concluído e Cancelado.
- Horário permitido: terça a sábado, das 09h às 18h.

## Usuárias
- `camila`
- `elaine`
- `iramar`

## Configuração do servidor (Google Apps Script)
A autenticação real roda no Google Apps Script, não no GitHub Pages. A página pública do GitHub é apenas a interface estática e não deve ser usada como prova de autenticação ativa.

1. Entre em https://script.google.com/ com a conta Google que administrará a agenda e crie um projeto.
2. Copie `backend/Code.gs` para o arquivo `Code.gs`.
3. Crie um arquivo HTML chamado `Index` e copie `backend/Index.html`.
4. Em **Configurações do projeto → Propriedades do script**, cadastre temporariamente estas três propriedades, cada uma com uma senha forte e diferente (mínimo 12 caracteres):
   - `INITIAL_PASSWORD_CAMILA`
   - `INITIAL_PASSWORD_ELAINE`
   - `INITIAL_PASSWORD_IRAMAR`
   Não coloque as senhas no GitHub, em documentos compartilhados ou em mensagens.
5. No editor, execute `setup()` uma vez e autorize a planilha.
6. Execute `initializeAccess()` uma vez. O servidor transforma as senhas em hashes com salt e apaga as três propriedades de senha inicial. Não execute novamente após a configuração.
7. Em **Implantar → Nova implantação → App da Web**, escolha executar como a conta responsável e configure o acesso de acordo com a política da conta Google e do salão.
8. Abra a URL `/exec` gerada. Essa é a URL da agenda com autenticação funcional. Teste cada usuário e os agendamentos antes de usar com clientes reais.

## Estado da publicação
O código de autenticação individual foi preparado no repositório. Ele ainda precisa ser copiado e implantado no projeto Google Apps Script da conta responsável. A tela do GitHub Pages ainda não valida credenciais e não deve ser tratada como sistema de login ativo. A implantação do Apps Script e a configuração inicial das senhas exigem acesso à conta Google responsável.
