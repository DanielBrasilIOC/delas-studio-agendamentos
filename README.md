# D'ELAS — Studio de Beleza

Sistema web responsivo para solicitar e administrar agendamentos de serviços de cabelo do **D'ELAS — Studio de Beleza**.

> **Status:** projeto em desenvolvimento. Ainda não está publicado, não foi validado de ponta a ponta e não deve receber clientes até concluir a implantação e os testes na conta Google responsável pelo salão.

## Arquivos do projeto

- `backend/Code.gs`: lógica do servidor, criação/uso das planilhas, catálogo, horários, agendamentos, bloqueios, autenticação administrativa e auditoria.
- `backend/Public.html`: página pública com catálogo e formulário de solicitação de agendamento.
- `backend/Index.html`: painel administrativo.
- `index.html`: página estática informativa; não é o sistema operacional de agendamento.

## Recursos previstos

- Catálogo de serviços capilares e preços em reais.
- Solicitação de agendamento com seleção de vários serviços, dados de contato, data, horário e observações.
- Soma automática das durações dos serviços selecionados e cálculo de estimativa.
- Adicional extra longo/volumoso aplicado sobre o serviço-base selecionado: R$ 30 para progressiva e R$ 50 para mechas. O adicional não pode ser agendado isoladamente.
- Solicitações iniciadas como **Pendente de confirmação**.
- Painel com visão diária ou semanal, busca por cliente/WhatsApp/serviço/ID, detalhes do pedido, estimativa, alteração de status e agendamento manual com vários serviços.
- Gestão de bloqueios (consulta e remoção), edição de descrições, preços/durações e ativação/desativação do catálogo e consulta dos últimos registros de auditoria.
- Validação no servidor para impedir agendamentos em horários sobrepostos.
- Registro de ações administrativas em uma aba de auditoria.

Os preços indicados como “a partir de” são estimativas iniciais e podem mudar após avaliação no salão. As durações cadastradas inicialmente são parâmetros provisórios e precisam ser confirmadas pela administração antes da abertura ao público.

## Implantação na conta Google do salão

A implantação precisa ser feita e autorizada na conta Google que ficará responsável pelo sistema. O repositório não contém acesso a essa conta, à planilha privada nem às credenciais administrativas.

1. Entre em [Google Apps Script](https://script.google.com/) com a conta Google responsável pelo salão e crie um novo projeto.
2. No projeto, substitua o conteúdo do arquivo `Code.gs` pelo conteúdo de `backend/Code.gs`.
3. Crie dois arquivos HTML no Apps Script:
   - `Public`: copie o conteúdo de `backend/Public.html`.
   - `Index`: copie o conteúdo de `backend/Index.html`.
4. No editor, execute a função `setup()`. Na primeira execução, revise as permissões solicitadas e autorize-as com a conta responsável. A configuração inicial cria a planilha e as abas necessárias e registra o identificador da planilha nas propriedades do projeto.
5. Se estiver atualizando uma implantação anterior, execute `setup()` novamente após substituir o código. A função preserva os dados existentes e acrescenta as colunas de estimativa/detalhamento ao final da aba Agendamentos. Não apague a planilha já usada.
6. Em **Configurações do projeto → Propriedades do script**, configure:
   - `ADMIN_TOKEN_1`: segredo longo e aleatório para a primeira pessoa autorizada.
   - `ADMIN_TOKEN_2`: segredo longo e aleatório, diferente do primeiro, para a segunda pessoa autorizada.
7. Salve o projeto e escolha **Implantar → Nova implantação → App da Web**:
   - **Executar como:** sua conta.
   - **Quem pode acessar:** escolha a opção compatível com a política da conta e com o uso pretendido. Para um formulário público, o acesso precisa permitir que os clientes abram a página; confira as implicações de segurança antes de publicar.
8. Conclua a implantação e copie a URL terminada em `/exec`. Essa será a URL pública do sistema.
9. Abra a URL para conferir a página pública. Para abrir o painel administrativo, use a mesma URL acrescentando `?page=admin`.
10. Faça os testes de seleção múltipla, estimativa, adicionais, soma de duração, conflito de horários, bloqueios, edição do catálogo, auditoria, alteração de status e acesso dos dois administradores antes de divulgar o endereço aos clientes.

## Acesso administrativo e segurança

- O painel usa dois tokens independentes definidos nas Propriedades do Script. Cada pessoa autorizada deve receber somente o seu próprio token.
- **Não** publique tokens, senhas, identificadores privados, dados de clientes ou cópias da planilha neste repositório.
- Os tokens são credenciais compartilhadas, não uma autenticação individual vinculada ao e-mail Google. Quem tiver um token poderá usar o acesso correspondente; portanto, armazene e compartilhe os tokens com cuidado.
- Não habilite o recebimento de clientes antes de concluir os testes e confirmar as configurações de acesso, privacidade e operação.

## Limitações e próximos passos

- A página estática `index.html` no GitHub Pages não está conectada ao backend e não deve ser usada para receber agendamentos.
- A aplicação funcional é servida pelo Google Apps Script depois da implantação; a URL `/exec` só existirá após essa etapa.
- As durações iniciais dos serviços são provisórias e precisam ser confirmadas.
- A segunda pessoa administradora precisa receber seu próprio token de acesso.
- A lógica de seleção de múltiplos serviços, estimativas, adicionais por comprimento, soma de duração, visão semanal e recursos administrativos foi implementada no repositório e passou por verificações de sintaxe e testes isolados. Ainda é obrigatória a implantação e a validação ponta a ponta na planilha real do salão; essas verificações não foram executadas na conta Google.

## Repositório

[DanielBrasilIOC/delas-studio-agendamentos](https://github.com/DanielBrasilIOC/delas-studio-agendamentos)
