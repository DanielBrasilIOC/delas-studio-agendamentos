# D'ELAS — Studio de Beleza

Site responsivo e sistema de solicitação de agendamentos para serviços de cabelo.

## Estrutura
- `index.html`: vitrine pública estática (GitHub Pages).
- `backend/Code.gs`: backend Google Apps Script (fonte).
- `backend/Index.html`: interface completa hospedada pelo Apps Script (mesma origem, evitando problemas de CORS).

## Publicação
1. Ative GitHub Pages em **Settings → Pages → Deploy from a branch → main → /(root)**.
2. Crie uma planilha Google privada para os agendamentos.
3. Abra [script.google.com](https://script.google.com), crie um projeto e copie `backend/Code.gs` e `backend/Index.html` para os arquivos correspondentes.
4. No editor Apps Script, execute `setup()` e autorize as permissões. A função cria as abas e as configurações iniciais.
5. Em **Configurações do projeto → Propriedades do script**, defina:
   - `SPREADSHEET_ID`: ID da planilha criada (a função setup também o registra se criar a planilha).
   - `ADMIN_TOKEN_1`: token longo e aleatório, privado, para a primeira pessoa administradora.
   - `ADMIN_TOKEN_2`: token longo e aleatório, privado, para a segunda pessoa administradora.
6. Publique em **Implantar → Nova implantação → App da Web**. Executar como: sua conta. Acesso: qualquer pessoa. Copie a URL terminada em `/exec`.
7. Acesse a URL do Web App. O painel administrativo usa um dos dois tokens privados. Não coloque tokens na página pública ou neste repositório.

## Importante
- O repositório é público: nunca coloque planilha, dados de clientes, tokens, senhas ou URLs privadas aqui.
- O formulário da página GitHub Pages é apenas uma vitrine estática. O fluxo operacional e a agenda funcionam na URL do Web App Apps Script após a configuração.
- Os horários iniciais são blocos de 30 minutos; durações e intervalos devem ser ajustados no painel conforme a operação real.
- Pedidos começam como **Pendente de confirmação**. A agenda valida sobreposição no servidor usando bloqueio de concorrência.
- Acesso administrativo protegido por dois tokens independentes configurados nas Propriedades do Script. Guarde-os em local seguro e compartilhe apenas com as duas pessoas autorizadas.
- Para contas Google pessoais, a disponibilidade do e-mail de sessão pode variar; por isso a primeira versão usa tokens de acesso administrativos, não autenticação por e-mail.
