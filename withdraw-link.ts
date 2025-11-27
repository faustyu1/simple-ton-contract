import 'dotenv/config';
import { Address, beginCell, toNano } from '@ton/core';
import { Withdraw, storeWithdraw } from './build/secure-wallet_SecureWallet';

console.log('>>> withdraw-link.ts started');

async function main() {
  // Адрес уже задеплоенного SecureWallet
  const secureWalletAddressStr = process.env.SECURE_WALLET_ADDRESS;
  if (!secureWalletAddressStr) {
    throw new Error('SECURE_WALLET_ADDRESS is not set. Скопируй адрес контракта из deploy.ts / tonviewer в .env');
  }
  const secureWalletAddress = Address.parse(secureWalletAddressStr);

  // Сколько вывести (TON) — можно переопределить через WITHDRAW_AMOUNT_TON в .env
  const amountTonStr = process.env.WITHDRAW_AMOUNT_TON ?? '0.1';
  const amount = toNano(amountTonStr);

  const msg: Withdraw = { $$type: 'Withdraw', amount };

  // Собираем body BOC для сообщения Withdraw
  const body = beginCell().store(storeWithdraw(msg)).endCell();
  const bodyBocBase64 = body.toBoc({ idx: false }).toString('base64');

  // Сколько TON реально отправить в контракт (на газ + вход)
  // Можно задать отдельно через WITHDRAW_SEND_TON, по умолчанию = amountTonStr
  const sendAmountTonStr = process.env.WITHDRAW_SEND_TON ?? amountTonStr;
  const _sendAmountNano = toNano(sendAmountTonStr).toString(10);

  // По Tonkeeper API: amount обязателен, если присутствует bin
  const params = new URLSearchParams({
    amount: _sendAmountNano,
    bin: bodyBocBase64,
  });

  const link =
    'https://app.tonkeeper.com/transfer/' +
    secureWalletAddress.toString({ testOnly: true }) +
    '?' +
    params.toString();

  console.log('SecureWallet (testnet):', secureWalletAddress.toString({ bounceable: false, testOnly: true }));
  console.log(
    'Explorer:',
    `https://testnet.tonviewer.com/${secureWalletAddress.toString({ bounceable: false, testOnly: true })}`,
  );
  console.log('\n=== Withdraw link for Tonkeeper ===\n');
  console.log(link);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
