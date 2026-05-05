# Moderno Access Virtual Plate

Simulador local de placa de control de acceso compatible con Moderno Access.
Permite probar integraciones sin necesidad de hardware físico.

## Características
- Simulación de endpoints TNG PRO / SEMAC / CHIYU.
- Panel de control web premium para monitoreo en tiempo real.
- Configuración flexible mediante `config.json` y `.env`.
- Simulación de latencia y estados de seguridad.

## Instalación

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar el puerto y parámetros en `.env`:
   ```env
   PORT=8080
   LATENCY_MS=0
   ```

3. Iniciar el simulador:
   ```bash
   npm start
   ```

## Endpoints Simulados
- `GET /status.htm`: Estado visual rápido.
- `GET /status.cgi`: Estado para integración de software.
- `GET /man.cgi?type=door_on&securitystate=10000000`: Apertura remota.
- `GET /if.cgi?type=go_log_page`: Consulta de logs.
- `GET /if.cgi?type=go_user_page`: Consulta de usuarios.

## Panel de Control
Accede a `http://localhost:8080` para ver el estado de las puertas, logs recientes y usuarios demo.
