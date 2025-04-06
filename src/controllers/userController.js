import User from "../models/userModel.js";
import Role from "../models/roleModel.js";
import { userCreatedEvent, passwordRecoveryEvent } from "../services/rabbitServices.js";
import jwt from 'jsonwebtoken';

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ include: Role });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    res.status(500).json({ message: "Error al listar usuarios" });
  } 
};

export const createUser = async (req, res) => {
  const { password, username, phone, roleId } = req.body;

  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    return res.status(400).json({ message: "El nombre de usuario ya existe" });
  }

  try {
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ message: "El teléfono ya existe" });
    }

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ message: "Rol no válido" });
    }
  } catch (error) {
    console.error("Error al verificar usuario, teléfono o rol:", error);
    return res.status(500).json({ message: "Error al verificar usuario o teléfono" });
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  if (!isValidEmail(username)) {
    return res.status(400).json({ message: "Correo no válido" });
  }

  if (!password || password.length < 8) {
    return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres" });
  }

  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ message: "El teléfono debe tener 10 dígitos" });
  }

  try {
    const newUser = await User.create({
      phone,
      username,
      password,
      roleId,
      status: true,
      creationDate: new Date(),
    });
    await userCreatedEvent(newUser);
    return res.status(201).json({ message: "Usuario creado correctamente", data: newUser });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ message: "Error al crear usuario" });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { password, phone, roleId } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (password && password.length < 8) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres" });
    }

    if (phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone && existingPhone.id !== id) {
        return res.status(400).json({ message: "El teléfono ya existe" });
      }
    }

    if (roleId) {
      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(400).json({ message: "Rol no válido" });
      }
    }

    await user.update({
      phone: phone || user.phone,
      password: password || user.password,
      roleId: roleId || user.roleId,
    });

    return res.status(200).json({ message: "Usuario actualizado correctamente", data: user });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return res.status(500).json({ message: "Error al actualizar usuario" });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(400).json({ message: 'No se ha encontrado el registro' });
    }

    if (!user.status) {
      return res.status(400).json({ message: 'El usuario ya ha sido eliminado' });
    }

    await user.update({ status: false });

    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const SECRET_KEY = process.env.SECRET_PASSWORD;

    if (!username || !password) {
      return res.status(400).json({ message: "Usuario y contraseña requeridos" });
    }

    const user = await User.findOne({ where: { username }, include: Role });

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    if (password !== user.password) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.Role.name },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ message: "Usuario logeado", data: token });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ message: "Error al logearse" });
  }
};

export const recoverPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "El correo es obligatorio" });
  }

  try {
    const user = await User.findOne({ where: { username: email } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await passwordRecoveryEvent({ email });

    return res.status(200).json({ message: "Correo de recuperación enviado" });
  } catch (error) {
    console.error("Error al enviar recuperación:", error);
    res.status(500).json({ message: "Error al enviar recuperación" });
  }
};
