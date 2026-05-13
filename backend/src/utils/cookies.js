function setAuthCookie(res, token) {
  res.cookie("access_token", token, {
    httpOnly: true,
    secure: false, // true en producción
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 2
  });
}

function clearAuthCookie(res) {
  res.clearCookie("access_token");
}

export { setAuthCookie, clearAuthCookie };