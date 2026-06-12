import fs from "fs"
const f = "c:/Users/Administrator/Desktop/前端框架技术考核要求/ai-tool-bazaar/generate-report.mjs"
let s = fs.readFileSync(f, "utf8")
s = s.replace(/“/g, "「").replace(/”/g, "」")
fs.writeFileSync(f, s)
console.log("fixed")
