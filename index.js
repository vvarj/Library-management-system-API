require('./db/mongoose')
const express = require('express')
const userRouter = require('./routers/user')
const adminRouter = require('./routers/admin')


const app = express()
const port = 3000

app.use(express.json())
app.use(userRouter)
app.use(adminRouter)



app.listen(port, () => {
    console.log('Server is up on port ' + port)
})