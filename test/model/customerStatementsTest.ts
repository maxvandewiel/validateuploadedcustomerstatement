import CustomerStatement from "../../src/model/customerStatement";
import CustomerStatements from "../../src/model/customerStatements";

const referenceNumber: string = 'Reference Number';
const accountNumber: string = 'account  number';
const startBalance: number = 110.5;
const mutation: number = 65.1;
const description: string = 'test mutation';
const endBalance: number = 45.4;

test('customerStatementsTest',async () => {
    const statements: Array<CustomerStatement> = new Array<CustomerStatement>();
    statements.push(new CustomerStatement(referenceNumber, accountNumber, startBalance, mutation, description, endBalance));
    const statementList: CustomerStatements = new CustomerStatements(statements);
    statementList.statements.forEach(statement => {
        expect(statement.transactionReference).toBe(referenceNumber);
        expect(statement.accountNumber).toBe(accountNumber);
        expect(statement.startBalance).toBe(startBalance);
        expect(statement.mutation).toBe(mutation);
        expect(statement.description).toBe(description);
        expect(statement.endBalance).toBe(endBalance);
    });
});
