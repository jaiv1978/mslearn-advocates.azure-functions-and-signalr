import { app, output, CosmosDBv4FunctionOptions, InvocationContext } from "@azure/functions";

const goingOutToSignalR = output.generic({
    type: 'signalR',
    name: 'signalR',
    hubName: 'default',
    connectionStringSetting: 'Endpoint=https://msl-sigr-signalr148f581c48.service.signalr.net;AccessKey=KhoRFm9cawZjrJ7vwNuPa0tdRvBUhcOn5etYnOZItRISDN986wrLJQQJ99BBACYeBjFXJ3w3AAAAASRSVJnn;Version=1.0;',
});

export async function dataToMessage(documents: unknown[], context: InvocationContext): Promise<void> {

    try {

        context.log(`Documents: ${JSON.stringify(documents)}`);

        documents.map(stock => {
            // @ts-ignore
            context.log(`Get price ${stock.symbol} ${stock.price}`);
            context.extraOutputs.set(goingOutToSignalR,
                {
                    'target': 'updated',
                    'arguments': [stock]
                });
        });
    } catch (error) {
        context.log(`Error: ${error}`);
    }
}

const options: CosmosDBv4FunctionOptions = {
    connection: 'AccountEndpoint=https://signalr-cosmos-5eabf1296f.documents.azure.com:443/;AccountKey=gh1JG7Pib17TX0n3wXNujtsike5AFPmU9jBaCL8ufDpqvsAPQHsYUrHzs0OneweGkwJ9s790FbO6ACDbZZYalA==;',
    databaseName: 'stocksdb',
    containerName: 'stocks',
    createLeaseContainerIfNotExists: true,
    feedPollDelay: 500,
    handler: dataToMessage,
    extraOutputs: [goingOutToSignalR],
};

app.cosmosDB('send-signalr-messages', options);