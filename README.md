# Gamepad Mapper Android

Mapeador de controles Bluetooth e USB para jogos Android, com perfis locais, sobreposição e atualização via GitHub Releases.

> **Importante:** o Android não permite injetar toques globais de forma silenciosa sem root. Este projeto usa as APIs oficiais de **Serviço de Acessibilidade** e **Exibir sobre outros apps**. O usuário ativa as duas permissões uma única vez nas configurações do sistema.

## O que já está no MVP

- Interface limpa em português com status do controle, perfis e acesso rápido ao mapeador.
- Detecção de gamepads HID Bluetooth/USB por bridge nativa (com fallback de `navigator.getGamepads` no preview web).
- Perfil padrão persistido no dispositivo com AsyncStorage.
- Tela de mapeamento com ações Toque, Arrastar, Tecla e Desativado.
- Settings para sobreposição, execução em segundo plano, abertura direta e verificação ao iniciar.
- Verificação automática do último release em `Igu2012/gamepad-mapper-android`.
- Plugin Expo que registra permissões, serviço de acessibilidade e ponte nativa Android.

## Gerar a APK

O projeto foi criado com Expo SDK 54. Para gerar uma APK nativa, é necessário um ambiente com Android SDK/Gradle ou EAS Build:

```bash
pnpm install
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

O arquivo final ficará em `android/app/build/outputs/apk/release/app-release.apk`.

Para publicação, crie um release no GitHub e anexe a APK com um tag semântico, por exemplo `v1.0.0`:

```bash
gh release create v1.0.0 android/app/build/outputs/apk/release/app-release.apk --title "Gamepad Mapper v1.0.0" --notes-file RELEASE_NOTES.md
```

A aplicação consulta a API pública de releases ao abrir e direciona o usuário para a APK mais recente quando a versão remota é maior.

## Permissões

1. Instale e abra a aplicação.
2. Em **Settings**, ative **Serviço de acessibilidade** para Gamepad Mapper.
3. Ative **Exibir sobre outros apps**.
4. Conecte o controle por Bluetooth ou cabo e abra o jogo.

A compatibilidade depende do fabricante do controle e do Android. Controles HID padrão são priorizados; modelos que não expõem botões como eventos HID podem exigir suporte adicional específico.

## Estrutura

- `app/(tabs)/index.tsx`: dashboard.
- `app/mapping.tsx`: editor visual de perfil.
- `app/settings.tsx`: permissões, segundo plano e updates.
- `lib/gamepad-service.ts`: contrato de eventos nativos.
- `lib/update-checker.ts`: atualização automática via GitHub Releases.
- `plugins/withGamepadMapper.js`: configuração nativa Expo.
- `modules/gamepad-mapper/`: serviço Android de acessibilidade e sobreposição.
