import 'dotenv/config';
import { Address, beginCell, contractAddress, storeStateInit, toNano } from '@ton/core';
import { SecureWallet } from './build/secure-wallet_SecureWallet';

console.log('>>> deploy.ts (QR mode) started');

async function main() {
  // 1. Владелец SecureWallet — твой тестнет-кошелек (Tonkeeper)
  // Укажи свой адрес (non-bounceable, testnet).
  const owner = Address.parse('0QBgKYOwUK7AWWgCi9mLXOir4hSK6UiYsWkLR8Ga83EjFRMi');

  // 2. Строим init-код и данные контракта
  const init = await SecureWallet.init(owner); // { code, data }

  // 3. Cell с StateInit (code + data)
  const stateInitBuilder = beginCell();
  storeStateInit(init)(stateInitBuilder);
  const stateInitCell = stateInitBuilder.endCell();

  // 4. Считаем адрес контракта (workchain 0)
  const secureWalletAddress = contractAddress(0, init);

  console.log('SecureWallet address (testnet):', secureWalletAddress.toString({ testOnly: true }));
  console.log(
    'Explorer (testnet):',
    `https://testnet.tonviewer.com/${secureWalletAddress.toString({ bounceable: false, testOnly: true })}`,
  );

  // 5. Сколько TON отправить при деплое (из .env или по умолчанию 0.3)
  const deployAmountTon = Number(process.env.DEPLOY_AMOUNT_TON ?? '0.3');
  const deployAmount = toNano(deployAmountTon.toString());

  // 6. Собираем deeplink для Tonkeeper
  const params = new URLSearchParams({
    text: 'Deploy SecureWallet by link',
    amount: deployAmount.toString(10),
    init: stateInitCell.toBoc({ idx: false }).toString('base64'),
  });

  const deployLink =
    'https://app.tonkeeper.com/transfer/' +
    secureWalletAddress.toString({ testOnly: true }) +
    '?' +
    params.toString();

  console.log('\n=== Deploy link for Tonkeeper ===\n');
  console.log(deployLink);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
