const axios = require('axios')
const {AuthService} = require('./auth-service')

class TallyService {
  static getTallyByUserName(username) {
    return axios.post(`https://api.muri-o.com/tally?tallyName=${username}`)
  }
}

module.exports = {
  TallyService
}