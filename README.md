# D'ELAS — Agenda compartilhada

Agenda interna simples para as duas responsáveis do D'ELAS Studio de Beleza cadastrarem e consultarem os atendimentos de cabelo em uma única agenda.

## Funções
- Cadastro de cliente, WhatsApp, serviço, data, horário de início e término e observações.
- Agenda compartilhada entre os dois acessos autorizados.
- Verificação no servidor para impedir horários sobrepostos, mesmo em cadastros simultâneos.
- Todo atendimento novo começa como **Pendente de confirmação**.
- As responsáveis podem alterar a situação para Confirmado, Concluído ou Cancelado.
- Horário de funcionamento validado: terça a sábado, das 09h às 18h.

Não há cadastro público de clientes, catálogo complexo, pagamentos, relatórios ou painel extra.

## Usuárias autorizadas
- brasil.moura@gmail.com — propriedade de script `ADMIN_TOKEN_1`
- sobrancelhasecia.camila@gmail.com — propriedade de script `ADMIN_TOKEN_2`

Cada responsável deve ter seu próprio token, longo e aleatório. Cadastre os tokens em Configurações do projeto → Propriedades do script. Não os publique no GitHub nem compartilhe um token entre as duas pessoas.

## Implantação necessária
1. Entre em https://script.google.com/ na conta Google que será responsável pela agenda e crie um projeto.
2. Copie `backend/Code.gs` para o arquivo `Code.gs` do Apps Script.
3. Crie um arquivo HTML chamado `Index` e copie `backend/Index.html`.
4. Execute `setup()` e autorize a criação/uso da planilha. Será criada a aba `Agenda`.
5. Cadastre `ADMIN_TOKEN_1` e `ADMIN_TOKEN_2` nas Propriedades do script.
6. Vá em Implantar → Nova implantação → App da Web. Escolha executar como a conta responsável e defina o acesso conforme as regras da conta Google e a política de privacidade do salão.
7. Abra a URL `/exec` gerada e teste os dois acessos, a criação, a consulta e o bloqueio de conflitos antes de usar com os atendimentos reais.

## Situação atual
O código simplificado está no repositório, mas ainda **não foi copiado para o projeto Apps Script nem implantado**. A URL do GitHub Pages não é a agenda e não registra atendimentos. A implantação e os testes reais ainda precisam ser feitos na conta Google responsável.
