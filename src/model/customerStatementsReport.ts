import CustomerStatementReportItem from "./customerStatementReportItem";

export default class CustomerStatementsReport {
    constructor( public id: string, readonly reportItems: Array<CustomerStatementReportItem>) {}
}
