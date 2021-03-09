import CustomerStatement from "../../src/model/customerStatement";
import CustomerStatementReportItem from "../../src/model/customerStatementReportItem";

const referenceNumber: string = 'Reference Number';
const accountNumber: string = 'account  number';
const startBalance: number = 110.5;
const mutation: number = 65.1;
const description: string = 'test mutation';
const endBalance: number = 45.4;
const error: string = "error";
const status: string = "FAILED";

test('customerStatementsTest',async () => {
    const errors: Array<string> = [error];
    const customerStatement: CustomerStatement = new CustomerStatement(referenceNumber, accountNumber, startBalance, mutation, description, endBalance);

    const statement: CustomerStatementReportItem = new CustomerStatementReportItem(customerStatement,
        referenceNumber, errors, status
    );
    expect(statement.transactionReference).toBe(referenceNumber);
    expect(statement.status).toBe(status);
});
