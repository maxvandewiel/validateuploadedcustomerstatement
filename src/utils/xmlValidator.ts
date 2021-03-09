import parser from "fast-xml-parser/src/parser";
import {isValidIBAN} from "ibantools";
import CustomerStatementReportItem from "../model/customerStatementReportItem";
import CustomerStatement from "../model/customerStatement";
import CustomerStatementsReport from "../model/customerStatementsReport";
import CustomerStatements from "../model/customerStatements";

const options = {
    attributeNamePrefix : "@_",
    attrNodeName: "attr", //default is 'false'
    textNodeName : "#text",
    ignoreAttributes : true,
    ignoreNameSpace : false,
    allowBooleanAttributes : false,
    parseNodeValue : true,
    parseAttributeValue : false,
    trimValues: true,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    parseTrueNumberOnly: false,
    arrayMode: false, //"strict"
    stopNodes: ["parse-me-as-string"]
};

export default class CustomerStatementXmlValidator {

    async validateCustomerStatementXmlContent(content: string, key: string): Promise<CustomerStatementsReport> {
        const reportItems: Array<CustomerStatementReportItem> = new Array<CustomerStatementReportItem>();
        try {
            const jsonObj: CustomerStatements = parser.parse(content,options, true);
            if (!jsonObj.statements) {
                reportItems.push(new CustomerStatementReportItem(undefined, undefined,
                    ["Customer statement XML file does not contain customerStatements root element"], "FAILED"));
                return new CustomerStatementsReport(key, reportItems);
            }
                jsonObj.statements.forEach(item => {
                    const errors: Array<string> = new Array<string>();
                    if (!item.transactionReference) {
                        errors.push("Transaction reference missing");
                    }
                    else if (jsonObj.statements.filter(test =>
                        item.transactionReference === test.transactionReference).length > 1) {
                        errors.push("Transaction is not unique");
                    }
                    else if (!item.accountNumber || !isValidIBAN(item.accountNumber)) {
                        errors.push("Invalid account number");
                    } else if (!item.startBalance || isNaN(item.startBalance)) {
                        errors.push("Start Balance invalid");
                    } else if (!item.mutation || isNaN(item.mutation)) {
                        errors.push("Mutation invalid");
                    } else if (!item.endBalance || isNaN(item.endBalance) || item.startBalance + item.mutation !== item.endBalance) {
                        errors.push("EndBalance invalid");
                    }
                    const statement: CustomerStatement = new CustomerStatement(item.transactionReference as string,
                        item.accountNumber as string, item.startBalance as number, item.mutation as number, item.description as string, item.endBalance as number);
                    reportItems.push(new CustomerStatementReportItem(statement, item.transactionReference, errors, errors.length > 0 ? "FAIL":"SUCCESS"));
                });
            return new CustomerStatementsReport(key, reportItems);
        } catch(error) {
            console.log('Error Could not parse Customer Statement XML. the parser returned error ' +
            `code ${error.err.code} with message ${error.err.msg} for line number ${error.err.line}`);
            reportItems.push(new CustomerStatementReportItem(undefined, undefined,
                ["Customer statement XML file does not contain customerStatements root element"], "FAILED"));
            return new CustomerStatementsReport(key, reportItems);
        }
    }

}
