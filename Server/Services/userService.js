// services/userService.js
import Users from '../Model/Users.js';

export const getUserById = async (id) => {
  const user = await Users.findByPk(id);
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }
  return user;
};
