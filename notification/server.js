import "dotenv/config";
import app from "./src/app.js";

const PORT = 4000;

app.listen(PORT, () => {
    console.log(`Notification server is running on port ${PORT}`);
});