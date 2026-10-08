require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const { AuthRouter } = require("./Routes/auth.routes")
const { OwnerRouter } = require("./Routes/owner.routes")
const { AdminRouter } = require("./Routes/admin.routes")
const { EmployeeRouter } = require("./Routes/employee.routes")
const { AnalyticsRouter } = require("./Routes/analytics.routes")
const { ChatRouter } = require("./Routes/chats.routes")
const cors = require("cors")
const cp = require("cookie-parser")
const http = require("http")
const { initSocket } = require("./socket")

// const { addUser } = require("./Utils/AddOwner")

const missingEnv = ["DB_URL", "JWT_SECRET", "CLIENT_URL"].filter((key) => !process.env[key])
if(missingEnv.length)
{
    console.log(`Missing environment variables : ${missingEnv.join(", ")}`)
    process.exit(1)
}

// comma separated list, e.g. "https://jeera.onrender.com,http://localhost:5173"
const allowedOrigins = process.env.CLIENT_URL
.split(",")
.map((origin) => origin.trim().replace(/\/+$/, ""))
.filter(Boolean)

const app = express()
const server = http.createServer(app)

// Render terminates HTTPS at its proxy; this makes req.secure true so secure cookies work
app.set("trust proxy", 1)

initSocket(server, allowedOrigins)


app.use(cors({
    origin : allowedOrigins,
    credentials : true // allowing browser to request cookies
}))

app.use(cp())
app.use(express.json())
app.use("/api/auth", AuthRouter)
app.use("/api/owner", OwnerRouter)
app.use("/api/admin", AdminRouter)
app.use("/api/employee", EmployeeRouter)
app.use("/api/analytics", AnalyticsRouter)
app.use("/api/chats", ChatRouter)

// used by Render's health check
app.get("/health", (req, res) => {
    res.status(200).json({ message : "OK" })
})

app.use((req, res) => {
    res.status(404).json({ message : "Route not found" })
})


// Registered synchronously at startup, so it runs after every router above.
// Express 5 forwards errors thrown in async handlers here automatically.
app.use((err, req, res, next) => {

    let status = err.status || 400
    let message = err.message

    if(err.code == 11000)
    {
        const field = Object.keys(err.keyValue || {})[0] || "value"
        status = 409
        message = `${field} already exists`
    }
    else if(err.name == "JsonWebTokenError" || err.name == "TokenExpiredError")
    {
        status = 401
        message = "Session expired, please log in again"
    }
    else if(err.name == "CastError")
    {
        status = 400
        message = "Invalid ID"
    }

    res
    .status(status)
    .json({
        message
    })
})


mongoose.connect(process.env.DB_URL)
.then(() => {
    // addUser("Testing123!", "DemoUser", "demo@something.com", "admin")
    console.log("Database connected")

    const port = process.env.PORT || 8080

    server.listen(port, () => {
        console.log(`Server Running on port ${port}`)
    })
})
.catch((error) => {
    console.log(`DB Connection failed : ${error.message}`)
    // exit so the host restarts the service instead of leaving it up without a DB
    process.exit(1)
})