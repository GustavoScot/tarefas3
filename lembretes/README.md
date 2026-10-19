# Lembretes

Aplicativo acadêmico em React Native, Expo SDK 57 e TypeScript. Usa SQLite local, React Navigation com Native Stack e notificações locais. Sem backend, autenticação ou APIs externas.

## Executar

Requisitos: Node.js LTS e Expo Go compatível com SDK 57 no Android.

```sh
npm install
npm start
```

Leia o QR Code no Expo Go e permita notificações. Computador e celular devem estar na mesma rede. Para abrir em um emulador configurado, use `npm run android`.

No Expo Go, o app usa o canal padrão automático do Expo, omitindo `channelId` dos agendamentos. Isso evita a chamada de criação de canal personalizado que falhou com `NotificationsChannelsProvider` ausente no Expo Go 57 em uso. As categorias, ações, recorrência e armazenamento continuam implementados. A entrega e as ações precisam ser confirmadas no aparelho após essa adaptação.

Opcionalmente, `npm run android:device` compila e instala o aplicativo Android próprio em um celular conectado por USB. Requer JDK 17, Android SDK e depuração USB. No app próprio, o canal personalizado **Lembretes** continua sendo criado normalmente.

Também foi gerado `dist/lembretes-demo.apk`, um APK de demonstração para Android ARM64 (Android 7 ou superior), com o JavaScript incluído. Transfira esse arquivo para o celular, instale e abra **lembretes**. Essa versão não depende do Metro nem do Expo Go. Aceite as notificações quando o Android solicitar. A pasta `dist` é ignorada pelo Git; o APK gerado fica disponível apenas na cópia local do projeto.

No PowerShell, se a política de execução bloquear `npm.ps1`, use `npm.cmd install` e `npm.cmd start` (também vale para os comandos abaixo).

## Usar

- Toque em **Novo lembrete**, preencha o nome e digite o horário com quatro números (ex.: `0930` vira `09:30`). A descrição é opcional.
- **Uma vez** agenda a próxima ocorrência do horário: hoje, se ainda for futuro, ou amanhã.
- **Diariamente** agenda uma recorrência nativa no horário escolhido.
- Expanda a notificação na bandeja do Android para ver **Concluir** e **Adiar 2 min**. As ações abrem o aplicativo para processar e salvar a alteração, inclusive se ele estava fechado.
- **Concluir** finaliza um lembrete único. Para diários, registra a data da conclusão e mantém a recorrência ativa. Também remove eventuais adiamentos pendentes.
- **Adiar 2 min** mantém o agendamento original e substitui qualquer adiamento pendente daquele lembrete.
- **Cancelar notificações** remove os agendamentos apenas do lembrete selecionado e mantém o card como cancelado.

Se a permissão for negada, o app continua exibindo a lista, mas impede novos cadastros sem notificação. Habilite a permissão nas configurações do aparelho e tente salvar novamente.

## Roteiro para testar no Android

1. Crie um lembrete único para dois minutos à frente, com nome e descrição. Confira os dados no card.
2. Feche e reabra o app. O card deve continuar salvo.
3. Deixe o app em segundo plano e aguarde o horário. Confira título e descrição na notificação. Teste também com o app aberto.
4. Expanda a notificação e toque em **Adiar 2 min**. Aguarde os dois minutos, sem alterar o relógio do aparelho. Na nova notificação, toque em **Concluir**: o card deve mostrar **Concluído**.
5. Crie um lembrete **Diariamente** para dois minutos à frente. Ao recebê-lo, toque em **Concluir**. O card deve continuar **Ativo**, com a última conclusão preenchida. O aviso do dia seguinte permanece agendado; para validar a entrega diária, aguarde a próxima ocorrência real.
6. Crie dois lembretes próximos. Cancele um deles: o card deve permanecer como **Cancelado** e somente o outro deve notificar. Repita com um lembrete que tenha um adiamento pendente.
7. Para testar a abertura a frio, receba um aviso, remova o app dos recentes e toque em uma das ações da notificação. Ao abrir, a ação pendente deve ser aplicada uma única vez. Não use **Forçar parada** nas configurações do Android para esse teste.
8. Teste nome vazio, horário inválido e permissão negada: nenhum desses casos deve criar um agendamento.

## Expo Go e limitações

