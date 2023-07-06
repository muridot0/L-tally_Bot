const axios = require('axios')
const fs = require('fs')
const path = require('path')
const os = require('os')
const envFilePath = path.resolve(__dirname, '../.env')

class AuthService {
  generateToken() {
    const username = 'notgr_server'
    const password = 'P@ssword123'
    const strategy = 'login'
    return axios
      .post('https://api.muri-o.com/authentication', {
        strategy,
        username,
        password
      })
      .then((res) => {
        const payload = res.data.authentication.payload
        const token = res.data.accessToken
        return {
          payload: payload,
          token: token
        }
      })
  }

  readEnvVars() {
    return fs.readFileSync(envFilePath, 'utf-8').split(os.EOL)
  }

  getToken(key) {
    // find the line that contains the key (exact match)
    const matchedLine = this.readEnvVars().find(
      (line) => line.split('=')[0] === key
    )
    // split the line (delimiter is '=') and return the item at index 2
    return matchedLine !== undefined ? matchedLine.split('=')[1] : null
  }

  setToken(key, value) {
    const envVars = this.readEnvVars()
    console.log(envVars)
    const targetLine = envVars.find((line) => line.split('=')[0] === key)
    if (targetLine !== undefined) {
      // update existing line
      const targetLineIndex = envVars.indexOf(targetLine)
      // replace the key/value with the new value
      envVars.splice(targetLineIndex, 1, `${key}=${value}`)
    } else {
      // create new key value
      envVars.push(`${key}="${value}"`)
    }
    // write everything back to the file system
    fs.writeFileSync(envFilePath, envVars.join(os.EOL))
  }
}

module.exports = { AuthService }
