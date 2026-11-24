<?php
$host = "localhost";
$usuario = "root";
$password = "";
$base_datos = "sweet_cakes";

$conexion = new mysqli($host, $usuario, $password, $base_datos);

// Verificar conexión
if ($conexion->connect_error) {
    die("Error de conexión a la base de datos: " . $conexion->connect_error);
}

// Establecer conjunto de caracteres UTF-8
$conexion->set_charset("utf8");
?>
