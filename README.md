# Auto Escola Ouro · Editor de Aprovados

Meu primeiro projeto web: uma ferramenta para montar artes de aprovação com a identidade visual da Auto Escola Ouro.

**[Abrir o projeto online](https://auto-escola-ouro-editor.vercel.app/)**

O usuário escolhe a foto, informa o nome, ajusta o enquadramento e exporta uma imagem PNG de 1080 × 1080 pixels. O projeto foi desenvolvido com assistência de inteligência artificial e validado pelo responsável em um iPhone.

## Funcionalidades

- Seleção de foto da galeria ou câmera pelo navegador.
- Nome com tamanho ajustado ao espaço da moldura.
- Zoom, rotação e reposicionamento com o mouse ou com os dedos.
- Exportação em PNG, visualização da imagem pronta e compartilhamento quando o navegador permitir.
- Interface para celular e computador.
- Processamento da foto no navegador, sem enviar o arquivo escolhido para um servidor.

## Tecnologias

HTML, CSS e JavaScript, com Canvas, File API, Pointer Events e Web Share API. A hospedagem atual usa a Vercel. O aplicativo não utiliza banco de dados, servidor de aplicação ou bibliotecas externas.

## Arquivos do projeto

```text
index.html              Estrutura e conteúdo da página
styles.css              Cores, tamanhos e adaptação para celular
app.js                  Leitura de fotos, edição e exportação
assets/moldura.png      Moldura da arte
assets/exemplo.jpg      Foto de demonstração
vercel.json             Configuração da publicação
package.json            Comandos de desenvolvimento e testes
scripts/serve.cjs       Servidor para desenvolvimento local
tests/editor.test.cjs   Testes de lógica com APIs do navegador simuladas
GITHUB_PASSO_A_PASSO.md  Como guardar este projeto no GitHub
```

## Como executar

No computador, é possível abrir `index.html` no navegador. Para desenvolver usando um endereço local, instale Node.js 20 ou superior e execute, dentro desta pasta:

```sh
npm start
```

Abra o endereço exibido no terminal, normalmente `http://127.0.0.1:3000`.

Não é necessário executar `npm install`: o projeto não possui dependências externas.

No iPhone, prefira o endereço online no Safari. A prévia de HTML recebido por WhatsApp ou aberto no app Arquivos pode não permitir ler as fotos. O servidor local acima atende apenas o computador onde foi iniciado; seu endereço não funciona em outro telefone.

## Verificação

```sh
npm run check
npm test
```

Os testes cobrem seleção e troca de fotos, manutenção do acesso ao arquivo durante a leitura, alternativas de decodificação, enquadramento, exportação, cancelamentos e recuperação de erros. As APIs do navegador são simuladas; esses testes não substituem conferir o funcionamento em dispositivos reais.

A versão com todos os recursos incorporados em um único HTML foi confirmada pelo responsável como funcionando no iPhone. Nesta organização para GitHub, o HTML, o CSS, o JavaScript e as imagens ficam em arquivos separados, com a mesma lógica de edição.

## Publicação

Para publicar na Vercel, envie todos os arquivos do projeto mantendo a estrutura das pastas. Use o tipo de projeto **Other**, sem comando de build, com a pasta de saída `.`. O arquivo `vercel.json` contém essas opções.

Também é possível conectar um repositório do GitHub à Vercel para que novas alterações sejam publicadas a partir do repositório. Este pacote não faz essa conexão automaticamente e não contém credenciais da conta.

## Imagens e privacidade

A moldura e a foto de demonstração são distribuídas junto com o código. Antes de tornar o repositório público ou reutilizar esses materiais em outro projeto, confira a autorização para divulgar a marca e a imagem das pessoas. Para guardar seu primeiro projeto sem expor esses arquivos, comece com um repositório privado.

As fotos escolhidas durante o uso não são salvas neste repositório. A imagem final só é baixada ou compartilhada quando o usuário solicita.

## Aprendizados do projeto

- Desenhar uma imagem composta em Canvas.
- Organizar uma interface que funciona no celular.
- Tratar falhas na leitura de arquivos e diferenças entre navegadores.
- Preparar a exportação antes de abrir o compartilhamento no iPhone.
- Publicar um aplicativo estático e separar acesso ao código de acesso ao site.
