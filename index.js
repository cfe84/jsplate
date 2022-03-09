const global = {}
global.fs = require("fs")

const report_file = process.argv[2]

if (!report_file) {
  console.log(`Error: jsplate template.md [arguments]`)
  process.exit(-1)
}

const report_content = global.fs.readFileSync(report_file).toString()
const report_lines = report_content.split("\n").map(line => line.replace("\r", ""))

async function renderJsValue(val) {
  if (val === undefined || val === null) {
    return ""
  }
  function getRowSep(len) {
    let sep = "|"
    for (let i = 0; i < len; i++) {
      sep += " --- |"
    }
    return sep
  }
  if (Array.isArray(val)) {
    return val.map((row, i) => {
      if (Array.isArray(row)) {
        let r = `| ${row.join(" | ")} |`
        if (i === 0) {
          r += "\n" + getRowSep(row.length)
        }
        return r
      } else {
        return `- ${row}`
      }
    }).join("\n")
  } else if (typeof (val) === "object") {
    return JSON.stringify(val, null, 2)
  } else {
    return val
  }
}

async function evalSafe(lineNumber, js, isInline) {
  try {
    if (isInline) {
      js = `return ${js}`
    }
    res = await eval(`(async () => { ${js} })()`)
    return await renderJsValue(res)
  } catch (err) {
    console.error(`---\nError on line ${lineNumber} while interpreting:\n\n${js}\n---\n\n` + err)
    if (isInline) {
      return "${" + js + "}"
    } else {
      return `\`\`\`js
${js}
\`\`\``
    }
  }
}

let accumulating = false
let accumulator = []
let accumulatedText = ""
let lineNumber = 0

async function run() {
  for (let line of report_lines) {
    if (accumulating) {
      if (line.startsWith("```")) {
        accumulating = false
        let js = accumulator.join("\n")
        let res = await evalSafe(lineNumber, js, false)
        console.log(res)
      } else {
        accumulator.push(line)
        accumulatedText += line + "\n"
      }
    } else if (line.startsWith("```js")) {
      accumulating = true
      accumulatedText = line
      accumulator = []
    } else {
      const matches = line.matchAll(/\${([^}]+)}/g)
      for (let match of matches) {
        line = line.replace(match[0], await evalSafe(lineNumber, match[1], true))
      }
      console.log(line)
    }
    lineNumber++
  }
}
run().then()