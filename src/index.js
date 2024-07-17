const express = require("express");
const { StatusCodes } = require("http-status-codes");
const { ServerConfig, Logger } = require("./config");

const apiRoutes = require("./routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT, () => {
    console.log(`APP RUNNING ON PORT -> ${ServerConfig.PORT}`);
    Logger.info( "Successfully Started Server",{} );
});

app.get("/", (req, res) => {
    res.status(StatusCodes.OK).json(
        {
            "msg" : "Working"
        }
    );
});
