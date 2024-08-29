//auth.js
import { AuthenticationDetails, CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';
import { CognitoAccessToken, CognitoIdToken,CognitoRefreshToken } from 'amazon-cognito-identity-js';
import { jwtDecode } from 'jwt-decode';

import userpool from './userpool';

export const authenticate=(Email,Password)=>{
    return new Promise((resolve,reject)=>{
        const user=new CognitoUser({
            Username:Email,
            Pool:userpool
        });

        const authDetails= new AuthenticationDetails({
            Username:Email,
            Password
        });

        user.authenticateUser(authDetails,{
            onSuccess:(result)=>{
                console.log("login successful");
                resolve(result);
            },
            onFailure:(err)=>{
                console.log("login failed",err);
                reject(err);
            }
        });
    });
};


export const authenticateWithSSOTokens = (idToken, accessToken) => {
    return new Promise((resolve, reject) => {
        try {
            // Create CognitoIdToken and CognitoAccessToken instances
            const cognitoIdToken = new CognitoIdToken({ IdToken: idToken });
            const cognitoAccessToken = new CognitoAccessToken({ AccessToken: accessToken });

            // Provide a minimal dummy RefreshToken
            const dummyRefreshToken = new CognitoRefreshToken({ RefreshToken: '' });

            // Create a new session from the tokens
            const session = new CognitoUserSession({
                IdToken: cognitoIdToken,
                AccessToken: cognitoAccessToken,
                RefreshToken: dummyRefreshToken,  // Include the dummy RefreshToken
            });

            // Decode the ID token to get user information
            const userEmail = jwtDecode(idToken).email;

            // Create a CognitoUser object manually
            const userData = {
                Username: userEmail, // Assuming the email is in the payload of the idToken
                Pool: userpool,
            };

            const user = new CognitoUser(userData);

            // Manually set the session for the user
            user.setSignInUserSession(session);

            // Store the user data for future retrieval
            //userpool.storage.setItem(`CognitoIdentityServiceProvider.${userpool.getClientId()}.${user.getUsername()}.userData`, JSON.stringify(user));

            console.log('SSO session set successfully');
            resolve(session);
        } catch (err) {
            console.log('SSO authentication failed', err);
            reject(err);
        }
    });
};


export const logout = () => {
    const user = userpool.getCurrentUser();
    user.signOut();
    localStorage.clear();
};

// Get the current user's access token
export const getAccessToken = () => {
    const user = userpool.getCurrentUser();
    if (user) {
        return new Promise((resolve, reject) => {
            user.getSession((err, session) => {
                if (err) {
                    console.error("Failed to get user session:", err);
                    reject(err);
                } else {
                    const accessToken = session.getAccessToken().getJwtToken();
                    resolve(accessToken);
                }
            });
        });
    } else {
        return Promise.reject(new Error("No user is currently logged in."));
    }
};

export const getIdToken = () => {
    const user = userpool.getCurrentUser();
    if (user) {
        return new Promise((resolve, reject) => {
            user.getSession((err, session) => {
                if (err) {
                    console.error("Failed to get user session:", err);
                    reject(err);
                } else {
                    const idToken = session.getIdToken().getJwtToken();
                    resolve(idToken);
                }
            });
        });
    } else {
        return Promise.reject(new Error("No user is currently logged in."));
    }
};
