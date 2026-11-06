# Como guardar este projeto no GitHub

O **GitHub** guarda os arquivos e o histórico do projeto. A **Vercel** hospeda o site que as pessoas usam. Você pode ter os dois: o código no GitHub e o link do site na descrição do repositório e no README.

O código já está nesta pasta. Embora tenha sido criado com assistência de IA, você pode guardá-lo na sua conta e continuar estudando e modificando o projeto. Não é necessário dizer que escreveu tudo sozinho; explicar a assistência recebida e o que você aprendeu apresenta o trabalho com clareza.

## Pelo navegador, sem terminal

1. Extraia o ZIP do projeto no computador. O GitHub precisa dos arquivos extraídos, não apenas do ZIP.
2. Entre na sua conta em [github.com](https://github.com).
3. Acesse [github.com/new](https://github.com/new).
4. Dê o nome `auto-escola-ouro-editor` ao repositório.
5. Na descrição, use: `Editor de artes de aprovados com foto, nome, enquadramento e exportação PNG.`
6. Para guardar uma cópia só para você, escolha **Private**. Você poderá decidir depois se quer torná-la pública.
7. Como esta pasta já tem README e `.gitignore`, não peça ao GitHub para criar outros arquivos iniciais.
8. Clique em **Create repository**.
9. Na página do repositório vazio, clique no link **uploading an existing file**.
10. Arraste o conteúdo desta pasta para a área de upload, incluindo as pastas `assets`, `scripts` e `tests`. O arquivo `index.html` deve ficar na raiz, junto com `README.md`, `app.js` e `styles.css`.
11. Use a mensagem `Adiciona a primeira versão do editor` e clique em **Commit changes**.
12. Na área **About**, use o ícone de edição para adicionar o endereço do site no campo **Website**: `https://auto-escola-ouro-editor.vercel.app/`.

Pronto: o repositório passa a guardar o código e o README mostra o link do site. Um repositório privado não torna privado o site que já está publicado na Vercel.

## Para entender o código

Comece por `index.html` para reconhecer os campos e os botões. Depois veja `styles.css` para entender o visual e `app.js` para acompanhar o que acontece quando você seleciona uma foto ou salva a arte.

Não envie senhas, tokens, arquivos `.env`, a pasta `.vercel` ou dados privados da sua conta. Esses arquivos não fazem parte deste pacote.

## Documentação oficial

- [Criar um repositório para seu projeto](https://docs.github.com/en/get-started/start-your-journey/creating-a-repository-for-your-project-on-github)
- [Adicionar arquivos a um repositório](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
- [Sobre o README](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)
