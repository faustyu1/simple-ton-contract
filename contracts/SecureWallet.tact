// Простой "защищённый кошелёк" для TON на языке Tact.
// Тема безопасности: реализован контроль доступа (only owner),
// проверки инвариантов и безопасная обработка сообщений.

// Сообщение для вывода средств
message Withdraw {
    // Количество TON, которое нужно вывести (в нанотонах)
    amount: Int as coins;
}

// Контракт SecureWallet
// Параметр owner задаётся один раз при деплое и дальше не меняется.
contract SecureWallet(
    owner: Address   // адрес владельца кошелька
) {

    // Пустой receive: контракт может принимать входящие переводы TON.
    // Любой пользователь/контракт может отправить сюда средства.
    receive() {
        // Ничего не делаем — просто принимаем входящий перевод.
        // Деньги остаются на балансе контракта.
    }

    // Обработчик служебного сообщения Withdraw.
    // Сообщение должно прийти от адреса владельца.
    receive(msg: Withdraw) {

        // 1. Контроль доступа: проверяем, кто отправил сообщение.
        require(sender() == self.owner, "ACCESS_DENIED");

        // 2. Проверяем корректность суммы и наличие средств.
        require(msg.amount > 0, "INVALID_AMOUNT");
        require(myBalance() >= msg.amount, "INSUFFICIENT_FUNDS");

        // 3. Переводим указанную сумму владельцу.
        //    Используем SendIgnoreErrors, чтобы ошибка у получателя
        //    не ломала транзакцию этого контракта.
        send(SendParameters {
            to: self.owner,
            value: msg.amount,
            mode: SendIgnoreErrors
            // body по умолчанию = null
        });

        // 4. Пишем простое событие для off-chain аудита.
        //    Аналитик может по логам увидеть факт вывода.
        emit("SecureWallet: withdraw executed".asComment());
    }

    // Getter: вернуть адрес владельца.
    get fun get_owner(): Address {
        return self.owner;
    }

    // Getter: вернуть текущий баланс контракта (в нанотонах).
    get fun get_balance(): Int {
        return myBalance();
    }
}
