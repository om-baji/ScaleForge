const { CognitoUserPool } = require('amazon-cognito-identity-js')

const client_id = process.env.CLIENT_ID
const secret = process.env.CLIENT_SECRET

const poolData = {
    UserPoolId: id, 
    ClientId: id
}