export function validatePassword(password) {

    const minLength = password.length >= 6;

    const specialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!minLength) {
        throw new Error('La contraseña debe tener mínimo 6 caracteres');
    }

    if (!specialCharacter) {
        throw new Error('La contraseña debe tener al menos 1 carácter especial');
    }
}

export function validateEmail(email) {

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!validEmail) {
        throw new Error('El email no tiene un formato válido');
    }
}

export function validateAdult(birthDate) {
    const today = new Date();

    const birth =
        new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();

    const monthDifference = today.getMonth() - birth.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    if (age < 18) {
        throw new Error('Debe ser mayor de 18 años para registrarte');
    }
}