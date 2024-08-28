data = {
    "user": {
        "username": "gsnish25255@gmail.com",
        "pool": {
            "userPoolId": "ap-southeast-1_crJBQ7yo6",
            "clientId": "4kqil27q4dcielr3vbdqqemkm5",
            "client": {
                "endpoint": "https://cognito-idp.ap-southeast-1.amazonaws.com/",
                "fetchOptions": {}
            },
            "advancedSecurityDataCollectionFlag": true,
            "storage": {}
        },
        "Session": null,
        "client": {
            "endpoint": "https://cognito-idp.ap-southeast-1.amazonaws.com/",
            "fetchOptions": {}
        },
        "signInUserSession": null,
        "authenticationFlowType": "USER_SRP_AUTH",
        "storage": {},
        "keyPrefix": "CognitoIdentityServiceProvider.4kqil27q4dcielr3vbdqqemkm5",
        "userDataKey": "CognitoIdentityServiceProvider.4kqil27q4dcielr3vbdqqemkm5.gsnish25255@gmail.com.userData"
    },
    "userConfirmed": false,
    "userSub": "392a457c-80f1-7036-26b2-680c797aab56",
    "codeDeliveryDetails": {
        "AttributeName": "email",
        "DeliveryMedium": "EMAIL",
        "Destination": "g***@g***"
    }
}

isMailSent = (!data.userConfirmed) && (data.codeDeliveryDetails.DeliveryMedium === 'EMAIL');