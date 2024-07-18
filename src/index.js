const express = require("express");
const CRON = require("./utils/cron.utils");
const { StatusCodes } = require("http-status-codes");
const { ServerConfig, Logger, Queue } = require("./config");

const apiRoutes = require("./routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT, async () => {
    console.log(`APP RUNNING ON PORT -> ${ServerConfig.PORT}`);
    Logger.info( "Successfully Started Server",{} );
    CRON();
    await Queue.connectQueue().then(console.log("QUEUE INITIATED"));
});

app.get("/", (req, res) => {
    res.status(StatusCodes.OK).json(
        {
            "msg" : "Working"
        }
    );
});
