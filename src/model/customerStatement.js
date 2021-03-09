"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CustomerStatement {
    constructor(transactionReference, accountNumber, startBalance, mutation, description, endBalance) {
        this.transactionReference = transactionReference;
        this.accountNumber = accountNumber;
        this.startBalance = startBalance;
        this.mutation = mutation;
        this.description = description;
        this.endBalance = endBalance;
    }
}
exports.default = CustomerStatement;
//# sourceMappingURL=customerStatement.js.map