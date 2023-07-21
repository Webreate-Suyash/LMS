import jwt from 'jsonwebtoken';
function jwtTokens({id,empid,name, email}){
    const user ={id,empid,name,email};
    const accessToken =jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'24h'});
    const refreshToken =jwt.sign(user,process.env.REFRESH_TOKEN_SECRET,{expiresIn:'10d'});
    return ({accessToken,refreshToken});
}
export {jwtTokens};