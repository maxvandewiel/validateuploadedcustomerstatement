import CustomerStatement from "../../src/model/customerStatement";


const referenceNumber: string = 'Reference Number';
const accountNumber: string = 'account  number';
const startBalance: number = 110.5;
const mutation: number = 65.1;
const description: string = 'test mutation';
const endBalance: number = 45.4;


test('customerStatementTest',async () => {
    const statement = new CustomerStatement(referenceNumber, accountNumber, startBalance, mutation, description, endBalance);
    expect(statement.transactionReference).toBe(referenceNumber);
    expect(statement.accountNumber).toBe(accountNumber);
    expect(statement.startBalance).toBe(startBalance);
    expect(statement.mutation).toBe(mutation);
    expect(statement.description).toBe(description);
    expect(statement.endBalance).toBe(endBalance);
});
