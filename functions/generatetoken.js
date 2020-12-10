exports.handler = function(context, event, callback) {
    const TWILIO_ACCOUNT_SID = context.TWILIO_ACCOUNT_SID;
    const TWILIO_API_KEY_SID = context.TWILIO_API_KEY_SID;
    const TWILIO_API_KEY_SECRET = context.TWILIO_API_KEY_SECRET;
    // create random accesstokenidentity for every participant that will join the group
    const ACCESS_TOKEN_IDENTITY =
      Math.random()
        .toString(36)
        .substring(2, 15);

    const ROOM_NAME = 'myfirstvideoapp';  // fixed room name
    const AccessToken = require('twilio').jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;
    
    // enable client to use video, only for this room 
    const videoGrant = new VideoGrant({
        room: ROOM_NAME
    });

    const accessToken = new AccessToken(TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET);
    
    accessToken.addGrant(videoGrant); //Add the grant to the token
    accessToken.identity = ACCESS_TOKEN_IDENTITY;
    callback(null, {
        token: accessToken.toJwt() 
        // Serialize the token to a JWT string (JSON Web token)
        // sent in the HTTP request (from client to server) to validate the authenticity of the client
        // Serializing tokens allow programmers to write multiprocessor-safe code without themselves 
        // needing to be aware of every single entity that may also be holding the same token.
    });
};