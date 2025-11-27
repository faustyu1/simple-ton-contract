# Описание скриптов

В этом проекте используются несколько вспомогательных TypeScript‑скриптов для работы с смарт‑контрактом **SecureWallet** в тестовой сети TON.

## `deploy.ts`

Скрипт для подготовки деплоя контракта `SecureWallet` через Tonkeeper по deeplink‑ссылке (QR‑режим).

**Что делает:**
- задаёт владельца кошелька `SecureWallet` (адрес тестнет‑кошелька Tonkeeper в коде);
- вычисляет `StateInit` (код + данные) через `SecureWallet.init(owner)`;
- считает адрес контракта в workchain `0`;
- выводит в консоль адрес контракта и ссылку на него в testnet‑explorer (`tonviewer`);
- формирует deeplink на `app.tonkeeper.com/transfer/...` с:
  - текстом `Deploy SecureWallet by link`;
  - суммой деплоя в nanoTON (берётся из переменной окружения `DEPLOY_AMOUNT_TON` или по умолчанию `0.3` TON);
  - `init` — BOC `StateInit` в base64;
- выводит итоговую ссылку в консоль, чтобы её можно было открыть в Tonkeeper или закодировать в QR‑код.

**Переменные окружения:**
- `DEPLOY_AMOUNT_TON` — количество TON для деплоя (по умолчанию `0.3`).

## `withdraw-link.ts`

Скрипт для генерации deeplink‑ссылки на вывод средств (`Withdraw`) из уже задеплоенного `SecureWallet`.

**Что делает:**
- читает адрес задеплоенного `SecureWallet` из `SECURE_WALLET_ADDRESS` в `.env` и парсит его в `Address`;
- берёт желаемую сумму вывода в TON из `WITHDRAW_AMOUNT_TON` (по умолчанию `0.1`), переводит её в nanoTON;
- формирует сообщение типа `Withdraw` с полем `amount`;
- сериализует сообщение в BOC (base64) через `storeWithdraw` и `beginCell()`;
- выбирает сумму, которая будет реально отправлена в контракт (
  `WITHDRAW_SEND_TON` или, если не задана, то `WITHDRAW_AMOUNT_TON`);
- собирает deeplink на `app.tonkeeper.com/transfer/...` c параметрами:
  - `amount` — сумма в nanoTON, которая пойдёт на газ + вход;
  - `bin` — тело сообщения `Withdraw` (BOC в base64);
- выводит в консоль адрес контракта, ссылку на него в `tonviewer` и итоговую ссылку для Tonkeeper.

**Переменные окружения:**
- `SECURE_WALLET_ADDRESS` — адрес задеплоенного `SecureWallet` в тестнете;
- `WITHDRAW_AMOUNT_TON` — логическая сумма, которую хотим вывести (по умолчанию `0.1` TON);
- `WITHDRAW_SEND_TON` — сколько TON реально отправить в контракт (на газ + вход), по умолчанию равно `WITHDRAW_AMOUNT_TON`.


