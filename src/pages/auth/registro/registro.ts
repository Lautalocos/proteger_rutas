import type { IUser } from "../../../types/IUser";
import { navigate } from "../../../utils/navigate";

const formularioRegistro = document.getElementById('formularioRegistro') as HTMLFormElement;
const inputEmail = document.getElementById('inputEmail') as HTMLInputElement;
const inputPassword = document.getElementById('inputPassword') as HTMLInputElement;


formularioRegistro.addEventListener('submit', (evento: SubmitEvent) => {
    evento.preventDefault();

    // capturamos los valores ingresados
    const emailIngresado = inputEmail.value;
    const passwordIngresada = inputPassword.value;

    // para obtener los datos del localStorage
    const usuariosEnTexto = localStorage.getItem('users');
    
    // convertir el texto a un array o creamos uno vacio
    const listaUsuarios: IUser[] = usuariosEnTexto ? JSON.parse(usuariosEnTexto) : [];

    // para evitar duplicados
    const usuarioYaExiste = listaUsuarios.some(usuario => usuario.email === emailIngresado);
    
    if (usuarioYaExiste) {
        alert("Este correo electrónico ya está registrado.");
        return;
    }

    // para crear nuevo usuario
    const nuevoUsuario: IUser = {
        email: emailIngresado,
        password: passwordIngresada,
        role: 'client', //para asignar por defecto rol de cliente. como no tiene que haber selector supuse que los usuarios nuevos son siempre clientes
        loggedIn: false
    };

    listaUsuarios.push(nuevoUsuario);
    localStorage.setItem('users', JSON.stringify(listaUsuarios));

    alert("Registro completado con éxito.");
    navigate("/src/pages/auth/login/login.html");


});