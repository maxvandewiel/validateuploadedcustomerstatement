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
const dynamodb_1 = require("aws-sdk/clients/dynamodb");
class CustomerStatementDynamoClient {
    constructor(table = process.env.CUSTOMER_STATEMENT_TABLE) {
        this.docClient = new dynamodb_1.default.DocumentClient();
        this.table = table;
    }
    readAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.docClient.scan({ TableName: this.table }).promise();
            return data.Items;
        });
    }
    read(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var params = {
                TableName: this.table,
                Key: { id: id },
            };
            const data = yield this.docClient.get(params).promise();
            return data.Item;
        });
    }
    write(Item) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                TableName: this.table,
                Item,
            };
            return yield this.docClient.put(params).promise();
        });
    }
}
exports.default = CustomerStatementDynamoClient;
//# sourceMappingURL=dynamodb.js.map