# Gamepad Mapper Android

**Gamepad Mapper Android** é um mapeador de controles Bluetooth e USB para jogos Android. A versão atual oferece uma interface simples em português, perfis locais, editor de ações, sobreposição sobre o jogo e verificação automática de novas versões pelo GitHub Releases.

> **Versão atual: v1.0.0**

[Baixar a APK v1.0.0](https://github.com/Igu2012/gamepad-mapper-android/releases/download/v1.0.0/app-release.apk) · [Abrir o Release](https://github.com/Igu2012/gamepad-mapper-android/releases/tag/v1.0.0)

## Como funciona

O Android não permite que um aplicativo injete toques globais de forma silenciosa sem root. Para funcionar sem root e sem aplicativo externo, este projeto utiliza as APIs oficiais do Android:

- **Serviço de Acessibilidade**, para receber eventos do controle e enviar gestos;
- **Exibir sobre outros apps**, para mostrar a sobreposição durante o jogo;
- **Eventos HID**, para reconhecer controles Bluetooth e USB compatíveis.

As permissões são ativadas manualmente pelo usuário nas configurações do Android e podem ser revogadas a qualquer momento.

## Recursos da geração atual

- Dashboard direto ao ponto com status do controle conectado.
- Detecção de gamepads HID Bluetooth e USB.
- Perfil padrão persistido localmente no dispositivo.
- Editor visual de mapeamento com as ações **Toque**, **Arrastar**, **Tecla** e **Desativado**.
- Prévia da posição dos botões sobre a tela do jogo.
- Configurações para sobreposição, execução em segundo plano e abertura direta no perfil.
- Tela de permissões do sistema com acesso às configurações do Android.
- Verificação automática do último release ao abrir o aplicativo.
- Download direcionado para a APK publicada no GitHub Releases.
- Implementação nativa Android do serviço de acessibilidade e da sobreposição.
- Interface em português com tema escuro, layout responsivo e feedback de toque.

## Instalação da APK

1. Baixe [`app-release.apk`](https://github.com/Igu2012/gamepad-mapper-android/releases/download/v1.0.0/app-release.apk).
2. Abra o arquivo no Android.
3. Caso solicitado, permita a instalação pelo navegador ou gerenciador de arquivos.
4. Abra o **Gamepad Mapper**.
5. Entre em **Settings** e ative **Serviço de acessibilidade**.
6. Ative **Exibir sobre outros apps**.
7. Conecte o controle por Bluetooth ou cabo USB.
8. Abra o jogo e use o perfil escolhido.

O projeto exige **Android 7.0 ou superior (API 24)**.

## Compatibilidade

O aplicativo prioriza controles que aparecem como dispositivos HID padrão no Android. A compatibilidade pode variar conforme o fabricante, o modelo do controle, a versão do Android e o jogo utilizado. Alguns controles proprietários podem não expor todos os botões como eventos HID comuns.

A execução em segundo plano depende das políticas de economia de bateria do fabricante do aparelho. Em alguns dispositivos, pode ser necessário permitir que o Gamepad Mapper seja executado sem restrições de bateria.

## Desenvolvimento e build

Requisitos:

- Node.js 22 ou superior;
- pnpm;
- Java/JDK 21 com `javac`;
- Android SDK com API 36, Build Tools 36.0.0 e NDK 27.1.12297006;
- Gradle Wrapper incluído no projeto.

Instalação das dependências:

```bash
pnpm install
```

Validação TypeScript e lint:

```bash
pnpm check
pnpm lint
```

Regeneração do projeto nativo:

```bash
CI=1 npx expo prebuild --platform android
```

Geração da APK release:

```bash
cd android
printf 'sdk.dir=/caminho/para/android-sdk\n' > local.properties
./gradlew assembleRelease --no-daemon
```

A APK será gerada em:

```text
android/app/build/outputs/apk/release/app-release.apk
```

A APK v1.0.0 publicada foi compilada com sucesso e possui o seguinte SHA-256:

```text
d10cf8de8589b074fc0e73c1e13ebe8dc2abdce36be9dd717362c98233bd48ad
```

## Publicação de uma nova versão

Atualize a versão em `app.config.ts`, gere a APK e crie um novo release com uma tag semântica:

```bash
gh release create v1.1.0 \
  android/app/build/outputs/apk/release/app-release.apk \
  --title "Gamepad Mapper Android v1.1.0" \
  --notes-file RELEASE_NOTES.md
```

O aplicativo consulta:

```text
https://api.github.com/repos/Igu2012/gamepad-mapper-android/releases/latest
```

Quando a versão do release for maior que a versão instalada, o usuário será direcionado para o download da APK mais recente.

## Estrutura do projeto

| Caminho | Função |
|---|---|
| `app/(tabs)/index.tsx` | Dashboard principal e status do controle |
| `app/mapping.tsx` | Editor visual de perfis e ações |
| `app/settings.tsx` | Preferências, permissões e atualizações |
| `lib/gamepad-service.ts` | Contrato de eventos de gamepad |
| `lib/profile-store.ts` | Perfis e persistência local |
| `lib/update-checker.ts` | Verificação de novas versões |
| `plugins/withGamepadMapper.js` | Configuração nativa durante o prebuild |
| `modules/gamepad-mapper/` | Serviço Android de acessibilidade e sobreposição |
| `android/` | Projeto nativo gerado para compilação Android |

## Limitações conhecidas

A versão atual é uma primeira geração funcional. A posição padrão dos botões nativos está definida para um layout inicial e deverá ser conectada futuramente ao editor visual para que cada alteração seja refletida diretamente no serviço Android. O suporte a eixos analógicos, gatilhos, vibração e perfis por pacote de jogo pode ser ampliado em versões posteriores.

## Licença e contribuição

Este projeto é mantido no GitHub por **Igu2012**. Relatos de problemas e contribuições podem ser enviados pela aba [Issues](https://github.com/Igu2012/gamepad-mapper-android/issues).
