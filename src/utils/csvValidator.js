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
const customerStatementsReport_1 = require("../model/customerStatementsReport");
const parse_1 = require("@fast-csv/parse");
const customerStatementReportItem_1 = require("../model/customerStatementReportItem");
const ibantools_1 = require("ibantools");
class CustomerStatementCsvValidator {
    validateCustomerStatementCsvContent(content, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const reportItems = new Array();
            const stream = parse_1.parse({ headers: true })
                .transform((data) => ({
                transactionReference: data.transactionReference,
                accountNumber: data.accountNumber,
                startBalance: data.startBalance,
                mutation: data.mutation,
                description: data.description,
                endBalance: data.endBalance
            }))
                .on('error', error => {
                console.error(error);
                reportItems.push(new customerStatementReportItem_1.default(undefined, undefined, [`Failed to parse csv file records`], "FAILED"));
            })
                .on('data', (row) => {
                const errors = new Array();
                if (!row.transactionReference) {
                    errors.push("Transaction reference missing");
                }
                else if (!row.accountNumber || !ibantools_1.isValidIBAN(row.accountNumber)) {
                    errors.push("Invalid account number");
                }
                else if (!row.startBalance || isNaN(row.startBalance)) {
                    errors.push("Start Balance invalid");
                }
                else if (!row.mutation || isNaN(row.mutation)) {
                    errors.push("Mutation invalid");
                }
                else if (!row.endBalance || isNaN(row.endBalance) || row.startBalance +
                    row.mutation !== row.endBalance) {
                    errors.push("EndBalance invalid");
                }
                reportItems.push(new customerStatementReportItem_1.default(row, row.transactionReference, errors, errors.length > 0 ? "FAIL" : "SUCCESS"));
                console.log(JSON.stringify(row));
            })
                .on('end', (rowCount) => {
                console.log(`Parsed ${rowCount} rows`);
            });
            stream.write(content);
            stream.end();
            reportItems.forEach(it => {
                if (reportItems.filter(x => x.transactionReference == it.transactionReference).length > 1) {
                    if (it.errorMessages === undefined) {
                        it.errorMessages = new Array();
                    }
                    it.errorMessages.push("Transaction is not unique");
                    it.status = "FAIL";
                }
            });
            return new customerStatementsReport_1.default(key, reportItems);
        });
    }
}
exports.default = CustomerStatementCsvValidator;
//# sourceMappingURL=csvValidator.js.map