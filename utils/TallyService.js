const axios = require('axios')
const jwt_decode = require('jwt-decode')
const { AuthService } = require('./auth-service')
const fs = require('fs')
const path = require('path')
const os = require('os')
const envFilePath = path.resolve(__dirname, '../.env')

class TallyService {
  constructor(username) {
    this.username = username
  }

  async getTallyByUserName() {
    const login = new AuthService()

    let exp = false

    let authToken =  login.getToken('JWT_TOKEN')
    console.log(authToken)

    const decoded = jwt_decode(authToken)
    const now = new Date().getTime() / 1000

    if (now > decoded.exp) {
      exp = true
      console.log('Expired Token')
    }

    if (exp) {
      let res = await login.generateToken()
      authToken = res.token
      login.setToken('JWT_TOKEN', authToken)
      console.log('resetting token')
    }
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    }

    return axios
      .get(`https://api.muri-o.com/tally?tallyName=${this.username}`, {
        headers: headers
      })
      .then((res) => {
        return res
      })
  }
}

module.exports = {
  TallyService
}
