import "dotenv/config"
import app from './src/app.js';

const PORT = 3000;
const server = app.listen(PORT, ()=>
{
    console.log(`Server is running on ${PORT}`)
})

