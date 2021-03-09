"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("fast-xml-parser/src/parser");
const ibantools_1 = require("ibantools");
const customerStatementReportItem_1 = require("../model/customerStatementReportItem");
const customerStatement_1 = require("../model/customerStatement");
const customerStatementsReport_1 = require("../model/customerStatementsReport");
const options = {
    attributeNamePrefix: "@_",
    attrNodeName: "attr",
    textNodeName: "#text",
    ignoreAttributes: true,
    ignoreNameSpace: false,
    allowBooleanAttributes: false,
    parseNodeValue: true,
    parseAttributeValue: false,
    trimValues: true,
    cdataTagName: "__cdata",
    cdataPositionChar: "\\c",
    parseTrueNumberOnly: false,
    arrayMode: false,
    stopNodes: ["parse-me-as-string"]
};
class CustomerStatementXmlValidator {
    validateCustomerStatementXmlContent(content, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const reportItems = new Array();
            try {
                const jsonObj = parser_1.default.parse(content, options, true);
                if (!jsonObj.statements) {
                    reportItems.push(new customerStatementReportItem_1.default(undefined, undefined, ["Customer statement XML file does not contain customerStatements root element"], "FAILED"));
                    return new customerStatementsReport_1.default(key, reportItems);
                }
                jsonObj.statements.forEach(item => {
                    const errors = new Array();
                    if (!item.transactionReference) {
                        errors.push("Transaction reference missing");
                    }
                    else if (jsonObj.statements.filter(test => item.transactionReference === test.transactionReference).length > 1) {
                        errors.push("Transaction is not unique");
                    }
                    else if (!item.accountNumber || !ibantools_1.isValidIBAN(item.accountNumber)) {
                        errors.push("Invalid account number");
                    }
                    else if (!item.startBalance || isNaN(item.startBalance)) {
                        errors.push("Start Balance invalid");
                    }
                    else if (!item.mutation || isNaN(item.mutation)) {
                        errors.push("Mutation invalid");
                    }
                    else if (!item.endBalance || isNaN(item.endBalance) || item.startBalance + item.mutation !== item.endBalance) {
                        errors.push("EndBalance invalid");
                    }
                    const statement = new customerStatement_1.default(item.transactionReference, item.accountNumber, item.startBalance, item.mutation, item.description, item.endBalance);
                    reportItems.push(new customerStatementReportItem_1.default(statement, item.transactionReference, errors, errors.length > 0 ? "FAIL" : "SUCCESS"));
                });
                return new customerStatementsReport_1.default(key, reportItems);
            }
            catch (error) {
                console.log('Error Could not parse Customer Statement XML. the parser returned error ' +
                    `code ${error.err.code} with message ${error.err.msg} for line number ${error.err.line}`);
                reportItems.push(new customerStatementReportItem_1.default(undefined, undefined, ["Customer statement XML file does not contain customerStatements root element"], "FAILED"));
                return new customerStatementsReport_1.default(key, reportItems);
            }
        });
    }
}
exports.default = CustomerStatementXmlValidator;
//# sourceMappingURL=xmlValidator.js.map