- O erro `null cannot be cast ... NotificationsChannelsProvider` foi reproduzido na criação de um canal personalizado no Expo Go SDK 57 atualizado. O código agora detecta o Expo Go e usa o canal padrão do Expo, sem chamar a API que causava a falha. Esse mecanismo está descrito na [documentação de canais do SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/#handling-notification-channels). Reinicie o Metro com `npx expo start --go --clear` para testar a alteração.
- Para testar fora do Expo Go, execute `npm run android:device`. O Expo gera o projeto Android e inclui os módulos nativos instalados, entre eles `AndroidXNotificationsChannelsProvider`. Veja a [documentação de compilação local](https://docs.expo.dev/more/expo-cli/#compiling-android).
- Se aparecer `Cannot find native module 'ExpoTopicSubscriptionModule'`, pare o Metro e execute `npx expo start --clear`. O projeto usa uma fachada em `src/services/localNotifications.ts` que importa apenas as APIs locais da versão instalada, evitando a importação de tópicos push pelo índice principal do pacote. Esses caminhos internos devem ser revisados ao atualizar `expo-notifications`.
- A documentação informa suporte a notificações **locais** no Expo Go, mas esse suporte não impediu a falha nativa reproduzida neste projeto. Notificações push remotas não estão disponíveis no Expo Go para Android desde o SDK 53; este aplicativo usa somente notificações locais. Veja a [documentação do Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/).
- O Expo Go precisa ser compatível com a versão do SDK do projeto. Alterações nativas do `app.json`, como plugins e permissões do manifesto, só são incorporadas em um build próprio; elas não alteram o binário do Expo Go.
- No Android 12 ou superior, alarmes exatos dependem da permissão do sistema. O projeto declara `SCHEDULE_EXACT_ALARM` para builds próprios. Confira **Alarmes e lembretes** nas configurações do Android quando aplicável. Economia de bateria, Não Perturbe, bloqueio de notificações e restrições do fabricante podem afetar a entrega. Veja [permissões de notificações no SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/#permissions).
- As ações interativas abrem o app; não há tarefa JavaScript em segundo plano. Os agendamentos são gerenciados pelo sistema operacional.
- A atividade tem como alvo Android/iOS. A versão web não implementa SQLite e notificações.
- O banco persiste ao fechar/reabrir. Desinstalar o aplicativo ou limpar seus dados apaga os lembretes. No Expo Go, os dados pertencem ao ambiente do projeto dentro do Expo Go.

## Investigar atrasos no Android

O intervalo de adiamento é de 120 segundos a partir da entrada da ação no JavaScript. Esperas na inicialização, na fila ou em operações SQLite/cancelamento não acrescentam mais 120 segundos ao final. O Expo Go pode demorar a iniciar o JavaScript após o toque; o SDK 57 não fornece o horário nativo do toque nessa resposta.

Após recarregar o projeto, crie um lembrete novo e observe os logs:

- `[Tempos] Agendado`: horário solicitado para o lembrete original.
- `[Tempos] Adiado`: entrada da ação (`actionReceivedAt`), conclusão do agendamento (`scheduledAt`), horário previsto (`expectedAt`) e demora de processamento em segundos.
- `[Tempos] Notificação`: horário de disparo informado pelo Android (`nativeDispatchedAt`), horário de observação pelo JavaScript (`jsObservedAt`), atraso de disparo (`systemDelaySeconds`) e intervalo até a observação no JS (`jsObservationDelaySeconds`). Ao responder a uma notificação recebida em segundo plano, esse último intervalo inclui a espera do usuário antes de tocar e a abertura do app; não significa atraso do aviso.

As datas ISO terminadas em `Z` estão em UTC. O atraso em segundos é calculado sem depender da apresentação do fuso. A medição do disparo não mede separadamente a hora do som ou da exibição do banner. Notificações únicas e adiadas criadas após essa atualização carregam `expectedAt`; avisos antigos e recorrências diárias não fornecem esse cálculo de atraso por ocorrência.

No Android, o Expo SDK 57 usa `setExactAndAllowWhileIdle` quando permitido e `setAndAllowWhileIdle` quando a permissão de alarmes exatos está ausente, conforme o [código nativo do Expo](https://github.com/expo/expo/blob/sdk-57/packages/expo-notifications/android/src/main/java/expo/modules/notifications/service/delegates/ExpoSchedulingDelegate.kt). A permissão de exibir notificações é diferente da permissão de alarmes exatos. No Expo Go, as permissões nativas são as do Expo Go, não as declaradas no `app.json` deste projeto.

Para comparar, teste primeiro com o app aberto, tela ligada e economia de bateria desativada; depois teste em segundo plano. Procure **Alarmes e lembretes** nas configurações do Android e confira a autorização do Expo Go, se ele estiver listado. O modo Doze também limita a frequência de alarmes de um mesmo aplicativo; isso pode afetar testes repetidos com intervalos curtos, conforme a [documentação Android](https://developer.android.com/training/monitoring-device-state/doze-standby).

## Organização do código

```text
App.tsx                      Inicialização, listeners e navegação
src/screens/                 Lista e formulário
src/components/              Card e botão reutilizável
src/database/reminders.ts    Banco lembretes.db e operações SQL parametrizadas
src/services/notifications.ts Agendamento, ações e cancelamento
src/services/localNotifications.ts Importações das APIs locais do Expo
src/types/reminder.ts        Tipagens de lembretes e rotas
src/theme.ts                 Cores e espaçamentos centrais
tests/reminders.test.cjs      Testes da persistência e lógica das ações
```

A tabela `reminders` contém os campos da especificação. Uma pequena tabela auxiliar, `handled_responses`, registra as ações já processadas para impedir que o listener e a resposta pendente repitam o mesmo adiamento. As operações que alteram lembretes são serializadas para evitar conflitos entre salvar, cancelar e responder.

## Verificações

```sh
npm run typecheck
npm test
npx expo install --check
npx expo export --platform android
```

Os testes usam o executor nativo do Node e SQLite real em arquivos temporários. Requerem Node 22.13+ (recomendado Node 24 LTS); notificações e a ponte nativa do Expo são simuladas. Isso verifica persistência e regras das ações, mas não substitui o teste de entrega no aparelho.

Validação realizada neste ambiente: TypeScript sem erros e treze testes aprovados, incluindo o canal padrão do Expo Go, o cálculo do adiamento sem acrescentar tempo de processamento e a separação dos tempos de disparo e observação. Também foi exportado o bundle Android antes dos logs de diagnóstico. Um APK próprio foi compilado anteriormente com sucesso (`assembleRelease`), com assinatura e permissões verificadas; ele antecede as adaptações atuais do Expo Go e do adiamento. Não há dispositivo conectado para medir o atraso real das notificações no aparelho.
