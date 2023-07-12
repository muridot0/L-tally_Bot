const axios = require('axios')
const jwt_decode = require('jwt-decode')
const { AuthService } = require('./auth-service')
const { v4 } = require('uuid')

class TallyService {
  constructor() {
    this.url = 'https://api.muri-o.com/'
  }

  async getValidToken() {
    const login = new AuthService()

    let exp = false

    let authToken = login.getToken('JWT_TOKEN')

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

  async getSpace(spaceName) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await this.getValidToken()}`
    }

    return axios
      .get(`${this.url}space?spaceName=${spaceName}`, { headers: headers })
      .then((res) => {
        const result = res.data.data[0]
        let id = null
        let space = null
        if(result){
          id=result._id
          space = result.spaceName
        }
        return {result, id, space}
      })
  }

  async addSpace(space, userName) {
    const login = new AuthService()

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await this.getValidToken()}`
    }

    let id = v4()

    let spaceData = {
      _id: id,
      userId: login.getId('DISCORD_SERVER_ID'),
      spaceName: space,
      route: `/${space}/${id}`
    }

    let tallyData = {
      _id: v4(),
      spaceId: id,
      tallyName: userName,
      tallyNumber: 1
    }

    return axios.post(`${this.url}space`, spaceData, { headers: headers}).then(() => {
      return axios.post(`${this.url}tally`, tallyData, { headers: headers })
    })
  }

  async addTally(spaceName, userName) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await this.getValidToken()}`
    }

    const res = await this.getSpace(spaceName)

    let tallyData = {
      _id: v4(),
      spaceId: res.id,
      tallyName: userName,
      tallyNumber: 1
    }

    return axios.post(`${this.url}tally`, tallyData, { headers: headers })
  }

  async getTalliesInASpace(spaceName){
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await this.getValidToken()}`
    }

    const res = await this.getSpace(spaceName)
    console.log(res)

    return axios.get(`${this.url}tally?spaceId=${res.id}`, {headers: headers}).then(res => {
      return res.data.data
    })
  }

  async getTallyNumberByUserName(name) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await this.getValidToken()}`
    }

    return axios
      .get(`${this.url}tally?tallyName=${name}`, {
        headers: headers
      })
      .then((res) => {
        const result = res.data.data[0]
        let name = null
        let number = null
        if (result) {
          name = result.tallyName
          number = result.tallyNumber
        }
        return { result, name, number }
      })
      .catch((err) => err)
  }

  async patchTallyNumber(count, name) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await this.getValidToken()}`
    }

    return axios
      .patch(
        `${this.url}tally?tallyName=${name}`,
        { tallyNumber: count + 1 },
        { headers: headers }
      )
      .then((res) => {
        return res.data[0]
      })
      .catch((err) => {
        if (err.response) {
          console.log(`Error Response: ${err.response}`)
        } else if (err.request) {
          console.log(`Error Request: ${err.resquest}`)
        } else {
          console.log(`Error Message: ${err.message}`)
        }
      })
  }
}

module.exports = {
  TallyService
}
