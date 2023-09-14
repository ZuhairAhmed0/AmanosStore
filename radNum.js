const randomCard = [];
const crypto = require("crypto");

for (let i = 0; i < 8; i++) {
    const code = crypto.randomBytes(7).toString("hex");
    randomCard.push(code)
}
console.log(randomCard.join(","));