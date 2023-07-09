const axios = require('axios')
const jwt_decode = require('jwt-decode')
const { AuthService } = require('./auth-service')

class TallyService {
  constructor(username) {
    this.username = username
    this.url = 'https://api.muri-o.com/'
  }

  async getValidToken() {
    const login = new AuthService()

    let exp = false

    let authToken = login.getToken('JWT_TOKEN')
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

    return authToken
  }

  async getTallyNumberByUserName() {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await this.getValidToken()}`
    }

    return axios
      .get(`${this.url}tally?tallyName=${this.username}`, {
        headers: headers
      })
      .then((res) => {
        const result = res.data.data[0]
        const name = result.tallyName
        const number = result.tallyNumber
        return { name, number }
      })
  }

  async patchTallyNumber() {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await this.getValidToken()}`
    }

    let { number } = await this.getTallyNumberByUserName()

    return axios.patch(
      `${this.url}tally?tallyName=${this.username}`,
      { tallyNumber: number + 1 },
      { headers: headers }
    ).then(res => {
      return res.data[0]
    })
  }
}

module.exports = {
  TallyService
}
