# edmunds-aggregator

Run: 

./app.js aggregate:data --apiKey="[api_key]"

This will iterate over all the makes and models in the Edmunds API and pull the styles for each of them.  To keep under rate limits, only two requests are sent a minute.  This command takes around 10 minutes to complete.  When it's done, it will generate a file called allMakeModelData.json.

Once the aggregate data command has been run, you can see what body styles exist across all makes and models by running:

./app.js generate:styles --fileName=allMakeModelData.json

This will generate a file called "styles.json" that contains an array listing all the body styles that exist.  At the time of this writing there are 56.
