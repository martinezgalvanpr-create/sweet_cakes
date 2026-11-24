<?php
// Guardar pedido enviado desde contacto.html
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['nuevo_pedido'])) {
    header('Content-Type: application/json; charset=utf-8');
    include("conexion.php");

    $nombre_cliente = trim($_POST['nombre'] ?? '');
    $telefono = trim($_POST['telefono'] ?? '');
    $detalle_productos = trim($_POST['detalle_productos'] ?? '');
    $forma_entrega = trim($_POST['entrega'] ?? '');
    $fecha_entrega = $_POST['fecha'] ?? '';
    $forma_pago = "En línea / Efectivo";

    $stmt = $conexion->prepare("INSERT INTO pedidos (nombre_cliente, telefono, detalle_productos, forma_entrega, fecha_entrega, forma_pago) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $nombre_cliente, $telefono, $detalle_productos, $forma_entrega, $fecha_entrega, $forma_pago);

    if ($stmt->execute()) {
        echo json_encode(["exito" => true, "id" => $conexion->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(["exito" => false, "mensaje" => $stmt->error]);
    }

    $stmt->close();
    $conexion->close();
    exit();
}

// Manejo de sesión y cierre de sesión
session_start();

if (isset($_GET['cerrar'])) {
    $_SESSION = [];
    session_destroy();
    header("Location: login.php");
    exit();
}

if (!isset($_SESSION['admin'])) {
    header("Location: login.php");
    exit();
}

include("conexion.php");

$resultado = $conexion->query("SELECT * FROM pedidos ORDER BY id DESC");
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Administración | Sweet Cakes</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>

    <header class="site-header">
        <a href="index.html" class="brand-logo">
            <strong>SWEET CAKES</strong>
            <span>PANEL DE CONTROL</span>
        </a>
        <nav class="main-nav">
            <ul>
                <li><span style="font-weight: 600; color: var(--color-vino);">Hola, <?php echo htmlspecialchars($_SESSION['admin']); ?></span></li>
                <li><a href="admin_pedidos.php?cerrar=1" style="color: var(--color-rojo-carmesi);">Cerrar Sesión</a></li>
            </ul>
        </nav>
    </header>

    <main style="padding: 3rem 5%;">
        <div class="category-header">
            <h2>Gestión de Pedidos Recientes</h2>
        </div>

        <div style="background: var(--color-crema-tarjeta); padding: 1.5rem; border-radius: var(--radio-borde); box-shadow: var(--sombra-suave); overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                <thead>
                    <tr style="background: var(--color-rosa-suave); color: var(--color-vino-oscuro);">
                        <th style="padding: 10px;">ID</th>
                        <th style="padding: 10px;">Cliente</th>
                        <th style="padding: 10px;">Teléfono</th>
                        <th style="padding: 10px;">Productos y Detalles</th>
                        <th style="padding: 10px;">Entrega</th>
                        <th style="padding: 10px;">Pago</th>
                        <th style="padding: 10px;">Fecha Registro</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if ($resultado && $resultado->num_rows > 0): ?>
                        <?php while($row = $resultado->fetch_assoc()): ?>
                            <tr style="border-bottom: 1px solid var(--color-rosa-suave);">
                                <td style="padding: 10px; font-weight: bold;">#<?php echo $row['id']; ?></td>
                                <td style="padding: 10px;"><?php echo htmlspecialchars($row['nombre_cliente']); ?></td>
                                <td style="padding: 10px;"><?php echo htmlspecialchars($row['telefono']); ?></td>
                                <td style="padding: 10px;"><?php echo nl2br(htmlspecialchars($row['detalle_productos'])); ?></td>
                                <td style="padding: 10px;"><?php echo ucfirst($row['forma_entrega']); ?><br><small><?php echo $row['fecha_entrega']; ?></small></td>
                                <td style="padding: 10px;"><?php echo ucfirst($row['forma_pago']); ?></td>
                                <td style="padding: 10px; font-size: 0.8rem; color: var(--color-texto-suave);"><?php echo $row['fecha_registro']; ?></td>
                            </tr>
                        <?php endwhile; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="7" style="text-align: center; padding: 2rem; color: var(--color-texto-suave);">No hay pedidos registrados todavía.</td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </main>

</body>
</html>