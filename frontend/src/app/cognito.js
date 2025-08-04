import * as AWS from "aws-sdk/global";
import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: process.env.USER_ID,
  ClientId: process.env.CLIENT_ID,
};

const registerUser = (userData) => {
  return new Promise((resolve, reject) => {
    const userPool = new CognitoUserPool(poolData);
    var dataEmail = {
      Name: "email",
      Value: userData.email,
    };

    const attributeEmail = new CognitoUserAttribute(dataEmail);
    let attributeList = [];
    attributeList.push(attributeEmail);

    userPool.signUp(
      userData.userName,
      userData.password,
      attributeList,
      null,
      function (err, result) {
        if (err) {
          console.error("Registration error:", err);
          reject(new Error("Error in registration: " + err.message));
          return;
        }
        var cognitoUser = result.user;
        const username = cognitoUser.getUsername();
        console.log("User registered:", cognitoUser);

        localStorage.setItem("pendingUsername", username);

        resolve(username);
      }
    );
  });
};

const confirmation = (confirmationCode, username) => {
  return new Promise((resolve, reject) => {
    const userPool = new CognitoUserPool(poolData);

    const userData = {
      Username: username,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);
    cognitoUser.confirmRegistration(
      confirmationCode,
      true,
      function (err, result) {
        if (err) {
          console.error("Confirmation error:", err);
          reject(new Error("Wrong confirmation code"));
          return;
        }
        console.log("Confirmation result: " + result);
        resolve(result);
      }
    );
  });
};

const resendCode = (username) => {
  return new Promise((resolve, reject) => {
    const userPool = new CognitoUserPool(poolData);
    const userData = {
      Username: username,
      Pool: userPool,
    };
    const cognitoUser = new CognitoUser(userData);
    
    cognitoUser.resendConfirmationCode(function (err, result) {
      if (err) {
        console.error("Resend code error:", err);
        reject(new Error("Error resending code: " + err.message));
        return;
      }
      console.log("Resend code result: " + result);
      resolve(result);
    });
  });
};

const login = (userData) => {
  return new Promise((resolve, reject) => {
    var authenticationData = {
      Username: userData.username,
      Password: userData.password,
    };
    var authenticationDetails = new AuthenticationDetails(
      authenticationData
    );

    var userPool = new CognitoUserPool(poolData);
    var user = {
      Username: userData.username,
      Pool: userPool,
    };
    var cognitoUser = new CognitoUser(user);
    
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        var accessToken = result.getAccessToken().getJwtToken();
        var idToken = result.getIdToken().getJwtToken();
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('idToken', idToken);
        localStorage.setItem('currentUser', userData.username);

        console.log("Successfully logged in!");
        resolve({
          accessToken: accessToken,
          idToken: idToken,
          user: cognitoUser
        });
      },

      onFailure: function (err) {
        console.error("Login error:", err);
        reject(new Error("Login failed: " + err.message));
      },
    });
  });
};

const getUser = () => {
  return new Promise((resolve, reject) => {
    const userPool = new CognitoUserPool(poolData);
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      reject(new Error("No user logged in"));
      return;
    }

    cognitoUser.getSession((err, session) => {
      if (err) {
        console.error("Session error:", err);
        reject(new Error("User session expired"));
        return;
      }

      if (!session.isValid()) {
        reject(new Error("User session is invalid"));
        return;
      }

      cognitoUser.getUserAttributes(function (err, result) {
        if (err) {
          console.error("Get user error:", err);
          reject(new Error("Error getting user attributes: " + err.message));
          return;
        }
        
        const attributes = {};
        for (let i = 0; i < result.length; i++) {
          attributes[result[i].getName()] = result[i].getValue();
          console.log(
            'attribute ' + result[i].getName() + ' has value ' + result[i].getValue()
          );
        }
        
        resolve({
          username: cognitoUser.getUsername(),
          attributes: attributes
        });
      });
    });
  });
};

const logout = () => {
  return new Promise((resolve) => {
    const userPool = new CognitoUserPool(poolData);
    const cognitoUser = userPool.getCurrentUser();
    
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('currentUser');
    
    resolve();
  });
};

const isAuthenticated = () => {
  return new Promise((resolve) => {
    const userPool = new CognitoUserPool(poolData);
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      resolve(false);
      return;
    }

    cognitoUser.getSession((err, session) => {
      if (err || !session.isValid()) {
        resolve(false);
        return;
      }
      resolve(true);
    });
  });
};

export { registerUser, confirmation, resendCode, login, getUser, logout, isAuthenticated };
