import type { IUser } from "../../../types/IUser";
import { saveUser } from "../../../utils/localStorage";
import { navigate } from "../../../utils/navigate";

// Administrador de prueba: no se puede crear un usuario ADMIN bajo condiciones normales por seguridad
// EMAIL: admin@admin.com
// PASSWORD: admin
// ROL: admin


const formularioLogin = document.getElementById("formularioLogin") as HTMLFormElement;
const inputEmail = document.getElementById("inputEmail") as HTMLInputElement;
const inputPassword = document.getElementById("inputPassword") as HTMLInputElement;
const botonRegistro = document.getElementById("botonRegistro") as HTMLButtonElement;

botonRegistro.addEventListener("click", () => {
  navigate("/src/pages/auth/registro/registro.html");
});

formularioLogin.addEventListener("submit", (e: SubmitEvent) => {
  e.preventDefault();

  const correoIngresado = inputEmail.value;
  const passwordIngresada = inputPassword.value;

  // Usar estas credenciales para probar ADMIN
  const ADMIN_PRUEBA: IUser = {
    email: "admin@admin.com",
    password: "admin",
    role: "admin",
    loggedIn: false,
  };

  // obtener la lista de usuarios registrados
  const usuariosGuardados = localStorage.getItem("users");
  const listaUsuarios: IUser[] = usuariosGuardados ? JSON.parse(usuariosGuardados) : [];

  // buscar si existe un usuario que coincida
  let usuarioValidado: IUser | undefined;

  if (correoIngresado === ADMIN_PRUEBA.email && passwordIngresada === ADMIN_PRUEBA.password) {
    usuarioValidado = ADMIN_PRUEBA;
  } else {
    usuarioValidado = listaUsuarios.find(u => 
      u.email === correoIngresado && 
      u.password === passwordIngresada
    );
  }

  // logica de acceso
  if (usuarioValidado) {
    const sesionUsuario: IUser = {
      email: usuarioValidado.email,
      password: usuarioValidado.password,
      role: usuarioValidado.role,
      loggedIn: true,
    };

    // GUARDAMOS LA SESIÓN USANDO LA FUNCIÓN DE LOCALSTORAGE.TS
    saveUser(sesionUsuario);

    // redirección segun rol
    if (sesionUsuario.role === "admin") {
      navigate("/src/pages/admin/home/home.html");
    } else {
      navigate("/src/pages/client/home/home.html");
    }
  } else {
    // alerta por error
    alert("Email o contraseña incorrecta.");
  }
});