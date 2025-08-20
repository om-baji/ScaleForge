import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
  ISignUpResult,
  CognitoUserSession,
  CognitoUserAttribute as CognitoAttr,
} from "amazon-cognito-identity-js";

interface PoolData {
  UserPoolId: string;
  ClientId: string;
}

interface RegisterUserData {
  email: string;
  userName: string;
  password: string;
}

interface LoginUserData {
  username: string;
  password: string;
}

const poolData: PoolData = {
  UserPoolId: process.env.USER_ID as string,
  ClientId: process.env.CLIENT_ID as string,
};

const registerUser = (userData: RegisterUserData): Promise<string> => {
  return new Promise((resolve, reject) => {
    const userPool = new CognitoUserPool(poolData);
    const attributeEmail = new CognitoUserAttribute({
      Name: "email",
      Value: userData.email,
    });

    const attributeList: CognitoUserAttribute[] = [attributeEmail];

    userPool.signUp(
      userData.userName,
      userData.password,
      attributeList,
      [],
      (err, result) => {
        if (err || !result) {
          reject(new Error("Error in registration: " + (err?.message || "Unknown")));
          return;
        }
        const cognitoUser = result.user;
        const username = cognitoUser.getUsername();
        localStorage.setItem("pendingUsername", username);
        resolve(username);
      }
    );
  });
};

const confirmation = (confirmationCode: string, username: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const userPool = new CognitoUserPool(poolData);
    const userData = { Username: username, Pool: userPool };
    const cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
      if (err || !result) {
        reject(new Error("Wrong confirmation code"));
        return;
      }
      resolve(result);
    });
  });
};

const resendCode = (username: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const userPool = new CognitoUserPool(poolData);
    const userData = { Username: username, Pool: userPool };
    const cognitoUser = new CognitoUser(userData);

    cognitoUser.resendConfirmationCode((err, result) => {
      if (err || !result) {
        reject(new Error("Error resending code: " + (err?.message || "Unknown")));
        return;
      }
      resolve(result);
    });
  });
};

const login = (
  userData: LoginUserData
): Promise<{ accessToken: string; idToken: string; user: CognitoUser }> => {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: userData.username,
      Password: userData.password,
    });

    const userPool = new CognitoUserPool(poolData);
    const userDataObj = { Username: userData.username, Pool: userPool };
    const cognitoUser = new CognitoUser(userDataObj);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        const accessToken = result.getAccessToken().getJwtToken();
        const idToken = result.getIdToken().getJwtToken();
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("idToken", idToken);
        localStorage.setItem("currentUser", userData.username);
        resolve({ accessToken, idToken, user: cognitoUser });
      },
      onFailure: (err) => {
        reject(new Error("Login failed: " + err.message));
      },
    });
  });
};

const getUser = (): Promise<{ username: string; attributes: Record<string, string> }> => {
  return new Promise((resolve, reject) => {
    const userPool = new CognitoUserPool(poolData);
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      reject(new Error("No user logged in"));
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        reject(new Error("User session expired or invalid"));
        return;
      }

      cognitoUser.getUserAttributes((err, result) => {
        if (err || !result) {
          reject(new Error("Error getting user attributes: " + (err?.message || "Unknown")));
          return;
        }

        const attributes: Record<string, string> = {};
        result.forEach((attr: CognitoAttr) => {
          attributes[attr.getName()] = attr.getValue() || "";
        });

        resolve({ username: cognitoUser.getUsername(), attributes });
      });
    });
  });
};

const logout = (): Promise<void> => {
  return new Promise((resolve) => {
    const userPool = new CognitoUserPool(poolData);
    const cognitoUser = userPool.getCurrentUser();

    if (cognitoUser) {
      cognitoUser.signOut();
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("idToken");
    localStorage.removeItem("currentUser");

    resolve();
  });
};

const isAuthenticated = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const userPool = new CognitoUserPool(poolData);
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      resolve(false);
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        resolve(false);
        return;
      }
      resolve(true);
    });
  });
};

export { registerUser, confirmation, resendCode, login, getUser, logout, isAuthenticated };
