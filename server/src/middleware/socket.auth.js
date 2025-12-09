// socket.auth.js
const authSvc = require("../module/auth/auth.service");
const { appConfig } = require("../config/const.config");
const jwt = require("jsonwebtoken");

module.exports = async (socket, next) => {
  try {
    let token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization ||
      null;

    if (!token) {
      return next(new Error("Token expected"));
    }

    // remove "Bearer "
    token = token.split(" ").pop();

    // Lookup session like REST does
    const sessionDetail = await authSvc.getSessionDataUsingToken({
      "actualToken.maskedToken": token,
    });

    if (!sessionDetail) {
      return next(new Error("Invalid session token"));
    }

    // jwt verify
    const payload = jwt.verify(
      sessionDetail.actualToken.actualToken,
      appConfig.web_token
    );

    if (payload.type !== "Bearer") {
      return next(new Error("Invalid token type"));
    }

    // get user
    const userDetails = await authSvc.getSingleById({ _id: payload.sub });

    if (!userDetails) {
      return next(new Error("User not found"));
    }

    socket.user = (userDetails);

    next();
  } catch (err) {
    console.error("Socket auth failed:", err);
    next(new Error("Authentication failed"));
  }
};
