import { verifyToken } from "../../utils/jwt.js";

export const requireAuth =  (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const decoded = verifyToken(token)

    req.user = decoded

    next()

} catch (error) {
    return res.status(500).json({
      success: false,
      message: "There was an error in authenticating",
    });
  }
};



export const requirePermissions = (...requiredPermissions) => {
    return (req, res, next) => {
    if (requiredPermissions.length === 0) return next();

    const user = req.user;
    console.log(user)
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const userPermissions = user.permissions

    console.log(userPermissions)
    const hasPermission = requiredPermissions.every((permissionName) => {
      if (Array.isArray(userPermissions)) {
        return userPermissions.includes(permissionName);
      }
      if (userPermissions && typeof userPermissions === "object") {
        return Boolean(userPermissions[permissionName]);
      }
      return false;
    });

    if (!hasPermission) {
      return res
        .status(403)
        .json({ success: false, message: "Access is Forbidden. Not enough permissions" });
    }

    return next();
    }
}