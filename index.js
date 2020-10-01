const express = require("express")
const app = express()
app.use(express.static("go-by-arpan"))
const port = process.env.PORT || 4000
app.listen(port)