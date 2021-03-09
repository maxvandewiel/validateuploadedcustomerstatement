export default class CustomerStatement {
    constructor(readonly transactionReference: string,
                readonly accountNumber: string,
                readonly startBalance: number,
                readonly mutation: number,
                readonly description: string,
                readonly endBalance: number) {}
}
