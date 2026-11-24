<?php
session_start();
// Si ya había una sesión activa, entra directo al panel
if (isset($_SESSION['admin'])) {
    header("Location: admin_pedidos.php");
    exit();
}

include("conexion.php");
$error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $user = trim($_POST['usuario']);
    $pass = trim($_POST['password']);

    $stmt = $conexion->prepare("SELECT password FROM administradores WHERE usuario = ?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows == 1) {
        $stmt->bind_result($stored_password);
        $stmt->fetch();
        
        // Compara contraseña (si está en texto plano como '12345')
        if ($pass === $stored_password) {
            $_SESSION['admin'] = $user;
            header("Location: admin_pedidos.php");
            exit();
        } else {
            $error = "Contraseña incorrecta.";
        }
    } else {
        $error = "El usuario no existe.";
    }
    $stmt->close();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Administrador | Sweet Cakes</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body style="display: flex; justify-content: center; align-items: center; height: 100vh; background: var(--color-vino-oscuro);">

    <div class="order-form" style="width: 100%; max-width: 400px; text-align: center;">
        <h2 style="color: var(--color-vino); margin-bottom: 1rem; font-family: var(--fuente-titulos); font-size: 2.2rem;">Panel Admin</h2>
        <p style="color: var(--color-texto-suave); margin-bottom: 1.5rem;">Sweet Cakes - Acceso Restringido</p>

        <?php if (!empty($error)): ?>
            <p style="color: #c8233c; background: #fde8eb; padding: 0.6rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.88rem;"><?php echo $error; ?></p>
        <?php endif; ?>

        <form action="login.php" method="POST" style="text-align: left;">
            <label for="usuario">Usuario</label>
            <input type="text" id="usuario" name="usuario" required placeholder="Ej. admin">

            <label for="password">Contraseña</label>
            <input type="password" id="password" name="password" required placeholder="••••••">

            <button type="submit" class="btn-primary btn-full" style="margin-top: 1rem;">Ingresar al Panel</button>
        </form>
        <p style="margin-top: 1.2rem;"><a href="index.html" style="color: var(--color-rojo-carmesi); font-size: 0.85rem;">&larr; Volver al sitio principal</a></p>
    </div>

</body>
</html>