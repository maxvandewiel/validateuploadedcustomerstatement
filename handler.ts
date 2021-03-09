import CustomerStatementS3Client from './src/utils/s3'
import CustomerStatementXmlValidator from './src/utils/xmlValidator';
import CustomerStatementCsvValidator from './src/utils/csvValidator';
import CustomerStatementDynamoClient from './src/utils/dynamodb';


import {
    Handler, S3Event
} from "aws-lambda";
import CustomerStatementsReport from "./src/model/customerStatementsReport";
import CustomerStatementReportItem from "./src/model/customerStatementReportItem";

/**
 * This Lambda function validates the uploaded customer statement file.
 *
 * If the file is valid and contains valid data then the data is processed and persisted, otherwise the errors will be logged for monitoring and
 * the invalid or contaminated file will be put into a containment bucket for further analyses
 */
const validateUploadedCustomerStatementHandler: Handler =  async (
    event: S3Event,
): Promise<void> => {
    if (!event.Records || event.Records.length === 0) {
        return;
    }
    const dbClient: CustomerStatementDynamoClient = new CustomerStatementDynamoClient();
    const srcKey: string = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
    console.log(JSON.stringify(event.Records[0], null, 2))
    //const srcBucket: string = event.Records[0].s3.bucket.name;
    //const dropBucket: string = srcBucket + '-containment';
    const s3Client: CustomerStatementS3Client = new CustomerStatementS3Client();

    // Infer the file type from the file suffix for pre validating the content type implied.
    const typeMatch: RegExpMatchArray | null = srcKey.match(/\.([^.]*)$/);
    if (!typeMatch) {
        console.error("Could not determine the file type.");
        const reportItems: Array<CustomerStatementReportItem> = new Array<CustomerStatementReportItem>();
        reportItems.push(new CustomerStatementReportItem(undefined, undefined,
            ["File type of cutomer statement document could not be determined"], "FAILED"));
        let report: CustomerStatementsReport = new CustomerStatementsReport(srcKey, reportItems);
        await dbClient.write(report);
        await s3Client.getCustomerStatement(srcKey)
            .then(() => s3Client.removeCustomerStatementFromOriginal(srcKey));
    } else {
        // Check that the file type extention is supported [xml and csv]
        const fileType = typeMatch[1].toLowerCase();
        if (fileType !== "csv" && fileType !== "xml") {
            console.log(`Unsupported file type: ${fileType}`);
            const reportItems: Array<CustomerStatementReportItem> = new Array<CustomerStatementReportItem>();
            reportItems.push(new CustomerStatementReportItem(undefined, undefined,
                ["File type of customer statement is not supported"], "FAILED"));
            let report: CustomerStatementsReport = new CustomerStatementsReport(srcKey, reportItems);
            await dbClient.write(report);
            await s3Client.getCustomerStatement(srcKey)
                .then(() => s3Client.removeCustomerStatementFromOriginal(srcKey));
        }
        try {
            return await new CustomerStatementS3Client().readCustomerStatementAsString(srcKey)
                .then(result => {
                    if (fileType === 'csv') {
                        const csvValidator: CustomerStatementCsvValidator = new CustomerStatementCsvValidator()
                        return csvValidator.validateCustomerStatementCsvContent(result, srcKey)
                            .then(validated => {
                                dbClient.write(validated);
                                if (validated && validated.reportItems.filter(x => x.transactionReference == 'FAILED').length > 1) {
                                    s3Client.getCustomerStatement(srcKey)
                                        .then(() => s3Client.removeCustomerStatementFromOriginal(srcKey));
                                }
                                return;
                            })
                            ;
                    } else {
                        const xmlValidator: CustomerStatementXmlValidator = new CustomerStatementXmlValidator();
                        return xmlValidator.validateCustomerStatementXmlContent(result, srcKey)
                            .then(validated => {
                                dbClient.write(validated);
                                if (validated && validated.reportItems.filter(x => x.transactionReference == 'FAILED').length > 1) {
                                    s3Client.getCustomerStatement(srcKey)
                                        .then(() => s3Client.removeCustomerStatementFromOriginal(srcKey));
                                }
                                return;
                            });

                    }
                });

        } catch (error: any) {
            console.log(`unexpected error while trying to validate file content ${error.message}`);
        }
    }
}
export {validateUploadedCustomerStatementHandler}


