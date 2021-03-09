import CustomerStatementsReport from "../model/customerStatementsReport";
import { parse } from '@fast-csv/parse';
import CustomerStatement from "../model/customerStatement";
import CustomerStatementReportItem from "../model/customerStatementReportItem";
import {isValidIBAN} from "ibantools";


export default class CustomerStatementCsvValidator {
    async validateCustomerStatementCsvContent(content: string, key: string): Promise<CustomerStatementsReport> {
        type StatementRow = {
            transactionReference: string;
            accountNumber: string;
            startBalance: number;
            mutation: number;
            description: string;
            endBalance: number;
        };

        const reportItems: Array<CustomerStatementReportItem> = new Array<CustomerStatementReportItem>();

        const stream = parse<StatementRow, CustomerStatement>({ headers: true })
            .transform(
                (data: StatementRow): CustomerStatement => ({
                    transactionReference: data.transactionReference,
                    accountNumber: data.accountNumber,
                    startBalance: data.startBalance,
                    mutation: data.mutation,
                    description: data.description,
                    endBalance: data.endBalance
                }),
            )
            .on('error', error => {
                console.error(error);
                reportItems.push(new CustomerStatementReportItem(undefined, undefined,
                    [`Failed to parse csv file records`], "FAILED"));
            })
            .on('data', (row: CustomerStatement) => {
                const errors: Array<string> = new Array<string>();
                if (!row.transactionReference) {
                    errors.push("Transaction reference missing");
                } else if (!row.accountNumber || !isValidIBAN(row.accountNumber)) {
                    errors.push("Invalid account number");
                } else if (!row.startBalance || isNaN(row.startBalance)) {
                    errors.push("Start Balance invalid");
                } else if (!row.mutation || isNaN(row.mutation)) {
                    errors.push("Mutation invalid");
                } else if (!row.endBalance || isNaN(row.endBalance) || row.startBalance +
                    row.mutation !== row.endBalance) {
                    errors.push("EndBalance invalid");
                }
                reportItems.push(new CustomerStatementReportItem(row, row.transactionReference, errors, errors.length > 0 ? "FAIL":"SUCCESS"));
                console.log(JSON.stringify(row))
            })
            .on('end', (rowCount: number) => {
                console.log(`Parsed ${rowCount} rows`)
            });
        stream.write(content);
        stream.end();

        reportItems.forEach(it => {
            if (reportItems.filter(x => x.transactionReference == it.transactionReference).length > 1) {
                if ( it.errorMessages === undefined ) {
                    it.errorMessages = new Array<string>();
                }
                it.errorMessages.push("Transaction is not unique")
                it.status = "FAIL";
            }
        });

        return new CustomerStatementsReport(key, reportItems);
    }

}
