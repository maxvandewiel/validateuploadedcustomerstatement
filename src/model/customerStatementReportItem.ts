import CustomerStatement from "./customerStatement";

export default class CustomerStatementReportItem {
    constructor(readonly customerStatement: CustomerStatement | undefined,
                readonly transactionReference: String | undefined,
                public errorMessages: Array<string> | undefined,
                public status: string) {}
}
