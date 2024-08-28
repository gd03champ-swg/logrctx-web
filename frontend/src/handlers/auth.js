//auth.js
import { AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';
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

export const logout = () => {
    const user = userpool.getCurrentUser();
    user.signOut();
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
