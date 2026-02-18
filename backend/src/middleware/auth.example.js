// Example usage for authentication

/*
HOW TO USE:

1. In your auth controller (login/register):
   import { generateToken } from "../utils/jwt.js";
   
   const token = generateToken({
     id: user._id,
     email: user.email,
     role: user.role
   });
   
   res.json({ success: true, token });

2. To protect a route:
   import { protect, authorize } from "../middleware/auth.js";
   
   // Protect route (any authenticated user)
   router.get("/profile", protect, getProfile);
   
   // Protect + role check (admin only)
   router.delete("/users/:id", protect, authorize("admin"), deleteUser);
   
   // Multiple roles
   router.post("/materials", protect, authorize("teacher", "admin"), createMaterial);

3. Access user info in controller:
   export const getProfile = (req, res) => {
     console.log(req.user.id);    // User ID from token
     console.log(req.user.role);  // User role from token
   };
*/
