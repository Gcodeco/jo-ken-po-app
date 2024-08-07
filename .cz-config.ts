module.exports = {
  // Lista de tipos de commits
  types: [
    { value: 'feat', name: 'feat:     Novo recurso' },
    { value: 'fix', name: 'fix:      Correção de bug' },
    { value: 'docs', name: 'docs:     Atualização de documentação' },
    {
      value: 'style',
      name: 'style:    Estilos e formatação de código (não altera o código)',
    },
    {
      value: 'refactor',
      name: 'refactor: Refatoração de código (nenhuma nova funcionalidade ou correção de bug)',
    },
    { value: 'perf', name: 'perf:     Melhoria de desempenho' },
    {
      value: 'test',
      name: 'test:     Adiciona testes ou corrige testes existentes',
    },
    {
      value: 'build',
      name: 'build:    Alterações no processo de build ou dependências',
    },
    { value: 'ci', name: 'ci:       Alterações no processo de CI' },
    { value: 'chore', name: 'chore:    Alterações menores e manutenção' },
    { value: 'revert', name: 'revert:   Reverte um commit anterior' },
  ],
  // Mensagem padrão de cabeçalho do commit
  messages: {
    type: 'Escolha o tipo de mudança que você está fazendo:',
    subject: 'Breve descrição do que mudou:\n',
    body: 'Descrição mais detalhada dos commits (opcional):\n',
    footer: 'Referências para tickets/issue (opcional):\n',
    confirmCommit: 'Você está feliz com este commit?',
  },
  // Ordem das etapas do prompt
  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix'],
  breaklineNumber: 100,
  skipQuestions: [],
  themeColor: '',
  maxHeaderWidth: 100,
}
